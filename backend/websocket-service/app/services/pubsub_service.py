"""
Redis Pub/Sub Service for receiving real-time events
"""
import redis
import json
import eventlet
from config.settings import settings
from utils.logger import setup_logger

logger = setup_logger("pubsub-service")


class PubSubService:
    """Redis Pub/Sub listener for broadcasting events to WebSocket clients"""

    def __init__(self, socketio):
        self.socketio = socketio
        self.redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        self.pubsub = self.redis_client.pubsub()
        self.running = False

    def start(self):
        """Start listening to Redis pub/sub channels"""
        if self.running:
            return

        self.running = True

        # Subscribe to patterns (all auction channels)
        self.pubsub.psubscribe("auction:*:events", "auction:*:timer", "auction:*:chat")

        # Start listener in background greenlet
        eventlet.spawn(self._listen)

        logger.info("Pub/Sub service started")

    def stop(self):
        """Stop listening"""
        self.running = False
        self.pubsub.unsubscribe()
        logger.info("Pub/Sub service stopped")

    def _listen(self):
        """Listen for messages from Redis pub/sub"""
        logger.info("Pub/Sub listener started")

        for message in self.pubsub.listen():
            if not self.running:
                break

            if message["type"] != "pmessage":
                continue

            try:
                channel = message["channel"]
                data = json.loads(message["data"])

                # Route message based on channel type
                if ":events" in channel:
                    self._handle_event(channel, data)
                elif ":timer" in channel:
                    self._handle_timer(channel, data)
                elif ":chat" in channel:
                    self._handle_chat(channel, data)

            except Exception as e:
                logger.error(f"Pub/Sub message error: {e}", exc_info=True)

    def _handle_event(self, channel: str, data: dict):
        """Handle auction event (bid, etc.)"""
        # Extract auction_id from channel name
        auction_id = channel.split(":")[1]

        event_type = data.get("type")

        if event_type == "bid":
            from handlers.bid_handler import BidHandler
            bid_handler = BidHandler(self.socketio)
            bid_handler.on_bid_event(auction_id, data)

        elif event_type == "auction_end":
            self.socketio.emit("auction_ended", data, room=auction_id)

    def _handle_timer(self, channel: str, data: dict):
        """Handle timer update"""
        auction_id = channel.split(":")[1]
        self.socketio.emit("timer_update", data, room=auction_id)

    def _handle_chat(self, channel: str, data: dict):
        """Handle chat message"""
        auction_id = channel.split(":")[1]
        self.socketio.emit("chat_message", data, room=auction_id)
