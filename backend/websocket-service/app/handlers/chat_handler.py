import json
import uuid
from flask_socketio import emit
from shared.redis.client import RedisHelper, RedisKeys
from shared.aws.sqs_client import sqs_client
from shared.utils.helpers import get_current_timestamp_ms
from shared.utils.logger import setup_logger
from shared.config.settings import settings

logger = setup_logger("chat-handler")

class ChatHandler:
    """Handles chat messages with a background Redis listener 📡"""

    def __init__(self, socketio, connection_handler=None):
        self.socketio = socketio
        self.redis_helper = RedisHelper()
        self.connection_handler = connection_handler
        
        # Start background listener
        self.socketio.start_background_task(self._start_redis_listener)

    def _start_redis_listener(self):
        """Listens to Redis Pub/Sub and broadcasts to rooms"""
        pubsub = self.redis_helper.client.pubsub()
        channel_pattern = f"{settings.REDIS_AUCTION_PREFIX}:*:chat" 
        pubsub.psubscribe(channel_pattern)
        
        logger.info(f"Redis Listener started on pattern: {channel_pattern}")

        for message in pubsub.listen():
            if message['type'] == 'pmessage':
                try:
                    data = json.loads(message['data'])
                    auction_id = data.get("auction_id")
                    sender_sid = data.get("sid") # <--- Get the sender's ID

                    # 📢 Broadcast. skip_sid prevents the "Echo" (double message)
                    self.socketio.emit(
                        "chat_message", 
                        data, 
                        room=auction_id, 
                        skip_sid=sender_sid  # <--- FIX: Skip the sender
                    )
                except Exception as e:
                    logger.error(f"Listener broadcast error: {e}")

    def on_chat_message(self, connection_id: str, data: dict):
        """Handle incoming chat message ⚡"""
        try:
            auction_id = data.get("auction_id")
            message = data.get("message", "").strip()

            if not auction_id or not message:
                return

            # --- Identity Resolution ---
            user_id = data.get("user_id")
            username = data.get("username")

            if (not user_id or not username) and self.connection_handler:
                conn_info = self.connection_handler.get_connection(connection_id)
                if conn_info:
                    user_id = conn_info.get("user_id")
                    username = conn_info.get("username")

            if not user_id or not username:
                logger.warning(f"Could not resolve identity for {connection_id}")
                return

            chat_data = {
                "message_id": str(uuid.uuid4()),
                "sid": connection_id,  # <--- FIX: Include SID to prevent echo
                "type": "chat",
                "auction_id": str(auction_id),
                "user_id": str(user_id),
                "username": str(username),
                "message": message,
                "timestamp": get_current_timestamp_ms()
            }

            # 1. Publish to Redis (Broadcasting to all pods)
            channel = RedisKeys.channel_chat(auction_id) 
            self.redis_helper.client.publish(channel, json.dumps(chat_data))

            # 2. Save to Redis List (For history/refresh)
            # This ensures history is kept in Redis
            self.redis_helper.save_chat_message(auction_id, chat_data, max_history=100)

            # 3. Persistence to SQS
            if settings.ENABLE_CHAT_PERSISTENCE:
                sqs_client.send_chat_message(chat_data)

        except Exception as e:
            logger.error(f"Chat message error: {e}", exc_info=True)

    def get_history(self, auction_id: str, limit: int = 50):
        """Helper to fetch history for the frontend"""
        try:
            return self.redis_helper.get_chat_history(auction_id, limit=limit)
        except Exception as e:
            logger.error(f"Error fetching history: {e}")
            return []