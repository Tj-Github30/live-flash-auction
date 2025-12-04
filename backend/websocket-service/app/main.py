"""
WebSocket Service - Real-time bidding and chat
"""
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import eventlet
eventlet.monkey_patch()

from config.settings import settings
from utils.logger import setup_logger
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
    return {"status": "healthy", "service": "websocket"}, 200


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


if __name__ == "__main__":
    logger.info("WebSocket Service starting...")
    pubsub_service.start()  # Start Redis pub/sub listener
    socketio.run(app, host="0.0.0.0", port=8001, debug=settings.FLASK_DEBUG)
