"""
Timer Manager - Manages all active auction timers
"""
import time
import threading
from typing import Dict, Set, List
from decimal import Decimal
from datetime import datetime, timezone
from shared.redis.client import RedisHelper, RedisKeys
from shared.database.connection import SessionLocal
from shared.models.auction import Auction
from shared.models.user import User
from shared.aws.sqs_client import sqs_client
from shared.utils.helpers import get_current_timestamp_ms, calculate_time_remaining
from shared.config.settings import settings
import logging

logger = logging.getLogger(__name__)


class TimerManager:
    """Manages auction timers and broadcasts updates"""

    def __init__(self):
        self.redis_helper = RedisHelper()
        self.redis_client = self.redis_helper.client
        self.running = False
        self.active_auctions: Set[str] = set()
        self.last_sync_time = 0

    def start(self):
        """Start timer manager"""
        if self.running:
            return

        self.running = True
        logger.info("Timer Manager started")

        # Load active auctions from database
        self._load_active_auctions()

        # Start timer loop
        self._timer_loop()

    def stop(self):
        """Stop timer manager"""
        self.running = False
        logger.info("Timer Manager stopped")

    def _load_active_auctions(self):
        """Load all active auctions from database"""
        db = SessionLocal()
        try:
            auctions = db.query(Auction).filter(Auction.status == "live").all()

            for auction in auctions:
                auction_id = str(auction.auction_id)
                self.active_auctions.add(auction_id)

            logger.info(f"Loaded {len(self.active_auctions)} active auctions")

        except Exception as e:
            logger.error(f"Failed to load active auctions: {e}", exc_info=True)
        finally:
            db.close()

    def _timer_loop(self):
        """Main timer loop - runs continuously"""
        logger.info("Timer loop started")

        while self.running:
            try:
                current_time = time.time()

                # Process each active auction
                auctions_to_remove = set()

                for auction_id in list(self.active_auctions):
                    try:
                        ended = self._process_auction_timer(auction_id)
                        if ended:
                            auctions_to_remove.add(auction_id)
                    except Exception as e:
                        logger.error(f"Error processing timer for {auction_id}: {e}", exc_info=True)

                # Remove ended auctions
                self.active_auctions -= auctions_to_remove

                # Periodic sync with database
                if current_time - self.last_sync_time > 60:  # Every minute
                    self._sync_with_database()
                    self.last_sync_time = current_time

                # Sleep for broadcast interval
                time.sleep(settings.TIMER_BROADCAST_INTERVAL)

            except Exception as e:
                logger.error(f"Timer loop error: {e}", exc_info=True)
                time.sleep(1)

    def _process_auction_timer(self, auction_id: str) -> bool:
        """
        Process timer for a single auction

        Args:
            auction_id: Auction UUID

        Returns:
            True if auction ended, False otherwise
        """
        try:
            # Get end time from Redis (check both dedicated key and state hash)
            end_time_key = RedisKeys.auction_end_time(auction_id)
            end_time_ms = self.redis_client.get(end_time_key)
            
            # If dedicated key doesn't exist, check Redis state hash
            if not end_time_ms:
                state = self.redis_helper.get_auction_state(auction_id)
                if state and state.get("end_time"):
                    try:
                        end_time_from_state = state.get("end_time")
                        # Validate it's a valid number
                        if end_time_from_state:
                            end_time_ms = end_time_from_state
                            logger.info(f"Found end_time in Redis state for auction {auction_id}: {end_time_ms}")
                            # Also set the dedicated key for faster future lookups
                            if auction_id in self.active_auctions:
                                db = SessionLocal()
                                try:
                                    auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()
                                    if auction and auction.duration:
                                        ttl_seconds = auction.duration + 3600
                                        self.redis_helper.set_with_ttl(end_time_key, str(end_time_ms), ttl_seconds)
                                finally:
                                    db.close()
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid end_time in Redis state for auction {auction_id}: {e}")
                        end_time_ms = None

            # If Redis doesn't have end_time, try to calculate from database
            if not end_time_ms:
                logger.info(f"No end time in Redis for auction {auction_id}, calculating from database")
                db = SessionLocal()
                try:
                    auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()
                    if not auction:
                        logger.warning(f"Auction {auction_id} not found in database")
                        return True  # Remove from active list
                    
                    # Only process if auction is still live
                    if auction.status != "live":
                        logger.info(f"Auction {auction_id} is not live (status: {auction.status})")
                        return True  # Remove from active list
                    
                    # Calculate end_time from created_at + duration
                    if auction.created_at and auction.duration:
                        created_at_ms = int(auction.created_at.timestamp() * 1000)
                        end_time_ms = created_at_ms + (auction.duration * 1000)
                        
                        # Safety check: Ensure end_time is in the future
                        current_time_ms = get_current_timestamp_ms()
                        if end_time_ms <= current_time_ms:
                            # If calculated end_time is in the past, use current time + duration
                            # This handles cases where created_at might be slightly off
                            logger.warning(f"Calculated end_time for auction {auction_id} is in the past. Using current time + duration instead.")
                            end_time_ms = current_time_ms + (auction.duration * 1000)
                        
                        # Initialize Redis with calculated end_time
                        ttl_seconds = auction.duration + 3600  # Add buffer
                        self.redis_helper.set_with_ttl(end_time_key, str(end_time_ms), ttl_seconds)
                        
                        # Also initialize Redis state if missing
                        state = self.redis_helper.get_auction_state(auction_id)
                        if not state:
                            state_data = {
                                "host_user_id": str(auction.host_user_id),
                                "status": "live",
                                "current_high_bid": str(auction.starting_bid),
                                "start_time": str(created_at_ms),
                                "end_time": str(end_time_ms),
                                "participant_count": "0",
                                "bid_count": "0"
                            }
                            self.redis_helper.set_auction_state(auction_id, state_data)
                            self.redis_helper.set_with_ttl(RedisKeys.auction_active(auction_id), "true", auction.duration)
                        else:
                            # Update state with correct end_time if it exists but was missing from dedicated key
                            self.redis_helper.update_auction_field(auction_id, "end_time", str(end_time_ms))
                        
                        logger.info(f"Initialized Redis end_time for auction {auction_id}: {end_time_ms}")
                    else:
                        logger.warning(f"Cannot calculate end_time for auction {auction_id}: missing created_at or duration")
                        return False  # Keep in active list, will retry next cycle
                finally:
                    db.close()
                    
                # If we still don't have end_time_ms, skip this cycle
                if not end_time_ms:
                    return False

            end_time_ms = int(end_time_ms)
            current_time_ms = get_current_timestamp_ms()
            time_remaining_ms = end_time_ms - current_time_ms

            # Check if auction has ended
            if time_remaining_ms <= 0:
                logger.info(f"Auction {auction_id} ended")
                self._handle_auction_end(auction_id)
                return True

            # Broadcast timer update
            self._broadcast_timer_update(auction_id, end_time_ms, time_remaining_ms)

            return False

        except Exception as e:
            logger.error(f"Timer processing error for {auction_id}: {e}", exc_info=True)
            return False

    def _broadcast_timer_update(self, auction_id: str, end_time_ms: int, time_remaining_ms: int):
        """
        Broadcast timer update to WebSocket clients

        Args:
            auction_id: Auction UUID
            end_time_ms: End time in milliseconds
            time_remaining_ms: Remaining time in milliseconds
        """
        try:
            server_time_ms = get_current_timestamp_ms()

            timer_data = {
                "type": "timer_sync",
                "auction_id": auction_id,
                "server_time": server_time_ms,
                "auction_end_time": end_time_ms,
                "time_remaining_ms": time_remaining_ms,
                "time_remaining_seconds": time_remaining_ms // 1000,
                "sync_type": "heartbeat"
            }

            channel = RedisKeys.channel_timer(auction_id)
            self.redis_helper.publish_event(channel, timer_data)

        except Exception as e:
            logger.error(f"Timer broadcast error: {e}", exc_info=True)

    def _handle_auction_end(self, auction_id: str):
        """
        Handle auction end - update database, determine winner, send notifications

        Args:
            auction_id: Auction UUID
        """
        db = SessionLocal()
        try:
            # Get auction state from Redis
            state = self.redis_helper.get_auction_state(auction_id)

            # Update database
            auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()

            if not auction:
                logger.warning(f"Auction not found in database: {auction_id}")
                return

            auction.status = "closed"
            auction.ended_at = datetime.now(timezone.utc)

            # Get current state for high bidder and price
            current_high_bid = float(state.get("current_high_bid") or auction.starting_bid or 0)
            winner_id = state.get("high_bidder_id")
            
            logger.info(f"Auction {auction_id} ended: current_high_bid={current_high_bid}, high_bidder_id={winner_id}")

            # Collect participants from top bids (Redis sorted set) - needed for notifications
            top_bids = []
            try:
                top_bids = self.redis_helper.get_top_bids(str(auction_id)) or []
                logger.info(f"Auction {auction_id}: Found {len(top_bids)} top bids")
            except Exception as e:
                logger.warning(f"Failed to get top bids for {auction_id}: {e}")
                top_bids = []

            # Fallback: derive winner from top bid if not present in state
            if not winner_id and top_bids:
                top_bid = top_bids[0]
                if isinstance(top_bid, dict) and top_bid.get("user_id"):
                    winner_id = top_bid.get("user_id")
                    logger.info(f"Auction {auction_id}: Derived high_bidder_id from top bid: {winner_id}")

            # Set winner if there are bids
            if winner_id:
                auction.winner_id = winner_id
                auction.winning_bid = Decimal(state.get("current_high_bid", current_high_bid))

            db.commit()

            # Update Redis state
            self.redis_helper.update_auction_field(auction_id, "status", "closed")

            # Broadcast auction end event
            end_event = {
                "type": "auction_end",
                "auction_id": auction_id,
                "winner_id": winner_id,
                "winner_username": state.get("high_bidder_username"),
                "winning_bid": current_high_bid,
                "end_time": get_current_timestamp_ms()
            }

            events_channel = RedisKeys.channel_events(auction_id)
            self.redis_helper.publish_event(events_channel, end_event)

            # Timer update with end notification
            timer_channel = RedisKeys.channel_timer(auction_id)
            self.redis_helper.publish_event(timer_channel, {
                "type": "timer_sync",
                "auction_id": auction_id,
                "time_remaining_ms": 0,
                "time_remaining_seconds": 0,
                "sync_type": "final",
                "auction_ended": True
            })

            # Send notification to SQS (winner + losers) - send even if no winner
            try:
                logger.info(f"Starting notification process for ended auction {auction_id}")
                
                participant_ids: List[str] = []
                for b in top_bids:
                    uid = b.get("user_id") if isinstance(b, dict) else None
                    if uid:
                        participant_ids.append(str(uid))
                participant_ids = list(dict.fromkeys(participant_ids))  # dedupe, preserve order
                logger.info(f"Auction {auction_id}: participant_ids={participant_ids}")

                # Build user map - include winner if exists
                user_ids_to_fetch = list(dict.fromkeys(participant_ids + ([str(winner_id)] if winner_id else [])))
                logger.info(f"Auction {auction_id}: Fetching user info for {len(user_ids_to_fetch)} users")
                user_map = self._fetch_user_map(db, user_ids_to_fetch)
                logger.info(f"Auction {auction_id}: Fetched {len(user_map)} users from DB")

                winner_user = None
                if winner_id and str(winner_id) in user_map:
                    winner_user = user_map[str(winner_id)]
                    logger.info(f"Auction {auction_id}: Winner found: {winner_user.get('email', 'no email')}")
                elif winner_id:
                    # Minimal winner info if not in user_map
                    winner_user = {"user_id": str(winner_id)}
                    logger.warning(f"Auction {auction_id}: Winner {winner_id} not found in user_map, using minimal info")

                losers = []
                for pid in participant_ids:
                    if winner_user and pid == winner_user.get("user_id"):
                        continue
                    if pid in user_map:
                        losers.append(user_map[pid])
                logger.info(f"Auction {auction_id}: Found {len(losers)} losers")

                notification_data = {
                    "type": "auction_closed",
                    "auction_id": auction_id,
                    "title": auction.title,
                    "final_price": current_high_bid,
                    "winner": winner_user,
                    "losers": losers,
                    "timestamp": get_current_timestamp_ms()
                }

                logger.info(f"Auction {auction_id}: Sending notification to SQS: winner={winner_user is not None}, losers={len(losers)}")
                sqs_client.send_notification_message(notification_data)
                logger.info(f"Auction {auction_id}: Successfully enqueued notification message")
            except Exception as notify_err:
                logger.error(f"Failed to enqueue winner/loser notification for {auction_id}: {notify_err}", exc_info=True)

            logger.info(f"Auction ended: {auction_id}, Winner: {winner_id}")

        except Exception as e:
            db.rollback()
            logger.error(f"Auction end handling error: {e}", exc_info=True)
        finally:
            db.close()

    def _sync_with_database(self):
        """Periodically sync with database to detect new auctions"""
        try:
            db = SessionLocal()
            try:
                # Get all live auctions
                auctions = db.query(Auction).filter(Auction.status == "live").all()

                # Add any new auctions
                for auction in auctions:
                    auction_id = str(auction.auction_id)
                    if auction_id not in self.active_auctions:
                        self.active_auctions.add(auction_id)
                        logger.info(f"Added new auction to timer: {auction_id}")

                # Remove any auctions that are no longer live
                db_auction_ids = {str(a.auction_id) for a in auctions}
                to_remove = self.active_auctions - db_auction_ids

                for auction_id in to_remove:
                    # Verify auction is actually closed in Redis
                    state = self.redis_helper.get_auction_state(auction_id)
                    if state.get("status") == "closed":
                        self.active_auctions.discard(auction_id)
                        logger.info(f"Removed closed auction from timer: {auction_id}")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Database sync error: {e}", exc_info=True)

    def _fetch_user_map(self, db, user_ids: List[str]) -> Dict[str, Dict]:
        """Return map of user_id -> {user_id, email, name, username}"""
        if not user_ids:
            return {}
        rows = db.query(User).filter(User.user_id.in_(user_ids)).all()
        out = {}
        for u in rows:
            out[str(u.user_id)] = {
                "user_id": str(u.user_id),
                "email": u.email,
                "name": u.name,
                "username": u.username,
            }
        return out
