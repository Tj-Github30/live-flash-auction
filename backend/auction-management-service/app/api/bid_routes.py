"""
Bid API Routes for auction-management-service
"""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from shared.auth.cognito import require_auth
from shared.schemas.bid_schemas import BidRequest, BidListResponse
from app.services.auction_service import AuctionService
from shared.utils.errors import AuctionError
from shared.utils.logger import setup_logger

bp = Blueprint("bids", __name__, url_prefix="/api/bids")
logger = setup_logger("bid-routes")
auction_service = AuctionService()


@bp.route("", methods=["GET"])
@require_auth
def list_user_bids():
    """List bids placed by the authenticated user."""
    try:
        user_id = request.user_id
        limit = int(request.args.get("limit", 50))
        offset = int(request.args.get("offset", 0))

        bids = auction_service.list_user_bids(user_id=user_id, limit=limit, offset=offset)
        return jsonify({"bids": bids}), 200
    except Exception as e:
        logger.error(f"Error listing bids: {e}", exc_info=True)
        return jsonify({"error": "Failed to list bids"}), 500


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
        
        # Place bid
        result = auction_service.place_bid(
            auction_id=bid_data.auction_id,
            user_id=user_id,
            username=user_info.get("username", "Unknown"),
            amount=float(bid_data.amount)
        )
        
        logger.info(f"Bid placed: {user_id} - {bid_data.amount} on {bid_data.auction_id}")
        
        status_code = 200 if result["status"] == "success" else 400
        return jsonify(result), status_code
        
    except ValidationError as e:
        return jsonify({"error": "Validation error", "details": e.errors()}), 400
    except AuctionError as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error placing bid: {e}", exc_info=True)
        return jsonify({"error": "Failed to place bid"}), 500

