"""
Cognito Authentication Service - Handles signup and login with OTP
"""
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Optional, Tuple
from shared.config import settings
from shared.utils.logger import setup_logger
import secrets
import string

logger = setup_logger("cognito-auth-service")


class CognitoAuthService:
    """Service for Cognito authentication with OTP flow"""

    def __init__(self):
        self.region = settings.COGNITO_REGION
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        self.app_client_id = settings.COGNITO_APP_CLIENT_ID
        
        # Initialize Cognito client (public API, no credentials needed for most operations)
        # Only use credentials if explicitly provided (for admin operations)
        client_kwargs = {'region_name': self.region}
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            client_kwargs['aws_access_key_id'] = settings.AWS_ACCESS_KEY_ID
            client_kwargs['aws_secret_access_key'] = settings.AWS_SECRET_ACCESS_KEY

        self.client = boto3.client('cognito-idp', **client_kwargs)
        
        # Validate required settings
        if not self.user_pool_id or not self.app_client_id:
            logger.warning("Cognito User Pool ID or App Client ID not configured!")

    def initiate_signup(self, email: str, name: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Initiate signup process - creates user silently if doesn't exist, then uses initiate_auth
        Based on working implementation from GitHub
        
        Args:
            email: User email
            name: User full name
            
        Returns:
            Tuple of (session, challenge_name) or (None, error_message)
        """
        try:
            logger.info(f"Attempting signup for {email} with user pool {self.user_pool_id}")
            
            # Check if user exists, create silently if not (requires Cognito admin permissions)
            try:
                self.client.admin_get_user(
                    UserPoolId=self.user_pool_id,
                    Username=email,
                )
                logger.info(f"User already exists: {email}")
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code")
                if error_code == "UserNotFoundException":
                    temp_password = self._generate_temp_password()
                    self.client.admin_create_user(
                        UserPoolId=self.user_pool_id,
                        Username=email,
                        UserAttributes=[
                            {"Name": "email", "Value": email},
                            # Keep false until OTP verification completes
                            {"Name": "email_verified", "Value": "false"},
                        ],
                        TemporaryPassword=temp_password,
                        MessageAction="SUPPRESS",
                        DesiredDeliveryMediums=["EMAIL"],
                    )

                    # Make the password permanent so the user is active (admin-created users default to FORCE_CHANGE_PASSWORD)
                    self.client.admin_set_user_password(
                        UserPoolId=self.user_pool_id,
                        Username=email,
                        Password=temp_password,
                        Permanent=True,
                    )
                    logger.info(f"Created user silently: {email}")

                    import time
                    time.sleep(1.5)  # brief delay to ensure user is ready
                else:
                    # If it's AccessDenied/etc, surface it so we don't silently proceed into confusing SELECT_CHALLENGE.
                    raise

            # Now use public initiate_auth API (no credentials needed)
            try:
                response = self.client.initiate_auth(
                    ClientId=self.app_client_id,
                    AuthFlow="USER_AUTH",
                    AuthParameters={
                        "USERNAME": email,
                    },
                )
            except ClientError as auth_error:
                error_code = auth_error.response.get('Error', {}).get('Code', '')
                error_message = auth_error.response.get('Error', {}).get('Message', str(auth_error))
                
                if error_code == 'UserNotFoundException':
                    logger.error(f"User {email} not found. Cannot send OTP without creating user first.")
                    return None, f"User not found. Please configure AWS credentials for automatic user creation, or create the user manually in Cognito console first."
                else:
                    logger.error(f"initiate_auth failed for {email}: {error_code} - {error_message}")
                    return None, f"Failed to initiate authentication: {error_message}"
            
            challenge_name = response.get("ChallengeName")
            session = response.get("Session")
            challenge_params = response.get("ChallengeParameters", {})
            
            logger.info(f"DEBUG: Challenge Name: {challenge_name}")
            logger.info(f"DEBUG: Challenge Parameters: {challenge_params}")
            
            # Log code delivery details if available
            code_delivery = challenge_params.get("CODE_DELIVERY_DESTINATION") or challenge_params.get("CODE_DELIVERY_DELIVERY_MEDIUM")
            if code_delivery:
                logger.info(f"✅ OTP code delivery info: {code_delivery}")
            else:
                logger.warning(f"⚠️ No code delivery info in challenge parameters. OTP may not have been sent.")
            
            if challenge_name == "SELECT_CHALLENGE":
                logger.info(f"DEBUG: Got SELECT_CHALLENGE, selecting EMAIL_OTP...")
                try:
                    select_response = self.client.respond_to_auth_challenge(
                        ClientId=self.app_client_id,
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
                    
                    logger.info(f"DEBUG: Successfully selected EMAIL_OTP!")
                    logger.info(f"DEBUG: New challenge: {new_challenge}")
                    logger.info(f"DEBUG: New challenge parameters: {new_challenge_params}")
                    
                    if new_challenge == "EMAIL_OTP":
                        logger.info(f"DEBUG: EMAIL_OTP challenge selected, OTP should be sent to {email}")
                    
                    return new_session, new_challenge
                    
                except ClientError as e:
                    error_code = e.response.get("Error", {}).get("Code")
                    error_message = e.response.get("Error", {}).get("Message", str(e))
                    logger.error(f"ERROR: Failed to select EMAIL_OTP: {error_code} - {error_message}")
                    
                    if "Attempt limit exceeded" in error_message or "Too many attempts" in error_message:
                        return None, "Too many attempts. Please wait 15-30 minutes before trying again, or use a different email address."
                    
                    return None, f"Failed to select challenge: {error_message}"
            
            logger.info(f"OTP sent to {email}")
            return session, challenge_name
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            logger.error(f"Cognito signup error for {email}: {error_code} - {error_message}")
            
            if error_code == 'UsernameExistsException' or error_code == 'AliasExistsException':
                logger.warning(f"User {email} already exists")
                return None, "User already exists. Please login instead."
            elif error_code == 'InvalidParameterException':
                logger.error(f"Invalid parameter for {email}: {error_message}")
                return None, f"Invalid signup parameters: {error_message}"
            elif error_code == 'LimitExceededException':
                logger.error(f"Rate limit exceeded for {email}")
                return None, "Too many requests. Please try again later."
            else:
                logger.error(f"Signup error for {email}: {error_code} - {error_message}")
                return None, f"Signup failed: {error_message}"
        except Exception as e:
            error_str = str(e)
            # Check if it's a credentials error
            if "Unable to locate credentials" in error_str or "NoCredentialsError" in error_str:
                logger.warning(f"AWS credentials not configured. Skipping admin operations and using public API only.")
                # Try to use initiate_auth directly without admin operations
                try:
                    response = self.client.initiate_auth(
                        ClientId=self.app_client_id,
                        AuthFlow="USER_AUTH",
                        AuthParameters={
                            "USERNAME": email,
                        },
                    )
                    
                    challenge_name = response.get("ChallengeName")
                    session = response.get("Session")
                    
                    if challenge_name == "SELECT_CHALLENGE":
                        select_response = self.client.respond_to_auth_challenge(
                            ClientId=self.app_client_id,
                            ChallengeName="SELECT_CHALLENGE",
                            Session=session,
                            ChallengeResponses={
                                "USERNAME": email,
                                "ANSWER": "EMAIL_OTP",
                            },
                        )
                        return select_response.get("Session"), select_response.get("ChallengeName")
                    
                    return session, challenge_name
                except ClientError as auth_e:
                    error_code = auth_e.response.get('Error', {}).get('Code', '')
                    error_message = auth_e.response.get('Error', {}).get('Message', str(auth_e))
                    if error_code == 'UserNotFoundException':
                        return None, "User not found. Please configure AWS credentials for automatic user creation, or use the Cognito hosted UI to sign up first."
                    return None, f"Authentication failed: {error_message}"
            
            logger.error(f"Unexpected signup error for {email}: {e}", exc_info=True)
            return None, f"Unexpected error: {str(e)}"

    def resend_confirmation_code(self, email: str) -> Tuple[bool, Optional[str]]:
        """
        Resend confirmation code to email
        
        Args:
            email: User email
            
        Returns:
            Tuple of (success, error_message)
        """
        try:
            response = self.client.resend_confirmation_code(
                ClientId=self.app_client_id,
                Username=email
            )
            
            code_delivery_details = response.get('CodeDeliveryDetails')
            if code_delivery_details:
                delivery_medium = code_delivery_details.get('DeliveryMedium', 'UNKNOWN')
                destination = code_delivery_details.get('Destination', 'UNKNOWN')
                logger.info(f"✅ Confirmation code resent via {delivery_medium} to {destination}")
            else:
                logger.warning(f"⚠️ No code delivery details when resending code for {email}")
            
            return True, None
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            if error_code == 'UserNotFoundException':
                return False, "User not found"
            elif error_code == 'LimitExceededException':
                return False, "Too many requests. Please try again later."
            else:
                logger.error(f"Error resending code for {email}: {error_message}")
                return False, f"Failed to resend code: {error_message}"
        except Exception as e:
            logger.error(f"Unexpected error resending code for {email}: {e}", exc_info=True)
            return False, f"Unexpected error: {str(e)}"

    def confirm_signup(self, email: str, confirmation_code: str) -> Tuple[bool, Optional[str]]:
        """
        Confirm signup with verification code
        
        Args:
            email: User email
            confirmation_code: OTP code from email
            
        Returns:
            Tuple of (success, error_message)
        """
        try:
            self.client.confirm_sign_up(
                ClientId=self.app_client_id,
                Username=email,
                ConfirmationCode=confirmation_code
            )
            
            logger.info(f"Signup confirmed for {email}")
            return True, None
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            if error_code == 'CodeMismatchException':
                logger.warning(f"Invalid confirmation code for {email}")
                return False, "Invalid verification code"
            elif error_code == 'ExpiredCodeException':
                logger.warning(f"Expired confirmation code for {email}")
                return False, "Verification code has expired. Please request a new one."
            elif error_code == 'NotAuthorizedException':
                logger.warning(f"User {email} already confirmed")
                return False, "User already confirmed"
            else:
                logger.error(f"Confirm signup error for {email}: {error_message}")
                return False, f"Confirmation failed: {error_message}"
        except Exception as e:
            logger.error(f"Unexpected confirm signup error for {email}: {e}", exc_info=True)
            return False, f"Unexpected error: {str(e)}"

    def initiate_login(self, email: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Initiate login - uses public initiate_auth API (no credentials needed)
        Based on working implementation from GitHub
        
        Args:
            email: User email
            
        Returns:
            Tuple of (session, challenge_name, error_message)
        """
        try:
            # Use public initiate_auth API (no credentials needed)
            response = self.client.initiate_auth(
                ClientId=self.app_client_id,
                AuthFlow='USER_AUTH',
                AuthParameters={
                    'USERNAME': email,
                }
            )
            
            challenge_name = response.get('ChallengeName')
            session = response.get('Session')
            challenge_params = response.get('ChallengeParameters', {})
            
            logger.info(f"Login challenge: {challenge_name}")
            
            # Handle SELECT_CHALLENGE (choice-based auth)
            if challenge_name == 'SELECT_CHALLENGE':
                logger.info("Got SELECT_CHALLENGE, selecting EMAIL_OTP...")
                try:
                    select_response = self.client.respond_to_auth_challenge(
                        ClientId=self.app_client_id,
                        ChallengeName='SELECT_CHALLENGE',
                        Session=session,
                        ChallengeResponses={
                            'USERNAME': email,
                            'ANSWER': 'EMAIL_OTP',
                        }
                    )
                    
                    new_challenge = select_response.get('ChallengeName')
                    new_session = select_response.get('Session')
                    
                    logger.info(f"Successfully selected EMAIL_OTP! New challenge: {new_challenge}")
                    
                    return new_session, new_challenge, None
                    
                except ClientError as e:
                    error_code = e.response.get('Error', {}).get('Code', '')
                    error_message = e.response.get('Error', {}).get('Message', str(e))
                    logger.error(f"Failed to select EMAIL_OTP: {error_code} - {error_message}")
                    
                    if 'Attempt limit exceeded' in error_message or 'Too many attempts' in error_message:
                        return None, None, "Too many attempts. Please wait 15-30 minutes before trying again."
                    
                    # Cognito can mask non-existent users (prevent user existence errors).
                    # In that case we see SELECT_CHALLENGE but no valid choice like EMAIL_OTP.
                    if 'selected challenge is not available' in str(error_message).lower():
                        return None, None, 'User not registered. Please sign up first'

                    return None, None, f"Failed to select challenge: {error_message}"
            
            logger.info(f"OTP sent to {email}")
            return session, challenge_name, None
             
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            if error_code == 'UserNotFoundException':
                logger.warning(f"User {email} not found")
                return None, None, "User not found. Please sign up first."
            elif error_code == 'NotAuthorizedException':
                return None, None, "Invalid credentials"
            else:
                logger.error(f"Login initiation error for {email}: {error_message}")
                return None, None, error_message
        except Exception as e:
            logger.error(f"Unexpected login initiation error for {email}: {e}", exc_info=True)
            return None, None, f"Unexpected error: {str(e)}"

    def verify_login_otp(self, email: str, session: str, otp: str, challenge_name: str) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Verify OTP and complete login - uses public respond_to_auth_challenge API
        Based on working implementation from GitHub
        
        Args:
            email: User email
            session: Session from initiate_login
            otp: OTP code
            challenge_name: Challenge name from initiate_login
            
        Returns:
            Tuple of (tokens_dict, error_message)
        """
        try:
            # Try different challenge response formats (public API, no credentials needed)
            challenge_names_to_try = ['EMAIL_OTP', 'CUSTOM_CHALLENGE', 'SOFTWARE_TOKEN_MFA']
            
            for challenge in challenge_names_to_try:
                try:
                    challenge_responses = {'USERNAME': email}
                    
                    if challenge == 'EMAIL_OTP':
                        challenge_responses['EMAIL_OTP_CODE'] = otp
                    elif challenge == 'CUSTOM_CHALLENGE':
                        challenge_responses['ANSWER'] = otp
                    elif challenge == 'SOFTWARE_TOKEN_MFA':
                        challenge_responses['SOFTWARE_TOKEN_MFA_CODE'] = otp
                    
                    response = self.client.respond_to_auth_challenge(
                        ClientId=self.app_client_id,
                        ChallengeName=challenge,
                        Session=session,
                        ChallengeResponses=challenge_responses
                    )
                    
                    auth_result = response.get('AuthenticationResult')
                    if auth_result:
                        tokens = {
                            'idToken': auth_result.get('IdToken'),
                            'accessToken': auth_result.get('AccessToken'),
                            'refreshToken': auth_result.get('RefreshToken'),
                            'expiresIn': auth_result.get('ExpiresIn', 3600)
                        }
                        
                        logger.info(f"Login successful for {email}")
                        return tokens, None
                    
                    # If there's another challenge
                    new_challenge = response.get('ChallengeName')
                    new_session = response.get('Session')
                    if new_challenge:
                        return None, f"Additional verification required: {new_challenge}"
                        
                except ClientError as e:
                    error_code = e.response.get('Error', {}).get('Code', '')
                    error_message = e.response.get('Error', {}).get('Message', str(e))
                    logger.debug(f"Challenge {challenge} failed: {error_code} - {error_message}")
                    
                    # If this is the last challenge to try, raise the error
                    if challenge == challenge_names_to_try[-1]:
                        raise
                    # Otherwise, continue to next challenge type
                    continue
            
            return None, "Could not verify OTP"
                
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            if error_code == 'CodeMismatchException':
                logger.warning(f"Invalid OTP for {email}")
                return None, "Invalid OTP code"
            elif error_code == 'NotAuthorizedException':
                logger.warning(f"Session expired or invalid for {email}")
                return None, "Session expired or invalid"
            elif error_code == 'ExpiredCodeException':
                logger.warning(f"Expired OTP for {email}")
                return None, "Verification code has expired"
            else:
                logger.error(f"OTP verification error for {email}: {error_message}")
                return None, error_message
        except Exception as e:
            logger.error(f"Unexpected OTP verification error for {email}: {e}", exc_info=True)
            return None, f"Unexpected error: {str(e)}"

    def verify_signup_otp_and_get_tokens(self, email: str, session: str, otp: str, name: Optional[str] = None) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Verify signup OTP and get authentication tokens
        Uses public respond_to_auth_challenge API (matching GitHub implementation)
        
        Args:
            email: User email
            session: Session from initiate_signup
            otp: OTP code from email
            name: User full name (optional, will update if provided)
            
        Returns:
            Tuple of (tokens_dict, error_message)
        """
        # Use the same verify logic as login (public API)
        tokens, error = self.verify_login_otp(email, session, otp, "EMAIL_OTP")
        
        if tokens is None:
            return None, error
        
        # If signup, confirm user and update attributes (requires admin credentials)
        # Confirm and verify the user (requires Cognito admin permissions).
        try:
            try:
                self.client.admin_confirm_sign_up(
                    UserPoolId=self.user_pool_id,
                    Username=email,
                )
                self.client.admin_update_user_attributes(
                    UserPoolId=self.user_pool_id,
                    Username=email,
                    UserAttributes=[
                        {"Name": "email_verified", "Value": "true"},
                    ],
                )
                logger.info(f"✓ Confirmed and verified user: {email}")
            except ClientError as confirm_error:
                error_code = confirm_error.response.get("Error", {}).get("Code")
                if error_code != "NotAuthorizedException":
                    logger.warning(f"Could not confirm user: {confirm_error}")
        except Exception as e:
            # If running without permissions/creds, don't fail signup verification; just log.
            logger.info(f"Skipping user confirmation/verification update for {email}: {e}")
        
        # Update name attribute if provided (requires admin credentials)
        if name:
            try:
                self.client.admin_update_user_attributes(
                    UserPoolId=self.user_pool_id,
                    Username=email,
                    UserAttributes=[
                        {'Name': 'name', 'Value': name}
                    ]
                )
                logger.info(f"Updated name attribute for {email}")
            except ClientError as e:
                logger.warning(f"Could not update name for {email}: {e}")
        
        return tokens, None

    def _generate_temp_password(self) -> str:
        """Generate a secure temporary password"""
        # Generate a random password that meets Cognito requirements
        # At least 8 chars, uppercase, lowercase, number
        length = 16
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        # Ensure it has required character types
        if not any(c.isupper() for c in password):
            password = password[:-1] + secrets.choice(string.ascii_uppercase)
        if not any(c.islower() for c in password):
            password = password[:-1] + secrets.choice(string.ascii_lowercase)
        if not any(c.isdigit() for c in password):
            password = password[:-1] + secrets.choice(string.digits)
        return password


# Global service instance
cognito_auth_service = CognitoAuthService()
