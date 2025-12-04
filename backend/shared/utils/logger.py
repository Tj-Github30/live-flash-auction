"""
Logging configuration for all services
"""
import logging
import sys
from pythonjsonlogger import jsonlogger
from config.settings import settings


def setup_logger(service_name: str) -> logging.Logger:
    """
    Setup structured JSON logger

    Args:
        service_name: Name of the service (e.g., 'auction-management')

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(service_name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))

    # Remove existing handlers
    logger.handlers = []

    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))

    # Use JSON formatter for production
    if settings.FLASK_ENV == "production":
        formatter = jsonlogger.JsonFormatter(
            "%(timestamp)s %(level)s %(name)s %(message)s",
            rename_fields={"levelname": "level", "name": "logger"}
        )
    else:
        # Use regular formatter for development
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


def log_request(logger: logging.Logger, method: str, path: str, user_id: Optional[str] = None):
    """Log incoming request"""
    logger.info(f"Request: {method} {path}", extra={
        "method": method,
        "path": path,
        "user_id": user_id
    })


def log_response(logger: logging.Logger, method: str, path: str, status_code: int, duration_ms: float):
    """Log outgoing response"""
    logger.info(f"Response: {method} {path} - {status_code}", extra={
        "method": method,
        "path": path,
        "status_code": status_code,
        "duration_ms": duration_ms
    })


def log_error(logger: logging.Logger, error: Exception, context: dict = None):
    """Log error with context"""
    logger.error(f"Error: {str(error)}", extra={
        "error_type": type(error).__name__,
        "error_message": str(error),
        "context": context or {}
    }, exc_info=True)
