from flask import Blueprint, request, jsonify
import boto3
import os
import secrets
import string
import time
from botocore.exceptions import ClientError

bp = Blueprint("auth_routes", __name__, url_prefix="/api/auth")

COGNITO_REGION = os.getenv("COGNITO_REGION", "us-east-1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID") or os.getenv("COGNITO_APP_CLIENT_ID")

cognito_client = boto3.client("cognito-idp", region_name=COGNITO_REGION)


@bp.route("/initiate", methods=["POST", "OPTIONS"])
def initiate_auth():
    """
    Start authentication flow - sends OTP to user's email.
    For signup: Creates user silently if doesn't exist, then sends OTP.
    For login: Sends OTP to existing user.
    Expects: { "email": "user@example.com", "isSignup": true/false (optional) }
    Returns: { "session": "session_token", "challengeName": "..." }
    """
    if request.method == "OPTIONS":
        return "", 200
    
    data = request.get_json() or {}
    email = data.get("email")
    is_signup = data.get("isSignup", False)
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    if not COGNITO_CLIENT_ID:
        return jsonify({"error": "Cognito client ID not configured"}), 500
    
    if not COGNITO_USER_POOL_ID:
        return jsonify({"error": "Cognito user pool ID not configured"}), 500
    
    try:
        cognito_client = boto3.client("cognito-idp", region_name=COGNITO_REGION)
        
        if is_signup:
            try:
                cognito_client.admin_get_user(
                    UserPoolId=COGNITO_USER_POOL_ID,
                    Username=email,
                )
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code")
                if error_code == "UserNotFoundException":
                    uppercase = secrets.choice(string.ascii_uppercase)
                    lowercase = secrets.choice(string.ascii_lowercase)
                    digit = secrets.choice(string.digits)
                    symbol = secrets.choice("!@#$%^&*()_+-=[]{}|;:,.<>?")
                    remaining = ''.join(secrets.choice(string.ascii_letters + string.digits + "!@#$%^&*()_+-=[]{}|;:,.<>?") 
                                       for _ in range(8))
                    password_chars = list(uppercase + lowercase + digit + symbol + remaining)
                    secrets.SystemRandom().shuffle(password_chars)
                    temp_password = ''.join(password_chars).strip()
                    
                    cognito_client.admin_create_user(
                        UserPoolId=COGNITO_USER_POOL_ID,
                        Username=email,
                        UserAttributes=[
                            {"Name": "email", "Value": email},
                            {"Name": "email_verified", "Value": "false"},
                        ],
                        TemporaryPassword=temp_password,
                        MessageAction="SUPPRESS",
                        DesiredDeliveryMediums=["EMAIL"],
                    )
                    
                    try:
                        cognito_client.admin_set_user_password(
                            UserPoolId=COGNITO_USER_POOL_ID,
                            Username=email,
                            Password=temp_password,
                            Permanent=True,
                        )
                        print(f"Set permanent password for user: {email}")
                    except ClientError as password_error:
                        print(f"Warning: Could not set permanent password: {password_error}")
                    
                    print(f"Created user silently: {email}")
                    time.sleep(1.5)
                else:
                    raise
        
        response = cognito_client.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow="USER_AUTH",
            AuthParameters={
                "USERNAME": email,
            },
        )
        
        challenge_name = response.get("ChallengeName")
        session = response.get("Session")
        challenge_params = response.get("ChallengeParameters", {})
        
        print(f"DEBUG: Challenge Name: {challenge_name}")
        print(f"DEBUG: Challenge Parameters: {challenge_params}")
        
        if challenge_name == "SELECT_CHALLENGE":
            print(f"DEBUG: Got SELECT_CHALLENGE, selecting EMAIL_OTP...")
            try:
                select_response = cognito_client.respond_to_auth_challenge(
                    ClientId=COGNITO_CLIENT_ID,
                    ChallengeName="SELECT_CHALLENGE",
                    Session=session,
                    ChallengeResponses={
                        "USERNAME": email,
                        "ANSWER": "EMAIL_OTP",
                    },
                )
                
                new_challenge = select_response.get("ChallengeName")
                new_session = select_response.get("Session")
                new_challenge_params = select_response.get("ChallengeParameters", {})
                
                print(f"DEBUG: Successfully selected EMAIL_OTP!")
                print(f"DEBUG: New challenge: {new_challenge}")
                print(f"DEBUG: New challenge parameters: {new_challenge_params}")
                
                if new_challenge == "EMAIL_OTP":
                    print(f"DEBUG: EMAIL_OTP challenge selected, OTP should be sent to {email}")
                
                return jsonify({
                    "session": new_session,
                    "challengeName": new_challenge,
                    "message": "OTP sent to your email",
                }), 200
                
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code")
                error_message = e.response.get("Error", {}).get("Message", str(e))
                print(f"ERROR: Failed to select EMAIL_OTP: {error_code} - {error_message}")
                
                if "Attempt limit exceeded" in error_message or "Too many attempts" in error_message:
                    return jsonify({
                        "error": "Too many attempts. Please wait 15-30 minutes before trying again, or use a different email address.",
                        "errorCode": "RATE_LIMIT_EXCEEDED"
                    }), 429
                
                return jsonify({"error": f"Failed to select challenge: {error_message}"}), 400
        
        return jsonify({
            "session": session,
            "challengeName": challenge_name,
            "message": "OTP sent to your email",
        }), 200
        
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        error_message = e.response.get("Error", {}).get("Message", str(e))
        
        if error_code == "UserNotFoundException":
            return jsonify({"error": "User not found"}), 404
        elif error_code == "NotAuthorizedException":
            return jsonify({"error": "Invalid credentials"}), 401
        else:
            return jsonify({"error": error_message}), 400
    except Exception as e:
        return jsonify({"error": f"Authentication error: {str(e)}"}), 500


