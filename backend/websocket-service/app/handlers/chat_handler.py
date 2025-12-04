"""
Chat Message Handler
"""
from flask_socketio import emit
from redis.client import RedisHelper, RedisKeys
from aws.sqs_client import sqs_client
from utils.helpers import get_current_timestamp_ms
from utils.logger import setup_logger
from config.settings import settings
import json
import uuid

logger = setup_logger("chat-handler")


class ChatHandler:
    """Handles chat messages"""

    def __init__(self, socketio):
        self.socketio = socketio
        self.redis_helper = RedisHelper()

    def on_chat_message(self, connection_id: str, data: dict):
        """
        Handle incoming chat message

        Args:
            connection_id: Socket.IO session ID
            data: {auction_id: str, message: str}
        """
        try:
            from handlers.connection_handler import ConnectionHandler
            # Get connection info (would need to access from connection_handler)
            # For now, we'll require user_id and username in data
            auction_id = data.get("auction_id")
            message = data.get("message", "").strip()
            user_id = data.get("user_id")
            username = data.get("username")

            if not all([auction_id, message, user_id, username]):
                emit("error", {"message": "Missing required fields"})
                return

            # Validate message length
            if len(message) > 500:
                emit("error", {"message": "Message too long (max 500 characters)"})
                return

            # Create chat data
            chat_data = {
                "type": "chat",
                "auction_id": auction_id,
                "user_id": user_id,
                "username": username,
                "message": message,
                "timestamp": get_current_timestamp_ms()
            }

            # Publish to Redis pub/sub for immediate broadcast
            channel = RedisKeys.channel_chat(auction_id)
            self.redis_helper.publish_event(channel, chat_data)

            # Optionally enqueue for persistence (if enabled)
            if settings.ENABLE_CHAT_PERSISTENCE:
                chat_data["message_id"] = str(uuid.uuid4())
                sqs_client.send_chat_message(chat_data)

            logger.info(f"Chat message from {username} in auction {auction_id}")

        except Exception as e:
            logger.error(f"Chat message error: {e}", exc_info=True)
            emit("error", {"message": "Failed to send message"})
