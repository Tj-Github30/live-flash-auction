"""
Bid Service - Core bid processing logic
"""
from typing import Dict
from decimal import Decimal
from shared.redis.client import RedisHelper, RedisKeys, BID_COMPARISON_SCRIPT
from shared.aws.sqs_client import sqs_client
from shared.utils.errors import AuctionNotFoundError, AuctionClosedError, InvalidBidError, ForbiddenError
from shared.utils.helpers import get_current_timestamp_ms, calculate_time_remaining
from shared.config.settings import settings
from shared.database.connection import SessionLocal
from shared.models.auction import Auction
import logging
import uuid

logger = logging.getLogger(__name__)


class BidService:
    """Service for bid processing and validation"""

    def __init__(self):
        self.redis_helper = RedisHelper()
        self.redis_client = self.redis_helper.client

        # Register Lua script
        self.bid_comparison_script = self.redis_client.register_script(BID_COMPARISON_SCRIPT)

    def process_bid(
        self,
        auction_id: str,
        user_id: str,
        username: str,
        amount: float
    ) -> Dict:
        """
        Process a bid with atomic comparison and anti-snipe logic

        Args:
            auction_id: Auction UUID
            user_id: Bidder user ID
            username: Bidder username
            amount: Bid amount

        Returns:
            Dictionary with bid result
        """
        try:
            # 1. Validate auction is active
            auction_state = self.redis_helper.get_auction_state(auction_id)
            if not auction_state:
                raise AuctionNotFoundError(auction_id)

            if auction_state.get("status") != "live":
                raise AuctionClosedError(auction_id)

            # 1.5 Host cannot bid on their own auction (backend-enforced rule)
            host_user_id = auction_state.get("host_user_id")
            if not host_user_id:
                # Backfill from DB for legacy auctions created before we stored host_user_id in Redis
                db = SessionLocal()
                try:
                    auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()
                    if auction and auction.host_user_id:
                        host_user_id = str(auction.host_user_id)
                        # Cache in Redis for future bids
                        try:
                            self.redis_helper.update_auction_field(auction_id, "host_user_id", host_user_id)
                        except Exception:
                            pass
                finally:
                    db.close()

            if host_user_id and str(host_user_id) == str(user_id):
                raise ForbiddenError("Host cannot place bids on their own auction")

            # 2. Check if auction has ended (time-based)
            end_time_key = RedisKeys.auction_end_time(auction_id)
            end_time_ms = int(self.redis_client.get(end_time_key) or 0)
            time_remaining_ms = end_time_ms - get_current_timestamp_ms()

            if time_remaining_ms <= 0:
                raise AuctionClosedError(auction_id)

            # 3. Validate bid amount
            current_high = float(auction_state.get("current_high_bid", 0))
            min_bid = current_high + settings.MINIMUM_BID_INCREMENT

            if amount < min_bid:
                raise InvalidBidError(f"Bid must be at least ${min_bid:.2f}")

            # 4. Atomic bid comparison using Lua script
            timestamp = get_current_timestamp_ms()
            state_key = RedisKeys.auction_state(auction_id)

            result = self.bid_comparison_script(
                keys=[state_key],
                args=[str(amount), user_id, username, str(timestamp)]
            )

            is_new_high = bool(result)

            if not is_new_high:
                # Bid was outbid
                return {
                    "status": "outbid",
                    "is_highest": False,
                    "current_high_bid": current_high,
                    "your_bid": amount,
                    "message": "Your bid was outbid"
                }

            # 5. Bid is highest - update leaderboard
            self.redis_helper.add_top_bid(auction_id, user_id, username, amount)

            # 6. Check anti-snipe condition
            anti_snipe_triggered = False
            if time_remaining_ms < (settings.ANTI_SNIPE_THRESHOLD * 1000):
                anti_snipe_triggered = self._handle_anti_snipe(auction_id, end_time_ms)

            # 7. Publish bid event to Redis pub/sub
            bid_event = {
                "type": "bid",
                "auction_id": auction_id,
                "user_id": user_id,
                "username": username,
                "amount": amount,
                "timestamp": timestamp,
                "is_new_high": True,
                "anti_snipe_triggered": anti_snipe_triggered
            }

            channel = RedisKeys.channel_events(auction_id)
            self.redis_helper.publish_event(channel, bid_event)

            # 8. Enqueue bid for DynamoDB persistence
            self._enqueue_bid_for_persistence(
                auction_id=auction_id,
                user_id=user_id,
                username=username,
                amount=amount,
                timestamp=timestamp,
                is_highest=True
            )

            logger.info(f"Bid accepted: {username} - ${amount} on {auction_id}")

            return {
                "status": "success",
                "is_highest": True,
                "current_high_bid": amount,
                "your_bid": amount,
                "message": "Bid placed successfully",
                "anti_snipe_triggered": anti_snipe_triggered
            }

        except (AuctionNotFoundError, AuctionClosedError, InvalidBidError) as e:
            logger.warning(f"Bid validation failed: {e.message}")
            raise
        except Exception as e:
            logger.error(f"Bid processing error: {e}", exc_info=True)
            raise

    def _handle_anti_snipe(self, auction_id: str, current_end_time_ms: int) -> bool:
        """
        Handle anti-snipe timer extension

        Args:
            auction_id: Auction UUID
            current_end_time_ms: Current end time in milliseconds

        Returns:
            True if extension triggered, False otherwise
        """
        try:
            # Get current anti-snipe count
            state = self.redis_helper.get_auction_state(auction_id)
            anti_snipe_count = int(state.get("anti_snipe_count", 0))

            # Check if max extensions reached
            if anti_snipe_count >= settings.MAX_ANTI_SNIPE_EXTENSIONS:
                logger.info(f"Max anti-snipe extensions reached for {auction_id}")
                return False

            # Calculate new end time
            extension_ms = settings.ANTI_SNIPE_EXTENSION * 1000
            new_end_time_ms = current_end_time_ms + extension_ms

            # Update end time in Redis
            end_time_key = RedisKeys.auction_end_time(auction_id)
            self.redis_client.set(end_time_key, str(new_end_time_ms))

            # Update state
            self.redis_helper.update_auction_field(auction_id, "end_time", str(new_end_time_ms))
            self.redis_helper.update_auction_field(auction_id, "anti_snipe_count", str(anti_snipe_count + 1))

            # Publish anti-snipe event to timer channel
            anti_snipe_event = {
                "type": "anti_snipe",
                "auction_id": auction_id,
                "new_end_time": new_end_time_ms,
                "extended_by": extension_ms,
                "extension_count": anti_snipe_count + 1,
                "max_extensions": settings.MAX_ANTI_SNIPE_EXTENSIONS,
                "reason": "Last-minute bid received"
            }

            timer_channel = RedisKeys.channel_timer(auction_id)
            self.redis_helper.publish_event(timer_channel, anti_snipe_event)

            logger.info(f"Anti-snipe triggered for {auction_id}: extended by {settings.ANTI_SNIPE_EXTENSION}s")

            return True

        except Exception as e:
            logger.error(f"Anti-snipe error: {e}", exc_info=True)
            return False

    def _enqueue_bid_for_persistence(
        self,
        auction_id: str,
        user_id: str,
        username: str,
        amount: float,
        timestamp: int,
        is_highest: bool
    ):
        """
        Enqueue bid to SQS for async DynamoDB persistence

        Args:
            auction_id: Auction UUID
            user_id: User ID
            username: Username
            amount: Bid amount
            timestamp: Timestamp in ms
            is_highest: Whether this is currently the highest bid
        """
        try:
            bid_data = {
                "bid_id": str(uuid.uuid4()),
                "auction_id": auction_id,
                "user_id": user_id,
                "username": username,
                "amount": amount,
                "timestamp": timestamp,
                "is_highest": is_highest,
                "is_winning": is_highest  # Initially same as is_highest
            }

            sqs_client.send_bid_message(bid_data)

            logger.debug(f"Bid enqueued for persistence: {bid_data['bid_id']}")

        except Exception as e:
            # Don't fail the bid if persistence queueing fails
            logger.error(f"Failed to enqueue bid for persistence: {e}", exc_info=True)
