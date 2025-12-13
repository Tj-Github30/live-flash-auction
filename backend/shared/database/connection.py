"""
PostgreSQL database connection and session management
"""
from sqlalchemy import create_engine, String, TypeDecorator
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from shared.config import settings
import uuid

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,  # Verify connections before using
    echo=settings.FLASK_DEBUG
)


class GUID(TypeDecorator):
    """
    Platform-independent GUID type.
    Uses PostgreSQL's UUID type when available, otherwise uses String(36).
    """
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgresUUID(as_uuid=True))
        else:
            # SQLite: Use String(36) to store UUID as string
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            # PostgreSQL expects UUID object (PostgresUUID with as_uuid=True)
            if isinstance(value, str):
                try:
                    return uuid.UUID(value)
                except (ValueError, AttributeError):
                    return value
            return value
        else:
            # SQLite expects string
            if isinstance(value, uuid.UUID):
                return str(value)
            # If already a string, return as-is
            return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, str):
                return uuid.UUID(value)
            return value

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create scoped session for thread-safety
db_session = scoped_session(SessionLocal)

# Base class for models
Base = declarative_base()
Base.query = db_session.query_property()


def init_db():
    """Initialize database - create all tables"""
    import models.user
    import models.auction
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for getting DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
