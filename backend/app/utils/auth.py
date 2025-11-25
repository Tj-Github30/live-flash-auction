import os
import requests
from functools import wraps
from flask import request, jsonify
from jose import jwk, jwt
from jose.utils import base64url_decode

COGNITO_REGION = os.getenv("COGNITO_REGION", "us-east-1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")

JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
JWKS = requests.get(JWKS_URL).json()["keys"] if COGNITO_USER_POOL_ID else []


def _get_token():
  auth_header = request.headers.get("Authorization", "")
  if not auth_header.startswith("Bearer "):
    return None
  return auth_header.split(" ", 1)[1]


def verify_cognito_token(token):
  headers = jwt.get_unverified_header(token)
  kid = headers["kid"]

  key = next((k for k in JWKS if k["kid"] == kid), None)
  if not key:
    raise Exception("Public key not found in JWKS")

  public_key = jwk.construct(key)
  message, encoded_sig = token.rsplit(".", 1)
  decoded_sig = base64url_decode(encoded_sig.encode("utf-8"))

  if not public_key.verify(message.encode("utf-8"), decoded_sig):
    raise Exception("Signature verification failed")

  claims = jwt.get_unverified_claims(token)

  if claims.get("aud") != COGNITO_APP_CLIENT_ID:
    raise Exception("Token not issued for this client")

  return claims


def cognito_required(f):
  @wraps(f)
  def wrapper(*args, **kwargs):
    token = _get_token()
    if not token:
      return jsonify({"error": "Missing token"}), 401
    try:
      claims = verify_cognito_token(token)
      request.cognito_user = claims
    except Exception as e:
      return jsonify({"error": "Invalid token", "details": str(e)}), 401
    return f(*args, **kwargs)
  return wrapper
