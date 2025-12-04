"""
Bid Processing Service - Main Flask Application
Handles bid validation, processing, and anti-snipe logic
"""
from flask import Flask
from flask_cors import CORS
from config.settings import settings
from utils.errors import register_error_handlers
from utils.logger import setup_logger
from api import bid_routes


def create_app() -> Flask:
    """Create and configure Flask application"""
    app = Flask(__name__)

    # CORS configuration
    CORS(app, origins=settings.cors_origins_list)

    # Setup logger
    logger = setup_logger("bid-processing")
    app.logger = logger

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints
    app.register_blueprint(bid_routes.bp)

    # Health check endpoint
    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "healthy", "service": "bid-processing"}, 200

    logger.info("Bid Processing Service started")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=settings.FLASK_DEBUG)
