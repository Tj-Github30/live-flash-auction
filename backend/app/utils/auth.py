# backend/app/utils/auth.py
import os
import json
import time
from functools import wraps

import requests
from flask import request, jsonify
from jose import jwk, jwt
from jose.utils import base64url_decode

COGNITO_REGION = os.getenv("COGNITO_REGION") or os.getenv("AWS_REGION", "us-east-1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
# Prefer COGNITO_CLIENT_ID, fall back to COGNITO_APP_CLIENT_ID if needed
COGNITO_APP_CLIENT_ID = (
    os.getenv("COGNITO_CLIENT_ID") or os.getenv("COGNITO_APP_CLIENT_ID")
)

if not COGNITO_USER_POOL_ID:
    raise RuntimeError("COGNITO_USER_POOL_ID must be set in environment")

JWKS_URL = (
    f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/"
    f"{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
)

# Fetch JWKS once at startup
JWKS = requests.get(JWKS_URL).json()["keys"]


def _get_token() -> str | None:
    """
    Extract Bearer token from the Authorization header.

    Looks for:
      Authorization: Bearer <id_token>
    """
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()

    # Optional: allow X-ID-Token for local testing
    alt = request.headers.get("X-ID-Token")
    if alt:
        return alt.strip()

    return None


def verify_cognito_token(token: str) -> dict:
    """
    Verify a Cognito ID token using JWKS and return decoded claims.

    - Verifies signature using JWKS
    - Checks issuer (iss)
    - Checks token_use == "id"
    - Checks expiration (exp)
    - Optionally checks audience (aud) if client ID is set
    """
    # 1) Get unverified header to find correct JWK key
    try:
        headers = jwt.get_unverified_header(token)
    except Exception as e:
        raise Exception(f"Invalid token header: {e}") from e

    kid = headers.get("kid")
    key = next((k for k in JWKS if k["kid"] == kid), None)
    if not key:
        raise Exception("Public key not found in JWKS")

    # 2) Verify signature manually
    public_key = jwk.construct(key)

    message, encoded_sig = str(token).rsplit(".", 1)
    decoded_sig = base64url_decode(encoded_sig.encode("utf-8"))

    if not public_key.verify(message.encode("utf-8"), decoded_sig):
        raise Exception("Token signature verification failed")

    # 3) Decode claims without re-verifying signature
    claims = jwt.get_unverified_claims(token)

    # 4) Validate issuer, token_use, exp, aud
    expected_iss = (
        f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
    )
    if claims.get("iss") != expected_iss:
        raise Exception("Invalid issuer")

    if claims.get("token_use") != "id":
        raise Exception("Token is not an ID token")

    exp = claims.get("exp")
    if exp and time.time() > exp:
        raise Exception("Token is expired")

    if COGNITO_APP_CLIENT_ID:
        aud = claims.get("aud")
        if aud != COGNITO_APP_CLIENT_ID:
            raise Exception("Invalid audience")

    return claims


def cognito_required(f):
    """
    Flask decorator to protect routes with Cognito ID token.

    Attaches decoded claims to request.cognito_user.
    """

    @wraps(f)
    def wrapper(*args, **kwargs):
        token = _get_token()
        if not token:
            return jsonify({"error": "Missing bearer token"}), 401

        try:
            claims = verify_cognito_token(token)
        except Exception as e:
            return jsonify({"error": str(e)}), 401

        # Attach claims to the request object
        setattr(request, "cognito_user", claims)
        return f(*args, **kwargs)

    return wrapper
