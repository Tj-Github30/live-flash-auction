"""
Timer Manager - Manages all active auction timers
"""
import time
import threading
from typing import Dict, Set
from decimal import Decimal
from shared.redis.client import RedisHelper, RedisKeys
from shared.database.connection import SessionLocal
from shared.models.auction import Auction
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
            # Get end time from Redis
            end_time_key = RedisKeys.auction_end_time(auction_id)
            end_time_ms = self.redis_client.get(end_time_key)

            if not end_time_ms:
                logger.warning(f"No end time found for auction {auction_id}")
                return True  # Remove from active list

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
            auction.ended_at = db.func.now()

            # Set winner if there are bids
            winner_id = state.get("high_bidder_id")
            if winner_id:
                auction.winner_id = winner_id
                auction.winning_bid = Decimal(state.get("current_high_bid", 0))

            db.commit()

            # Update Redis state
            self.redis_helper.update_auction_field(auction_id, "status", "closed")

            # Broadcast auction end event
            end_event = {
                "type": "auction_end",
                "auction_id": auction_id,
                "winner_id": winner_id,
                "winner_username": state.get("high_bidder_username"),
                "winning_bid": float(state.get("current_high_bid", 0)),
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

            # Send notification to SQS
            if winner_id:
                notification_data = {
                    "type": "auction_end",
                    "auction_id": auction_id,
                    "winner_id": winner_id,
                    "winner_username": state.get("high_bidder_username"),
                    "winning_bid": float(state.get("current_high_bid", 0)),
                    "auction_title": auction.title,
                    "timestamp": get_current_timestamp_ms()
                }
                sqs_client.send_notification_message(notification_data)

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
