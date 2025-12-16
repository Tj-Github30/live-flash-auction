"""
Bid Processing API Routes
"""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from shared.auth.cognito import require_auth
from shared.schemas.bid_schemas import BidRequest, BidResponse
from app.services.bid_service import BidService
from shared.utils.errors import AuctionError
from shared.utils.logger import setup_logger

bp = Blueprint("bids", __name__, url_prefix="/api/bids")
logger = setup_logger("bid-routes")
bid_service = BidService()


@bp.route("", methods=["POST"])
@require_auth
def place_bid():
    """
    Place a bid on an auction

    POST /api/bids
    Body: {
        "auction_id": str,
        "amount": decimal
    }

    Returns bid result (success/outbid)
    """
    try:
        # Get user info from token
        user_id = request.user_id
        user_info = request.user_info

        # Parse and validate request
        data = request.get_json()
        bid_data = BidRequest(**data)

        # Process bid
        result = bid_service.process_bid(
            auction_id=bid_data.auction_id,
            user_id=user_id,
            username=user_info["username"],
            amount=float(bid_data.amount)
        )

        logger.info(f"Bid processed: {user_id} - {bid_data.amount} on {bid_data.auction_id}")

        status_code = 200 if result["status"] == "success" else 400
        return jsonify(result), status_code

    except ValidationError as e:
        return jsonify({"error": "Validation error", "details": e.errors()}), 400
    except AuctionError as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error processing bid: {e}", exc_info=True)
        return jsonify({"error": "Failed to process bid"}), 500
