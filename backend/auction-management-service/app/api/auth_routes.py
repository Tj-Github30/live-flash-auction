"""
Authentication API Routes
"""
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from shared.config import settings
from shared.utils.logger import setup_logger
from shared.services.cognito_auth_service import cognito_auth_service
from shared.auth.cognito import cognito_auth
from shared.services.user_service import user_service

bp = Blueprint("auth", __name__, url_prefix="/api/auth")
logger = setup_logger("auth-routes")


@bp.route("/initiate", methods=["POST"])
@cross_origin(
    origins=settings.cors_origins_list,
    methods=["POST", "OPTIONS"],
    headers=["Content-Type", "Authorization"],
    supports_credentials=True,
    automatic_options=True
)
def initiate_auth():
    """Initiate authentication flow - sends OTP"""
    
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        is_signup = data.get("isSignup", False)
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        if is_signup:
            # Signup flow - name might be in request or we'll get it in verify-otp
            # For now, try to get from request, otherwise use email as fallback
            name = data.get("name", "").strip()
            if not name:
                # Name will be provided in verify-otp, store email temporarily
                # Use email prefix as temporary name
                name = email.split("@")[0]
            
            session, challenge_name = cognito_auth_service.initiate_signup(email, name)
            
            if session is None:
                logger.error(f"Signup failed for {email}: {challenge_name}")
                return jsonify({"error": challenge_name}), 400
            
            logger.info(f"Signup initiated successfully for {email}. Session: {session}, Challenge: {challenge_name}")
            return jsonify({
                "session": session,
                "challengeName": challenge_name or "SIGN_UP",
                "message": "OTP sent to your email"
            }), 200
        else:
            # Login flow
            session, challenge_name, error = cognito_auth_service.initiate_login(email)
            
            if session is None:
                return jsonify({"error": error or "Failed to initiate login"}), 400
            
            logger.info(f"Login initiated for {email}")
            return jsonify({
                "session": session,
                "challengeName": challenge_name or "CUSTOM_AUTH"
            }), 200
            
    except Exception as e:
        logger.error(f"Error initiating auth: {e}", exc_info=True)
        return jsonify({"error": "Failed to initiate authentication"}), 500


@bp.route("/resend-code", methods=["POST"])
@cross_origin(
    origins=settings.cors_origins_list,
    methods=["POST", "OPTIONS"],
    headers=["Content-Type", "Authorization"],
    supports_credentials=True,
    automatic_options=True
)
def resend_code():
    """Resend verification code"""
    
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        success, error = cognito_auth_service.resend_confirmation_code(email)
        
        if not success:
            return jsonify({"error": error or "Failed to resend code"}), 400
        
        logger.info(f"Confirmation code resent to {email}")
        return jsonify({"message": "Verification code resent successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error resending code: {e}", exc_info=True)
        return jsonify({"error": "Failed to resend code"}), 500


@bp.route("/verify-otp", methods=["POST"])
@cross_origin(
    origins=settings.cors_origins_list,
    methods=["POST", "OPTIONS"],
    headers=["Content-Type", "Authorization"],
    supports_credentials=True,
    automatic_options=True
)
def verify_otp():
    """Verify OTP code and return tokens"""
    
    try:
        data = request.get_json()
        email = data.get("email", "").strip().lower()
        otp = data.get("otp", "").strip()
        session = data.get("session", "")
        is_signup = data.get("isSignup", False)
        challenge_name = data.get("challengeName", "")
        
        if not email or not otp:
            return jsonify({"error": "Email and OTP are required"}), 400
        
        if is_signup:
            # Signup verification
            if not session:
                return jsonify({"error": "Session is required"}), 400
            
            # Get name from request if provided
            name = data.get("name", "").strip()
            
            tokens, error = cognito_auth_service.verify_signup_otp_and_get_tokens(email, session, otp, name)
            
            if tokens is None:
                return jsonify({"error": error or "Failed to verify OTP"}), 400
            
            # Sync user to database immediately after signup
            try:
                # Extract user info from ID token
                claims = cognito_auth.verify_token(tokens.get("idToken"))
                if claims:
                    user_info = cognito_auth.extract_user_info(claims)
                    # Add name if provided
                    if name:
                        user_info["name"] = name
                    
                    # Sync user to PostgreSQL
                    db_user = user_service.get_or_create_user_from_cognito(user_info)
                    if db_user:
                        logger.info(f"✅ User synced to database: {email} (ID: {db_user.user_id})")
                    else:
                        logger.warning(f"⚠️ Failed to sync user to database: {email}")
                else:
                    logger.warning(f"⚠️ Could not extract user info from token for {email}")
            except Exception as sync_error:
                # Don't fail the request if sync fails, just log it
                logger.error(f"Error syncing user to database after signup: {sync_error}", exc_info=True)
            
            logger.info(f"Signup completed for {email}")
            return jsonify({
                "idToken": tokens.get("idToken"),
                "accessToken": tokens.get("accessToken"),
                "refreshToken": tokens.get("refreshToken"),
                "expiresIn": tokens.get("expiresIn", 3600)
            }), 200
        else:
            # Login verification
            if not session or not challenge_name:
                return jsonify({"error": "Session and challenge name are required"}), 400
            
            tokens, error = cognito_auth_service.verify_login_otp(email, session, otp, challenge_name)
            
            if tokens is None:
                return jsonify({"error": error or "Failed to verify OTP"}), 400
            
            # Sync user to database immediately after login
            try:
                # Extract user info from ID token
                claims = cognito_auth.verify_token(tokens.get("idToken"))
                if claims:
                    user_info = cognito_auth.extract_user_info(claims)
                    
                    # Sync user to PostgreSQL
                    db_user = user_service.get_or_create_user_from_cognito(user_info)
                    if db_user:
                        logger.info(f"✅ User synced to database: {email} (ID: {db_user.user_id})")
                    else:
                        logger.warning(f"⚠️ Failed to sync user to database: {email}")
                else:
                    logger.warning(f"⚠️ Could not extract user info from token for {email}")
            except Exception as sync_error:
                # Don't fail the request if sync fails, just log it
                logger.error(f"Error syncing user to database after login: {sync_error}", exc_info=True)
            
            logger.info(f"Login successful for {email}")
            return jsonify({
                "idToken": tokens.get("idToken"),
                "accessToken": tokens.get("accessToken"),
                "refreshToken": tokens.get("refreshToken"),
                "expiresIn": tokens.get("expiresIn", 3600)
            }), 200
            
    except Exception as e:
        logger.error(f"Error verifying OTP: {e}", exc_info=True)
        return jsonify({"error": "Failed to verify OTP"}), 500