@bp.route("/verify-otp", methods=["POST", "OPTIONS"])
def verify_otp():
    """
    Verify OTP and complete authentication.
    For signup: Confirms user after successful OTP verification.
    For login: Just verifies OTP and returns tokens.
    Expects: { "session": "session_token", "otp": "123456", "email": "user@example.com", "isSignup": true/false (optional) }
    Returns: { "idToken": "...", "accessToken": "...", "expiresIn": 3600 }
    """
    if request.method == "OPTIONS":
        return "", 200
    
    data = request.get_json() or {}
    session = data.get("session")
    otp = data.get("otp")
    email = data.get("email", "")
    is_signup = data.get("isSignup", False)
    
    if not session or not otp:
        return jsonify({"error": "Session and OTP are required"}), 400
    
    if not COGNITO_CLIENT_ID:
        return jsonify({"error": "Cognito client ID not configured"}), 500
    
    try:
        cognito_client = boto3.client("cognito-idp", region_name=COGNITO_REGION)
        
        challenge_names_to_try = ["EMAIL_OTP", "CUSTOM_CHALLENGE", "SOFTWARE_TOKEN_MFA"]
        
        for challenge_name in challenge_names_to_try:
            try:
                challenge_responses = {"USERNAME": email}
                
                if challenge_name == "EMAIL_OTP":
                    challenge_responses["EMAIL_OTP_CODE"] = otp
                elif challenge_name == "CUSTOM_CHALLENGE":
                    challenge_responses["ANSWER"] = otp
                elif challenge_name == "SOFTWARE_TOKEN_MFA":
                    challenge_responses["SOFTWARE_TOKEN_MFA_CODE"] = otp
                
                response = cognito_client.respond_to_auth_challenge(
                    ClientId=COGNITO_CLIENT_ID,
                    ChallengeName=challenge_name,
                    Session=session,
                    ChallengeResponses=challenge_responses,
                )
                
                auth_result = response.get("AuthenticationResult")
                if auth_result:
                    if is_signup:
                        try:
                            cognito_client.admin_confirm_sign_up(
                                UserPoolId=COGNITO_USER_POOL_ID,
                                Username=email,
                            )
                            cognito_client.admin_update_user_attributes(
                                UserPoolId=COGNITO_USER_POOL_ID,
                                Username=email,
                                UserAttributes=[
                                    {"Name": "email_verified", "Value": "true"},
                                ],
                            )
                            print(f"✓ Confirmed and verified user: {email}")
                        except ClientError as confirm_error:
                            error_code = confirm_error.response.get("Error", {}).get("Code")
                            if error_code != "NotAuthorizedException":
                                print(f"Warning: Could not confirm user: {confirm_error}")
                    
                    return jsonify({
                        "idToken": auth_result.get("IdToken"),
                        "accessToken": auth_result.get("AccessToken"),
                        "expiresIn": auth_result.get("ExpiresIn", 3600),
                    }), 200
                
                new_challenge = response.get("ChallengeName")
                new_session = response.get("Session")
                if new_challenge:
                    return jsonify({
                        "session": new_session,
                        "challengeName": new_challenge,
                        "message": "Additional verification required",
                    }), 200
                    
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code")
                error_message = e.response.get("Error", {}).get("Message", str(e))
                print(f"DEBUG: Challenge {challenge_name} failed: {error_code} - {error_message}")
                
                if challenge_names_to_try.index(challenge_name) < len(challenge_names_to_try) - 1:
                    continue
                raise
        
        return jsonify({"error": "Could not verify OTP"}), 400
        
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        error_message = e.response.get("Error", {}).get("Message", str(e))
        
        if error_code == "CodeMismatchException":
            return jsonify({"error": "Invalid OTP code"}), 400
        elif error_code == "NotAuthorizedException":
            return jsonify({"error": "Session expired or invalid"}), 401
        else:
            return jsonify({"error": error_message}), 400
    except Exception as e:
        return jsonify({"error": f"Verification error: {str(e)}"}), 500


@bp.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    """
    DEPRECATED: Use /initiate with isSignup=true instead.
    This endpoint is kept for backward compatibility but redirects to initiate.
    """
    if request.method == "OPTIONS":
        return "", 200
    
    data = request.get_json() or {}
    email = data.get("email")
    name = data.get("name", "")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    return initiate_auth()