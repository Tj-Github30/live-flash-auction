"""
Helper utility functions
"""
import time
from datetime import datetime, timezone
from typing import Optional
from decimal import Decimal


def get_current_timestamp_ms() -> int:
    """Get current timestamp in milliseconds"""
    return int(time.time() * 1000)


def get_current_timestamp() -> int:
    """Get current timestamp in seconds"""
    return int(time.time())


def calculate_time_remaining(end_time_ms: int) -> int:
    """
    Calculate time remaining in seconds

    Args:
        end_time_ms: End time in milliseconds

    Returns:
        Remaining seconds (0 if expired)
    """
    now_ms = get_current_timestamp_ms()
    remaining_ms = end_time_ms - now_ms
    remaining_seconds = max(0, remaining_ms // 1000)
    return int(remaining_seconds)


def format_currency(amount: Decimal) -> str:
    """Format amount as currency"""
    return f"${amount:,.2f}"


def parse_decimal(value: str) -> Optional[Decimal]:
    """Safely parse string to Decimal"""
    try:
        return Decimal(value)
    except (ValueError, TypeError):
        return None


def is_auction_active(status: str) -> bool:
    """Check if auction is active"""
    return status == "live"


def generate_bid_id(auction_id: str, timestamp: int) -> str:
    """Generate unique bid ID"""
    return f"{auction_id}_{timestamp}"


def format_iso_datetime(dt: datetime) -> str:
    """Format datetime to ISO string"""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()
