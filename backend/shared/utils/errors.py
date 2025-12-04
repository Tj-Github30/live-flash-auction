"""
Custom exceptions and error handlers
"""
from flask import jsonify
from typing import Tuple


class AuctionError(Exception):
    """Base exception for auction-related errors"""
    status_code = 400

    def __init__(self, message: str, status_code: int = None):
        super().__init__()
        self.message = message
        if status_code is not None:
            self.status_code = status_code

    def to_dict(self):
        return {"error": self.message}


class AuctionNotFoundError(AuctionError):
    """Auction not found"""
    def __init__(self, auction_id: str):
        super().__init__(f"Auction not found: {auction_id}", 404)


class AuctionClosedError(AuctionError):
    """Auction is closed"""
    def __init__(self, auction_id: str):
        super().__init__(f"Auction is closed: {auction_id}", 400)


class InvalidBidError(AuctionError):
    """Invalid bid amount"""
    def __init__(self, message: str):
        super().__init__(f"Invalid bid: {message}", 400)


class UnauthorizedError(AuctionError):
    """Unauthorized access"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, 401)


class ForbiddenError(AuctionError):
    """Forbidden access"""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, 403)


def register_error_handlers(app):
    """Register error handlers with Flask app"""

    @app.errorhandler(AuctionError)
    def handle_auction_error(error: AuctionError) -> Tuple[dict, int]:
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(404)
    def handle_not_found(error) -> Tuple[dict, int]:
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def handle_internal_error(error) -> Tuple[dict, int]:
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(ValidationError)
    def handle_validation_error(error) -> Tuple[dict, int]:
        return jsonify({"error": "Validation error", "details": str(error)}), 400


# Import ValidationError if using pydantic
try:
    from pydantic import ValidationError
except ImportError:
    ValidationError = None
