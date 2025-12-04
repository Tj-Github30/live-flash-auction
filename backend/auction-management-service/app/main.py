"""
Auction Management Service - Main Flask Application
"""
from flask import Flask
from flask_cors import CORS
from config.settings import settings
from utils.errors import register_error_handlers
from utils.logger import setup_logger
from api import auction_routes


def create_app() -> Flask:
    """Create and configure Flask application"""
    app = Flask(__name__)

    # CORS configuration
    CORS(app, origins=settings.cors_origins_list)

    # Setup logger
    logger = setup_logger("auction-management")
    app.logger = logger

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints
    app.register_blueprint(auction_routes.bp)

    # Health check endpoint
    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "healthy", "service": "auction-management"}, 200

    @app.route("/ready", methods=["GET"])
    def ready():
        # TODO: Add dependency checks (DB, Redis)
        return {"status": "ready"}, 200

    logger.info("Auction Management Service started")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=settings.FLASK_DEBUG)
