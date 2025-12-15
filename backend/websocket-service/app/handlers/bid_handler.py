"""
Bid Event Handler (receives from Redis pub/sub)
"""
from shared.utils.logger import setup_logger

logger = setup_logger("bid-handler")


class BidHandler:
    """Handles bid events from Redis pub/sub"""

    def __init__(self, socketio):
        self.socketio = socketio

    def on_bid_event(self, auction_id: str, bid_data: dict):
        """
        Handle bid event from Redis pub/sub

        Broadcasts personalized bid updates to all users in auction

        Args:
            auction_id: Auction ID
            bid_data: Bid event data from Redis
        """
        try:
            from redis_client.client import RedisHelper

            redis_helper = RedisHelper()

            # Get updated state
            state = redis_helper.get_auction_state(auction_id)
            top_bids = redis_helper.get_top_bids(auction_id, limit=3)

            high_bidder_id = state.get("high_bidder_id")
            current_high_bid = float(state.get("current_high_bid", 0))

            # Broadcast to all users in room
            # Note: In production, you'd want to send personalized messages
            # based on each user's state (are they winning, were they outbid, etc.)

            broadcast_data = {
                "type": "bid_update",
                "auction_id": auction_id,
                "high_bid": current_high_bid,
                "high_bidder_username": state.get("high_bidder_username"),
                "top_bids": top_bids,
                "bid_count": int(state.get("bid_count", 0)),
                "participant_count": int(state.get("participant_count", 0))
            }

            self.socketio.emit("bid_update", broadcast_data, room=auction_id)

            logger.info(f"Bid event broadcast for auction {auction_id}")

        except Exception as e:
            logger.error(f"Bid event error: {e}", exc_info=True)
