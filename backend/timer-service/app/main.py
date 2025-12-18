"""
Timer Service - Single source of truth for auction timers
Manages countdowns, broadcasts updates, handles auction end
"""
from flask import Flask
from flask_cors import CORS
import threading
import time
from shared.config.settings import settings
from shared.utils.logger import setup_logger
from services.timer_manager import TimerManager

logger = setup_logger("timer-service")


def create_app() -> Flask:
    """Create and configure Flask application"""
    app = Flask(__name__)

    # CORS configuration
    CORS(app, origins=settings.cors_origins_list)

    # Setup logger
    app.logger = logger

    # Health check endpoint
    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "healthy", "service": "timer"}, 200

    logger.info("Timer Service started")

    return app


app = create_app()

# Initialize Timer Manager
timer_manager = TimerManager()


def start_timer_service():
    """Start timer service in background thread"""
    logger.info("Starting timer manager...")
    timer_manager.start()


if __name__ == "__main__":
    # Start timer service in background
    timer_thread = threading.Thread(target=start_timer_service, daemon=True)
    timer_thread.start()

    # Run Flask app for health checks
    app.run(host="0.0.0.0", port=8003, debug=False)
