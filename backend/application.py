import os

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv


def create_app() -> Flask:
    load_dotenv()

    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174")
    origins_list = [o.strip() for o in cors_origins.split(",") if o.strip()]

    CORS(
        app,
        resources={r"/*": {"origins": origins_list}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Content-Type"],
    )

    socketio = SocketIO(
        app,
        cors_allowed_origins=origins_list,
    )

    @app.route("/")
    def index():
        return {"status": "ok", "service": "live-flash-auction-backend"}

    @app.route("/health")
    def health():
        return {"status": "ok"}

    try:
        from app.api.auth_routes import bp as auth_bp
        app.register_blueprint(auth_bp)
        print("✓ Registered auth_routes")
    except Exception as e:
        print(f"⚠ Warning: Could not load auth_routes: {e}")
        print("   Make sure boto3 is installed: pip install boto3")
        print("   And AWS credentials are configured")

    app.socketio = socketio
    return app


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
