"""
Redis Pub/Sub Service for receiving real-time events
"""
import redis
import json
import eventlet
from typing import Optional
from shared.config.settings import settings
from shared.redis.client import RedisClient
from shared.utils.logger import setup_logger

logger = setup_logger("pubsub-service")


class PubSubService:
    """Redis Pub/Sub listener for broadcasting events to WebSocket clients"""

    def __init__(self, socketio):
        self.socketio = socketio
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub: Optional[redis.client.PubSub] = None
        self.running = False
        self.listener_greenlet = None

        # Retry configuration
        self.retry_enabled = settings.REDIS_PUBSUB_RETRY_ENABLED
        self.retry_max_attempts = settings.REDIS_PUBSUB_RETRY_MAX_ATTEMPTS
        self.retry_delay = settings.REDIS_PUBSUB_RETRY_INITIAL_DELAY
        self.retry_max_delay = settings.REDIS_PUBSUB_RETRY_MAX_DELAY
        self.retry_multiplier = settings.REDIS_PUBSUB_RETRY_MULTIPLIER

    def start(self):
        """Start listening to Redis pub/sub channels with retry logic"""
        if self.running:
            logger.warning("Pub/Sub service already running")
            return

        self.running = True
        logger.info("Starting Pub/Sub service...")

        # Start connection in background greenlet to not block startup
        self.listener_greenlet = eventlet.spawn(self._start_with_retry)

        logger.info("Pub/Sub service initialization started (connecting in background)")

    def stop(self):
        """Stop listening and cleanup resources"""
        logger.info("Stopping Pub/Sub service...")
        self.running = False

        # Cleanup pub/sub
        if self.pubsub:
            try:
                self.pubsub.unsubscribe()
                self.pubsub.close()
            except Exception as e:
                logger.warning(f"Error closing pub/sub: {e}")
            finally:
                self.pubsub = None

        # Cleanup client
        if self.redis_client:
            try:
                self.redis_client.close()
            except Exception as e:
                logger.warning(f"Error closing Redis client: {e}")
            finally:
                self.redis_client = None

        # Kill greenlet if still running
        if self.listener_greenlet:
            try:
                self.listener_greenlet.kill()
            except Exception:
                pass
            finally:
                self.listener_greenlet = None

        logger.info("Pub/Sub service stopped")

    def _start_with_retry(self):
        """Initialize connection with exponential backoff retry"""
        attempt = 0
        current_delay = self.retry_delay

        while self.running and (not self.retry_enabled or attempt < self.retry_max_attempts):
            attempt += 1

            try:
                logger.info(f"Attempting to connect to Redis (attempt {attempt}/{self.retry_max_attempts})...")

                # Create dedicated Redis client for pub/sub
                self.redis_client = RedisClient.get_pubsub_client()

                # Test connection before subscribing
                if not self.redis_client.ping():
                    raise redis.ConnectionError("Redis ping failed")

                logger.info("Redis connection established")

                # Create pub/sub instance
                self.pubsub = self.redis_client.pubsub(ignore_subscribe_messages=True)

                # Subscribe to patterns
                self.pubsub.psubscribe(
                    "auction:*:events",
                    "auction:*:timer",
                    "auction:*:chat"
                )

                logger.info("Subscribed to Redis pub/sub channels successfully")

                # Reset retry delay on success
                current_delay = self.retry_delay

                # Start listening
                self._listen()

                # If listen returns normally (not exception), connection was closed gracefully
                if self.running:
                    logger.warning("Pub/Sub connection closed unexpectedly, will retry...")
                    # Continue to retry logic
                else:
                    # Service was stopped intentionally
                    break

            except redis.ConnectionError as e:
                logger.error(
                    f"Redis connection failed (attempt {attempt}/{self.retry_max_attempts}): {e}",
                    extra={"error_type": "RedisConnectionError", "attempt": attempt}
                )

                if not self.running:
                    break

                if self.retry_enabled and attempt < self.retry_max_attempts:
                    logger.info(f"Retrying in {current_delay} seconds...")
                    eventlet.sleep(current_delay)
                    # Exponential backoff
                    current_delay = min(current_delay * self.retry_multiplier, self.retry_max_delay)
                else:
                    logger.error("Max retry attempts reached or retry disabled. Pub/Sub service failed to start.")
                    self.running = False
                    break

            except redis.TimeoutError as e:
                logger.error(
                    f"Redis timeout (attempt {attempt}/{self.retry_max_attempts}): {e}",
                    extra={"error_type": "RedisTimeoutError", "attempt": attempt}
                )

                if not self.running:
                    break

                if self.retry_enabled and attempt < self.retry_max_attempts:
                    logger.info(f"Retrying in {current_delay} seconds...")
                    eventlet.sleep(current_delay)
                    current_delay = min(current_delay * self.retry_multiplier, self.retry_max_delay)
                else:
                    logger.error("Max retry attempts reached. Pub/Sub service failed to start.")
                    self.running = False
                    break

            except Exception as e:
                logger.error(
                    f"Unexpected error starting Pub/Sub service (attempt {attempt}/{self.retry_max_attempts}): {e}",
                    exc_info=True,
                    extra={"error_type": type(e).__name__, "attempt": attempt}
                )

                if not self.running:
                    break

                if self.retry_enabled and attempt < self.retry_max_attempts:
                    logger.info(f"Retrying in {current_delay} seconds...")
                    eventlet.sleep(current_delay)
                    current_delay = min(current_delay * self.retry_multiplier, self.retry_max_delay)
                else:
                    logger.error("Max retry attempts reached. Pub/Sub service failed to start.")
                    self.running = False
                    break
            finally:
                # Cleanup on failure before retry
                if not self.running or (self.pubsub is None and attempt < self.retry_max_attempts):
                    self._cleanup_connection()

    def _cleanup_connection(self):
        """Cleanup Redis connection resources"""
        if self.pubsub:
            try:
                self.pubsub.close()
            except Exception:
                pass
            self.pubsub = None

        if self.redis_client:
            try:
                self.redis_client.close()
            except Exception:
                pass
            self.redis_client = None

    def _listen(self):
        """Listen for messages from Redis pub/sub"""
        logger.info("Pub/Sub listener started and actively listening for messages")

        try:
            for message in self.pubsub.listen():
                if not self.running:
                    logger.info("Pub/Sub service stopped, exiting listener")
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

                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON in pub/sub message: {e}", extra={
                        "channel": message.get("channel"),
                        "error_type": "JSONDecodeError"
                    })
                except Exception as e:
                    logger.error(f"Pub/Sub message processing error: {e}", exc_info=True, extra={
                        "channel": message.get("channel"),
                        "error_type": type(e).__name__
                    })

        except redis.ConnectionError as e:
            logger.error(f"Pub/Sub connection lost: {e}", extra={"error_type": "RedisConnectionError"})
            # Connection lost, let retry logic handle it
            raise
        except Exception as e:
            logger.error(f"Pub/Sub listener error: {e}", exc_info=True, extra={"error_type": type(e).__name__})
            raise

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

        logger.debug(f"Handled event: {event_type} for auction {auction_id}")

    def _handle_timer(self, channel: str, data: dict):
        """Handle timer update"""
        auction_id = channel.split(":")[1]
        self.socketio.emit("timer_update", data, room=auction_id)
        logger.debug(f"Handled timer update for auction {auction_id}")

    def _handle_chat(self, channel: str, data: dict):
        """Handle chat message"""
        auction_id = channel.split(":")[1]
        self.socketio.emit("chat_message", data, room=auction_id)
        logger.debug(f"Handled chat message for auction {auction_id}")

    def is_connected(self) -> bool:
        """
        Check if pub/sub is connected and healthy

        Returns:
            True if connected and subscribed, False otherwise
        """
        try:
            return (
                self.running and
                self.redis_client is not None and
                self.pubsub is not None and
                self.redis_client.ping()
            )
        except Exception:
            return False
