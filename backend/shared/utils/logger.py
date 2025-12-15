"""
Logging configuration for all services
"""
import logging
import sys
import json
from datetime import datetime
from typing import Optional, Dict, Any
from shared.config.settings import settings


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    Uses Python's built-in json module - no external dependencies
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add extra fields if present
        if hasattr(record, 'method'):
            log_data["method"] = record.method
        if hasattr(record, 'path'):
            log_data["path"] = record.path
        if hasattr(record, 'user_id'):
            log_data["user_id"] = record.user_id
        if hasattr(record, 'status_code'):
            log_data["status_code"] = record.status_code
        if hasattr(record, 'duration_ms'):
            log_data["duration_ms"] = record.duration_ms
        if hasattr(record, 'error_type'):
            log_data["error_type"] = record.error_type
        if hasattr(record, 'error_message'):
            log_data["error_message"] = record.error_message
        if hasattr(record, 'context'):
            log_data["context"] = record.context
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


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

    # Use JSON formatter for production, regular formatter for development
    if settings.FLASK_ENV == "production":
        formatter = JSONFormatter()
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
