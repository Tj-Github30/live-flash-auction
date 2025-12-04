"""
Auction Management API Routes
"""
from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from auth.cognito import require_auth
from schemas.auction_schemas import AuctionCreateRequest, AuctionCreateResponse, AuctionResponse
from services.auction_service import AuctionService
from utils.errors import AuctionError
from utils.logger import setup_logger

bp = Blueprint("auctions", __name__, url_prefix="/auctions")
logger = setup_logger("auction-routes")
auction_service = AuctionService()


@bp.route("", methods=["POST"])
@require_auth
def create_auction():
    """
    Create a new auction

    POST /auctions
    Body: {
        "title": str,
        "description": str (optional),
        "duration": int (seconds),
        "category": str (optional),
        "starting_bid": decimal
    }

    Returns auction details with IVS streaming credentials
    """
    try:
        # Get user info from token
        user_id = request.user_id
        user_info = request.user_info

        # Parse and validate request
        data = request.get_json()
        auction_data = AuctionCreateRequest(**data)

        # Create auction
        auction = auction_service.create_auction(
            host_user_id=user_id,
            auction_data=auction_data
        )

        logger.info(f"Auction created: {auction['auction_id']} by user {user_id}")

        return jsonify(auction), 201

    except ValidationError as e:
        return jsonify({"error": "Validation error", "details": e.errors()}), 400
    except AuctionError as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error creating auction: {e}", exc_info=True)
        return jsonify({"error": "Failed to create auction"}), 500


@bp.route("/<auction_id>", methods=["GET"])
def get_auction(auction_id: str):
    """
    Get auction details

    GET /auctions/{auction_id}

    Returns auction information (without stream key)
    """
    try:
        auction = auction_service.get_auction(auction_id)

        if not auction:
            return jsonify({"error": "Auction not found"}), 404

        return jsonify(auction), 200

    except Exception as e:
        logger.error(f"Error getting auction: {e}", exc_info=True)
        return jsonify({"error": "Failed to get auction"}), 500


@bp.route("", methods=["GET"])
def list_auctions():
    """
    List auctions

    GET /auctions?status=live&limit=20&offset=0

    Query params:
    - status: 'live' or 'closed' (optional)
    - limit: number of results (default 20)
    - offset: pagination offset (default 0)
    - category: filter by category (optional)
    """
    try:
        status = request.args.get("status")
        limit = int(request.args.get("limit", 20))
        offset = int(request.args.get("offset", 0))
        category = request.args.get("category")

        auctions = auction_service.list_auctions(
            status=status,
            limit=limit,
            offset=offset,
            category=category
        )

        return jsonify({
            "auctions": auctions,
            "limit": limit,
            "offset": offset
        }), 200

    except Exception as e:
        logger.error(f"Error listing auctions: {e}", exc_info=True)
        return jsonify({"error": "Failed to list auctions"}), 500


@bp.route("/<auction_id>/state", methods=["GET"])
def get_auction_state(auction_id: str):
    """
    Get current auction state from Redis

    GET /auctions/{auction_id}/state

    Returns real-time state including current bid, participants, etc.
    """
    try:
        state = auction_service.get_auction_state(auction_id)

        if not state:
            return jsonify({"error": "Auction not found or not active"}), 404

        return jsonify(state), 200

    except Exception as e:
        logger.error(f"Error getting auction state: {e}", exc_info=True)
        return jsonify({"error": "Failed to get auction state"}), 500


@bp.route("/<auction_id>/close", methods=["POST"])
@require_auth
def close_auction(auction_id: str):
    """
    Manually close an auction (host only)

    POST /auctions/{auction_id}/close

    Only auction host can close their auction
    """
    try:
        user_id = request.user_id

        result = auction_service.close_auction(auction_id, user_id)

        return jsonify(result), 200

    except AuctionError as e:
        return jsonify(e.to_dict()), e.status_code
    except Exception as e:
        logger.error(f"Error closing auction: {e}", exc_info=True)
        return jsonify({"error": "Failed to close auction"}), 500
