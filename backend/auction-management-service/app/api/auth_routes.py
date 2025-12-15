"""
Authentication API Routes
"""
from flask import Blueprint, jsonify

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/verify", methods=["GET"])
def verify_token():
    """Verify authentication token"""
    return jsonify({"message": "Token verification endpoint"}), 200