"""
WebSocket Service - Real-time bidding and chat
"""
import eventlet
eventlet.monkey_patch()

from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

from shared.config.settings import settings
from shared.utils.logger import setup_logger
from handlers.connection_handler import ConnectionHandler
from handlers.chat_handler import ChatHandler
from handlers.bid_handler import BidHandler
from services.pubsub_service import PubSubService

logger = setup_logger("websocket-service")

# Create Flask app
app = Flask(__name__)
app.config["SECRET_KEY"] = "dev-secret-key"  # TODO: Use env variable
CORS(app, origins=settings.cors_origins_list)

# Create SocketIO instance
socketio = SocketIO(
    app,
    cors_allowed_origins=settings.cors_origins_list,
    async_mode="eventlet",
    ping_interval=settings.WEBSOCKET_PING_INTERVAL,
    ping_timeout=settings.WEBSOCKET_PING_TIMEOUT,
    logger=False,
    engineio_logger=False
)

# Initialize handlers
connection_handler = ConnectionHandler(socketio)
chat_handler = ChatHandler(socketio)
bid_handler = BidHandler(socketio)
pubsub_service = PubSubService(socketio)


@app.route("/health", methods=["GET"])
def health():
    """Enhanced health check with component status"""
    from shared.redis.client import RedisClient

    redis_healthy = RedisClient.ping_redis()
    pubsub_connected = pubsub_service.is_connected()

    if not redis_healthy:
        status = "degraded"
        message = "Redis connection failed"
    elif not pubsub_connected:
        status = "degraded"
        message = "PubSub not connected (may be retrying)"
    else:
        status = "healthy"
        message = "All systems operational"

    return {
        "status": status,
        "service": "websocket",
        "message": message,
        "components": {
            "redis": "healthy" if redis_healthy else "unhealthy",
            "pubsub": "connected" if pubsub_connected else "disconnected",
            "socketio": "healthy"
        }
    }, 200


@socketio.on("connect")
def handle_connect():
    """Handle new WebSocket connection"""
    logger.info(f"Client connecting: {request.sid}")
    connection_handler.on_connect(request.sid, request.args)


@socketio.on("disconnect")
def handle_disconnect():
    """Handle WebSocket disconnection"""
    logger.info(f"Client disconnecting: {request.sid}")
    connection_handler.on_disconnect(request.sid)


@socketio.on("join_auction")
def handle_join_auction(data):
    """
    Handle user joining an auction room

    Expected data:
    {
        "auction_id": str,
        "token": str (JWT token)
    }
    """
    logger.info(f"Join auction request: {request.sid}")
    connection_handler.on_join_auction(request.sid, data)


@socketio.on("leave_auction")
def handle_leave_auction(data):
    """
    Handle user leaving an auction room

    Expected data:
    {
        "auction_id": str
    }
    """
    logger.info(f"Leave auction request: {request.sid}")
    connection_handler.on_leave_auction(request.sid, data)


@socketio.on("chat_message")
def handle_chat_message(data):
    """
    Handle chat message from client

    Expected data:
    {
        "auction_id": str,
        "message": str
    }
    """
    chat_handler.on_chat_message(request.sid, data)


@socketio.on("ping")
def handle_ping():
    """Handle ping for connection keep-alive"""
    emit("pong", {"timestamp": int(eventlet.time.time() * 1000)})


def cleanup_on_exit():
    """Cleanup resources on shutdown"""
    logger.info("Shutting down WebSocket service...")
    try:
        pubsub_service.stop()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")
    logger.info("WebSocket service shutdown complete")


# Register cleanup handler
import atexit
atexit.register(cleanup_on_exit)


if __name__ == "__main__":
    logger.info("WebSocket Service starting...")
    logger.info(f"Environment: {settings.FLASK_ENV}")
    logger.info(f"Redis URL: {settings.REDIS_URL}")
    logger.info(f"CORS Origins: {settings.cors_origins_list}")

    # Start PubSub service (non-blocking, retries in background)
    pubsub_service.start()

    # Start SocketIO server
    logger.info("Starting SocketIO server on port 8001...")
    socketio.run(app, host="0.0.0.0", port=8001, debug=settings.FLASK_DEBUG)
