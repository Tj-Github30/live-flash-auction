import os

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv


def create_app() -> Flask:
    # Load environment variables from .env
    load_dotenv()

    app = Flask(__name__)

    # Basic config
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

    # Frontend origin(s)
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    origins_list = [o.strip() for o in cors_origins.split(",") if o.strip()]

    # Enable CORS for API + Socket.IO
    CORS(
        app,
        resources={r"/*": {"origins": origins_list}},
        supports_credentials=True,
    )

    # Socket.IO setup
    socketio = SocketIO(
        app,
        cors_allowed_origins=origins_list,
    )

    # ---------- Health + root routes ----------

    @app.route("/")
    def index():
        return {"status": "ok", "service": "live-flash-auction-backend"}

    @app.route("/health")
    def health():
        return {"status": "ok"}

    # ---------- Register API blueprints here ----------

    try:
        # Protected /api/user/me endpoint (uses Cognito token validation)
        from app.api.user_routes import bp as user_bp

        app.register_blueprint(user_bp)
    except ModuleNotFoundError:
        # It's okay if this doesn't exist yet while you're still wiring things
        pass

    # TODO: later
    # from app.api.auction_routes import bp as auction_bp
    # app.register_blueprint(auction_bp)
    #
    # from app.sockets.bidding import socketio_ns as bidding_ns
    # socketio.on_namespace(bidding_ns)

    # Attach socketio instance for external access (e.g. from sockets modules)
    app.socketio = socketio
    return app


# Create app + socketio for `python application.py` and for imports
app = create_app()
socketio = app.socketio


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    socketio.run(
        app,
        host=host,
        port=port,
        debug=True,
    )
