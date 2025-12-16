"""
Auction Management Service - Main Flask Application
"""
import sys
import os

# Add shared directory to Python path
# This ensures 'shared' module can be imported
current_dir = os.path.dirname(os.path.abspath(__file__))  # app/
service_dir = os.path.dirname(current_dir)  # auction-management-service/
backend_dir = os.path.dirname(service_dir)  # backend/
shared_dir = os.path.join(backend_dir, 'shared')

# Add service directory to path so 'app' package can be imported
if service_dir not in sys.path:
    sys.path.insert(0, service_dir)
if os.path.exists(shared_dir) and shared_dir not in sys.path:
    sys.path.insert(0, shared_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask
from flask_cors import CORS
from shared.config.settings import settings
from shared.utils.errors import register_error_handlers
from shared.utils.logger import setup_logger
from app.api import auction_routes, auth_routes


def create_app() -> Flask:
    """Create and configure Flask application"""
    app = Flask(__name__)

    # CORS configuration - Allow all methods and headers for development
    CORS(
        app, 
        origins=settings.cors_origins_list,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        supports_credentials=True
    )

    # Setup logger
    logger = setup_logger("auction-management")
    app.logger = logger

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints
    app.register_blueprint(auction_routes.bp)
    app.register_blueprint(auth_routes.bp)

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
