"""
PostgreSQL database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from config.settings import settings

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,  # Verify connections before using
    echo=settings.FLASK_DEBUG
)

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
