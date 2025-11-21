from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS  

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "dev-secret"  # TODO: move to env

    # Enable CORS for all routes during development
    CORS(app, origins="*")  

    socketio = SocketIO(app, cors_allowed_origins="*")

    @app.route("/")
    def index():
        return {"message": "Live Flash Auction Backend is running"}

    @app.route("/health")
    def health():
        return {"status": "ok"}

    app.socketio = socketio
    return app


app = create_app()
socketio = app.socketio

if __name__ == "__main__":
    print("Starting Socket.IO server on http://localhost:8000 ...")
    socketio.run(app, host="0.0.0.0", port=8000)
