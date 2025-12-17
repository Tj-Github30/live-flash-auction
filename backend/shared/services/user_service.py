"""
User Service - Synchronizes users from Cognito to PostgreSQL
"""
from typing import Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from shared.database.connection import SessionLocal
from shared.models.user import User
from shared.models.auction import Auction
from shared.utils.logger import setup_logger
import uuid

logger = setup_logger("user-service")


class UserService:
    """Service for user management and synchronization"""

    def _apply_cognito_fields(self, user: User, cognito_user_info: Dict, db) -> bool:
        """
        Apply Cognito fields to an existing DB user.
        Returns True if any field changed.
        """
        updated = False

        email = cognito_user_info.get("email")
        name = cognito_user_info.get("name")
        phone = cognito_user_info.get("phone")
        email_verified = cognito_user_info.get("email_verified")
        username = cognito_user_info.get("username")

        if email and user.email != email:
            user.email = email
            updated = True

        if name and user.name != name:
            user.name = name
            updated = True

        if phone and user.phone != phone:
            user.phone = phone
            updated = True

        if email_verified is not None and user.is_verified != bool(email_verified):
            user.is_verified = bool(email_verified)
            updated = True

        # Best-effort: update username if provided and not taken by someone else.
        if username and user.username != username:
            existing_username = db.query(User).filter(User.username == username, User.user_id != user.user_id).first()
            if not existing_username:
                user.username = username
                updated = True

        return updated

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
                if self._apply_cognito_fields(user, cognito_user_info, db):
                    db.commit()
                    logger.info(f"Updated user {user_uuid} from Cognito")
                return user

            # User doesn't exist - create new user
            email = cognito_user_info.get("email")
            username = cognito_user_info.get("username")
            
            if not email:
                logger.error(f"Missing email for user {cognito_user_id}")
                return None

            # IMPORTANT: If a user already exists with this email, reuse it instead of
            # failing with a unique constraint. This can happen if a user was created
            # earlier with a different UUID (legacy data/imports).
            existing_by_email = db.query(User).filter(User.email == email).first()
            if existing_by_email:
                # If legacy data exists where the same email is stored under a different UUID,
                # we must reconcile it. Otherwise downstream writes that reference Cognito `sub`
                # (like auction.host_user_id) will fail FK checks.
                #
                # Safe automated fix:
                # - If the legacy user_id is NOT referenced by any auctions, delete the legacy row
                #   and recreate the user with the Cognito `sub` as user_id.
                # - If it IS referenced, perform an in-place migration:
                #     - update auctions.host_user_id/winner_id from legacy_id -> cognito_sub
                #     - update users.user_id from legacy_id -> cognito_sub
                #   This preserves FK integrity and restores the invariant:
                #     users.user_id == Cognito sub
                if existing_by_email.user_id != user_uuid:
                    legacy_id = existing_by_email.user_id
                    hosted_count = db.query(Auction).filter(Auction.host_user_id == legacy_id).count()
                    won_count = db.query(Auction).filter(Auction.winner_id == legacy_id).count()

                    if hosted_count == 0 and won_count == 0:
                        logger.warning(
                            f"Legacy user row detected for email={email}. "
                            f"Deleting legacy user_id={legacy_id} and recreating with Cognito sub={user_uuid}."
                        )
                        try:
                            db.delete(existing_by_email)
                            db.commit()
                        except Exception as delete_err:
                            db.rollback()
                            logger.error(
                                f"Failed to delete legacy user row for email={email}: {delete_err}",
                                exc_info=True
                            )
                        else:
                            # Proceed to create a fresh row using Cognito UUID
                            existing_by_email = None
                    else:
                        logger.warning(
                            f"Legacy user_id mismatch for email={email}. "
                            f"Migrating legacy_id={legacy_id} -> cognito_sub={user_uuid} (including auctions references)."
                        )
                        try:
                            # FK-safe migration strategy (non-deferrable FK):
                            # 1) Rename legacy user's unique fields (email/username) so we can create the new row.
                            # 2) Insert a new user row with user_id=cognito_sub and the real email/username.
                            # 3) Update auctions host_user_id/winner_id to point to the new user_id.
                            # 4) Delete the legacy user row.
                            legacy_email = existing_by_email.email
                            legacy_username = existing_by_email.username
                            suffix = str(legacy_id)[:8]
                            tmp_email = f"{legacy_email}.legacy.{suffix}"
                            tmp_username = f"{legacy_username}_legacy_{suffix}"

                            db.execute(
                                text(
                                    "UPDATE users SET email = :tmp_email, username = :tmp_username "
                                    "WHERE user_id = :old_id"
                                ),
                                {"tmp_email": tmp_email, "tmp_username": tmp_username, "old_id": legacy_id},
                            )

                            # Insert the new user row with the Cognito sub as PK
                            new_username = cognito_user_info.get("username") or legacy_username
                            db.execute(
                                text(
                                    "INSERT INTO users (user_id, email, username, name, phone, is_verified) "
                                    "VALUES (:new_id, :email, :username, :name, :phone, :is_verified)"
                                ),
                                {
                                    "new_id": user_uuid,
                                    "email": legacy_email,
                                    "username": new_username,
                                    "name": cognito_user_info.get("name") or existing_by_email.name,
                                    "phone": cognito_user_info.get("phone") or existing_by_email.phone,
                                    "is_verified": bool(cognito_user_info.get("email_verified", existing_by_email.is_verified)),
                                },
                            )

                            # Re-point auctions to the new user_id (now FK-valid because user exists)
                            db.execute(
                                text("UPDATE auctions SET host_user_id = :new_id WHERE host_user_id = :old_id"),
                                {"new_id": user_uuid, "old_id": legacy_id},
                            )
                            db.execute(
                                text("UPDATE auctions SET winner_id = :new_id WHERE winner_id = :old_id"),
                                {"new_id": user_uuid, "old_id": legacy_id},
                            )

                            # Remove legacy user row
                            db.execute(
                                text("DELETE FROM users WHERE user_id = :old_id"),
                                {"old_id": legacy_id},
                            )

                            db.commit()
                        except Exception as migrate_err:
                            db.rollback()
                            logger.error(
                                f"Failed to migrate legacy user_id for email={email}: {migrate_err}",
                                exc_info=True,
                            )
                        else:
                            # Reload the user by the new PK
                            existing_by_email = db.query(User).filter(User.user_id == user_uuid).first()

                if existing_by_email:
                    if self._apply_cognito_fields(existing_by_email, cognito_user_info, db):
                        try:
                            db.commit()
                        except Exception:
                            db.rollback()
                    logger.warning(
                        f"User email already exists in DB; reusing existing user record for {email}. "
                        f"DB user_id={existing_by_email.user_id} Cognito sub={user_uuid}"
                    )
                    return existing_by_email
            
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
            except IntegrityError as commit_error:
                db.rollback()
                # If a concurrent request created the user first, fall back to selecting by email.
                existing = db.query(User).filter(User.email == email).first()
                if existing:
                    logger.info(f"User already exists after insert race; reusing {email}")
                    return existing
                logger.error(f"IntegrityError committing user to database: {commit_error}", exc_info=True)
                raise
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

