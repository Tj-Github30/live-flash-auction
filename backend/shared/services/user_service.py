"""
User Service - Synchronizes users from Cognito to PostgreSQL
"""
from typing import Optional, Dict
from sqlalchemy.orm import Session
from shared.database.connection import SessionLocal
from shared.models.user import User
from shared.utils.logger import setup_logger
import uuid

logger = setup_logger("user-service")


class UserService:
    """Service for user management and synchronization"""

    def get_or_create_user_from_cognito(self, cognito_user_info: Dict) -> Optional[User]:
        """
        Get existing user or create new user in PostgreSQL from Cognito data
        
        This ensures users are automatically synced from Cognito to PostgreSQL
        when they first authenticate.
        
        Args:
            cognito_user_info: Dictionary with user info from Cognito JWT token
                Expected keys:
                - user_id: Cognito sub (UUID string)
                - email: User email
                - username: Username (from cognito:username or username claim)
                - name: Full name (optional)
                - email_verified: Boolean (optional)
                - phone: Phone number (optional)
        
        Returns:
            User model instance or None if creation failed
        """
        db = SessionLocal()
        try:
            cognito_user_id = cognito_user_info.get("user_id")
            if not cognito_user_id:
                logger.error("Missing user_id in Cognito user info")
                return None

            # Convert Cognito sub (UUID string) to UUID object
            try:
                user_uuid = uuid.UUID(cognito_user_id)
            except (ValueError, TypeError) as e:
                logger.error(f"Invalid user_id format from Cognito: {cognito_user_id}, error: {e}")
                return None

            # Try to find existing user by user_id (Cognito sub)
            user = db.query(User).filter(User.user_id == user_uuid).first()

            if user:
                # User exists - update if needed
                updated = False
                
                if cognito_user_info.get("email") and user.email != cognito_user_info["email"]:
                    user.email = cognito_user_info["email"]
                    updated = True
                
                if cognito_user_info.get("name") and user.name != cognito_user_info["name"]:
                    user.name = cognito_user_info["name"]
                    updated = True
                
                if cognito_user_info.get("phone") and user.phone != cognito_user_info["phone"]:
                    user.phone = cognito_user_info["phone"]
                    updated = True
                
                if cognito_user_info.get("email_verified") is not None:
                    if user.is_verified != cognito_user_info["email_verified"]:
                        user.is_verified = cognito_user_info["email_verified"]
                        updated = True
                
                if updated:
                    db.commit()
                    logger.info(f"Updated user {user_uuid} from Cognito")
                
                return user

            # User doesn't exist - create new user
            email = cognito_user_info.get("email")
            username = cognito_user_info.get("username")
            
            if not email:
                logger.error(f"Missing email for user {cognito_user_id}")
                return None
            
            # If username not provided, generate from email
            if not username:
                username = email.split("@")[0]
                # Ensure uniqueness by appending part of UUID if needed
                existing_username = db.query(User).filter(User.username == username).first()
                if existing_username:
                    username = f"{username}_{str(user_uuid)[:8]}"
            
            # Check if username already exists (shouldn't happen, but handle it)
            existing_username = db.query(User).filter(User.username == username).first()
            if existing_username:
                username = f"{username}_{str(user_uuid)[:8]}"
            
            # Create new user
            # Ensure user_id is UUID object (GUID type will handle conversion)
            user = User(
                user_id=user_uuid,  # Use Cognito's sub as PostgreSQL user_id (UUID object)
                email=email,
                username=username,
                name=cognito_user_info.get("name"),
                phone=cognito_user_info.get("phone"),
                is_verified=cognito_user_info.get("email_verified", False)
            )
            
            db.add(user)
            try:
                db.commit()
                db.refresh(user)
            except Exception as commit_error:
                db.rollback()
                logger.error(f"Error committing user to database: {commit_error}", exc_info=True)
                raise
            
            logger.info(f"Created new user {user_uuid} ({email}) from Cognito")
            return user

        except Exception as e:
            db.rollback()
            logger.error(f"Error syncing user from Cognito: {e}", exc_info=True)
            return None
        finally:
            db.close()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """
        Get user by ID (UUID string)
        
        Args:
            user_id: UUID string
        
        Returns:
            User model instance or None
        """
        db = SessionLocal()
        try:
            user_uuid = uuid.UUID(user_id)
            return db.query(User).filter(User.user_id == user_uuid).first()
        except (ValueError, TypeError):
            logger.error(f"Invalid user_id format: {user_id}")
            return None
        finally:
            db.close()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email
        
        Args:
            email: User email
        
        Returns:
            User model instance or None
        """
        db = SessionLocal()
        try:
            return db.query(User).filter(User.email == email).first()
        finally:
            db.close()


# Global user service instance
user_service = UserService()

