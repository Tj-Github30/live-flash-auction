"""
Shared configuration settings for all services
"""
import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    DATABASE_URL: str = "postgresql://auction_user:auction_pass@localhost:5432/live_auction"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_MAX_CONNECTIONS: int = 50

    # Redis Connection Timeouts
    REDIS_SOCKET_TIMEOUT: int = 5
    REDIS_SOCKET_CONNECT_TIMEOUT: int = 3
    REDIS_SOCKET_KEEPALIVE: bool = True
    REDIS_HEALTH_CHECK_INTERVAL: int = 30
    REDIS_RETRY_ON_TIMEOUT: bool = True

    # PubSub Retry Configuration
    REDIS_PUBSUB_RETRY_ENABLED: bool = True
    REDIS_PUBSUB_RETRY_MAX_ATTEMPTS: int = 10
    REDIS_PUBSUB_RETRY_INITIAL_DELAY: int = 2
    REDIS_PUBSUB_RETRY_MAX_DELAY: int = 60
    REDIS_PUBSUB_RETRY_MULTIPLIER: float = 2.0


    # AWS
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # AWS IVS
    IVS_CHANNEL_TYPE: str = "STANDARD"

    # AWS SQS
    SQS_BID_QUEUE_URL: str = ""
    SQS_NOTIFICATION_QUEUE_URL: str = ""
    SQS_CHAT_QUEUE_URL: str = ""

    # AWS DynamoDB
    DYNAMODB_BIDS_TABLE: str = "bids_history"
    DYNAMODB_CHAT_TABLE: str = "chat_messages"

    # AWS Cognito
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_APP_CLIENT_ID: str = ""
    COGNITO_REGION: str = "us-east-1"
    COGNITO_ISSUER: str = ""

    @property
    def cognito_issuer_url(self) -> str:
        """Generate Cognito issuer URL from user pool ID and region"""
        if self.COGNITO_USER_POOL_ID:
            return f"https://cognito-idp.{self.COGNITO_REGION}.amazonaws.com/{self.COGNITO_USER_POOL_ID}"
        return self.COGNITO_ISSUER if self.COGNITO_ISSUER else ""

    # Service URLs
    AUCTION_MANAGEMENT_URL: str = "http://localhost:8000"
    WEBSOCKET_SERVICE_URL: str = "http://localhost:8001"
    BID_PROCESSING_URL: str = "http://localhost:8002"
    TIMER_SERVICE_URL: str = "http://localhost:8003"

    # Application
    FLASK_ENV: str = "development"
    FLASK_DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Auction Settings
    DEFAULT_AUCTION_DURATION: int = 3600  # 1 hour in seconds
    ANTI_SNIPE_THRESHOLD: int = 30  # seconds
    ANTI_SNIPE_EXTENSION: int = 30  # seconds
    MAX_ANTI_SNIPE_EXTENSIONS: int = 5
    MINIMUM_BID_INCREMENT: int = 100  # dollars

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # WebSocket
    WEBSOCKET_PING_INTERVAL: int = 25
    WEBSOCKET_PING_TIMEOUT: int = 60
    MAX_CONNECTIONS_PER_AUCTION: int = 1000

    # Timer Service
    TIMER_BROADCAST_INTERVAL: int = 1
    TIMER_SYNC_INTERVAL: int = 5

    # Redis Key Prefixes
    REDIS_AUCTION_PREFIX: str = "auction"
    REDIS_CONNECTION_PREFIX: str = "connection"
    REDIS_USER_PREFIX: str = "user"

    # Feature Flags
    ENABLE_CHAT_PERSISTENCE: bool = False
    ENABLE_BID_ANALYTICS: bool = False
    ENABLE_RATE_LIMITING: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env file

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()
