"""
User model
"""
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
import uuid
from shared.database.connection import Base, GUID


class User(Base):
    __tablename__ = "users"

    user_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    name = Column(String(255))
    username = Column(String(100), unique=True, nullable=False, index=True)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "user_id": str(self.user_id),
            "email": self.email,
            "phone": self.phone,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "name": self.name,
            "username": self.username
        }

    def __repr__(self):
        return f"<User {self.username} ({self.email})>"
