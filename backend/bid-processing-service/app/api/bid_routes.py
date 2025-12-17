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
from shared.config.settings import settings
import boto3
from decimal import Decimal

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


@bp.route("/my", methods=["GET"])
@require_auth
def my_bids():
    """
    Return auctions the current user has bid on (from DynamoDB bid history).
    Response:
      {
        "auction_ids": [...],
        "by_auction": {
          "<auction_id>": { "bid_count": n, "max_bid": x, "last_bid": y, "last_timestamp": t }
        }
      }
    """
    try:
        user_id = request.user_id

        table_name = settings.DYNAMODB_BIDS_TABLE or "bids_history"
        dynamodb = boto3.resource("dynamodb", region_name=settings.AWS_REGION)
        table = dynamodb.Table(table_name)

        # Scan with filter (OK for demo-scale tables; production should use a GSI).
        items = []
        start_key = None
        while True:
            kwargs = {
                "FilterExpression": "user_id = :uid",
                "ExpressionAttributeValues": {":uid": user_id},
            }
            if start_key:
                kwargs["ExclusiveStartKey"] = start_key

            resp = table.scan(**kwargs)
            items.extend(resp.get("Items", []))
            start_key = resp.get("LastEvaluatedKey")
            if not start_key:
                break

        def to_float(v):
            if isinstance(v, Decimal):
                return float(v)
            try:
                return float(v)
            except Exception:
                return 0.0

        by_auction = {}
        for it in items:
            aid = it.get("auction_id")
            if not aid:
                continue
            amount = to_float(it.get("amount"))
            ts = int(it.get("timestamp") or 0)

            agg = by_auction.get(aid) or {"bid_count": 0, "max_bid": 0.0, "last_bid": 0.0, "last_timestamp": 0}
            agg["bid_count"] += 1
            agg["max_bid"] = max(agg["max_bid"], amount)
            if ts >= agg["last_timestamp"]:
                agg["last_timestamp"] = ts
                agg["last_bid"] = amount
            by_auction[aid] = agg

        auction_ids = sorted(by_auction.keys(), key=lambda a: by_auction[a]["last_timestamp"], reverse=True)
        return jsonify({"auction_ids": auction_ids, "by_auction": by_auction}), 200

    except Exception as e:
        logger.error(f"Error fetching my bids: {e}", exc_info=True)
        return jsonify({"error": "Failed to fetch my bids"}), 500
