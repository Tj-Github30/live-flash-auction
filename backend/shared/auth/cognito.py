"""
AWS Cognito JWT token validation
"""
import jwt
import requests
from jwt.algorithms import RSAAlgorithm
from functools import wraps
from flask import request, jsonify
from typing import Optional, Dict
from shared.config import settings
import logging

logger = logging.getLogger(__name__)


class CognitoAuth:
    """AWS Cognito authentication handler"""

    def __init__(self):
        self.region = settings.COGNITO_REGION
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        self.app_client_id = settings.COGNITO_APP_CLIENT_ID
        # Use auto-generated issuer URL if COGNITO_ISSUER is not set
        self.issuer = settings.COGNITO_ISSUER or settings.cognito_issuer_url
        self.jwks_url = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
        self._jwks_client = None

    def get_jwks_keys(self) -> Dict:
        """Fetch JWKS keys from Cognito"""
        if self._jwks_client is None:
            response = requests.get(self.jwks_url)
            response.raise_for_status()
            self._jwks_client = response.json()
        return self._jwks_client

    def get_public_key(self, token: str):
        """Get public key for token verification"""
        # Decode token header to get kid
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")

        if not kid:
            raise ValueError("Token missing 'kid' in header")

        # Find matching key in JWKS
        jwks_keys = self.get_jwks_keys()
        key_data = None

        for key in jwks_keys.get("keys", []):
            if key.get("kid") == kid:
                key_data = key
                break

        if not key_data:
            raise ValueError(f"Public key not found for kid: {kid}")

        # Convert to PEM format
        return RSAAlgorithm.from_jwk(key_data)

    def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify Cognito JWT token

        Returns:
            Dict with user claims if valid, None otherwise
        """
        try:
            # Get public key
            public_key = self.get_public_key(token)

            # Decode and verify token
            claims = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=self.app_client_id,
                issuer=self.issuer,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                    "verify_aud": True,
                    "verify_iss": True
                }
            )

            return claims

        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return None

    def extract_user_info(self, claims: Dict) -> Dict:
        """Extract user information from token claims"""
        return {
            "user_id": claims.get("sub"),  # Cognito user ID
            "username": claims.get("cognito:username", claims.get("username")),
            "email": claims.get("email"),
            "email_verified": claims.get("email_verified", False),
            "phone": claims.get("phone_number"),
            "name": claims.get("name")
        }


# Global auth instance
cognito_auth = CognitoAuth()


def require_auth(f):
    """
    Decorator to require authentication on Flask routes
    Automatically syncs users from Cognito to PostgreSQL on first authentication

    Usage:
        @app.route('/protected')
        @require_auth
        def protected_route():
            user_info = request.user_info
            user = request.user  # PostgreSQL User model instance
            return jsonify(user_info)
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Missing authorization header"}), 401

        # Expected format: "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid authorization header format"}), 401

        token = parts[1]

        # Verify token
        claims = cognito_auth.verify_token(token)
        if not claims:
            return jsonify({"error": "Invalid or expired token"}), 401

        # Extract user info from token
        user_info = cognito_auth.extract_user_info(claims)
        
        # Sync user from Cognito to PostgreSQL (create if doesn't exist)
        try:
            # Import here to avoid circular dependencies at module level
            from ..services.user_service import user_service
            user = user_service.get_or_create_user_from_cognito(user_info)
            
            if not user:
                logger.error(f"Failed to sync user {user_info.get('user_id')} from Cognito")
                return jsonify({"error": "Failed to sync user account"}), 500
            
            # Attach user info and PostgreSQL user to request
            request.user_info = user_info
            request.user_id = user_info["user_id"]
            request.user = user  # PostgreSQL User model instance
            
        except Exception as e:
            logger.error(f"Error syncing user from Cognito: {e}", exc_info=True)
            return jsonify({"error": "Failed to sync user account"}), 500

        return f(*args, **kwargs)

    return decorated_function


def extract_token_from_request() -> Optional[str]:
    """Extract JWT token from request (header or query param)"""
    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    if auth_header:
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1]

    # Try query parameter (for WebSocket connections)
    token = request.args.get("token")
    if token:
        return token

    return None
