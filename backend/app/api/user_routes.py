from flask import Blueprint, request, jsonify
from app.utils.auth import cognito_required

bp = Blueprint("user_routes", __name__, url_prefix="/api/user")

@bp.route("/me", methods=["GET"])
@cognito_required
def me():
    claims = getattr(request, "cognito_user", {})
    return jsonify({
        "sub": claims.get("sub"),
        "email": claims.get("email"),
        "username": claims.get("cognito:username"),
    })
