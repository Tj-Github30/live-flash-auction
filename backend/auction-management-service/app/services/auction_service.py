"""
Auction Service - Business logic for auction management
"""
from typing import Dict, List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.auction import Auction
from models.user import User
from redis.client import RedisHelper, RedisKeys
from aws.ivs_client import ivs_client
from schemas.auction_schemas import AuctionCreateRequest
from utils.errors import AuctionNotFoundError, ForbiddenError
from utils.helpers import get_current_timestamp_ms, calculate_time_remaining, parse_decimal
from config.settings import settings
import logging

logger = logging.getLogger(__name__)


class AuctionService:
    """Service for auction operations"""

    def __init__(self):
        self.redis_helper = RedisHelper()

    def create_auction(self, host_user_id: str, auction_data: AuctionCreateRequest) -> Dict:
        """
        Create a new auction with IVS channel and Redis initialization

        Args:
            host_user_id: UUID of the auction host
            auction_data: Validated auction data

        Returns:
            Dictionary with auction details including stream credentials
        """
        db = SessionLocal()
        try:
            # Create IVS channel for live streaming
            ivs_channel = ivs_client.create_channel(
                auction_id=str(host_user_id),  # Temp ID for channel name
                auction_title=auction_data.title
            )

            if not ivs_channel:
                raise Exception("Failed to create IVS channel")

            # Create auction in database
            auction = Auction(
                host_user_id=host_user_id,
                title=auction_data.title,
                description=auction_data.description,
                duration=auction_data.duration,
                category=auction_data.category,
                starting_bid=auction_data.starting_bid,
                status="live",
                ivs_channel_arn=ivs_channel["channel_arn"],
                ivs_stream_key=ivs_channel["stream_key"],
                ivs_playback_url=ivs_channel["playback_url"]
            )

            db.add(auction)
            db.commit()
            db.refresh(auction)

            auction_id = str(auction.auction_id)

            # Initialize Redis state
            start_time_ms = get_current_timestamp_ms()
            end_time_ms = start_time_ms + (auction_data.duration * 1000)

            # Set auction state hash
            state_data = {
                "status": "live",
                "current_high_bid": str(auction_data.starting_bid),
                "high_bidder_id": "",
                "high_bidder_username": "",
                "start_time": str(start_time_ms),
                "end_time": str(end_time_ms),
                "participant_count": "0",
                "anti_snipe_count": "0",
                "bid_count": "0"
            }
            self.redis_helper.set_auction_state(auction_id, state_data)

            # Set end time with TTL
            self.redis_helper.set_with_ttl(
                RedisKeys.auction_end_time(auction_id),
                str(end_time_ms),
                auction_data.duration + 3600  # Duration + 1 hour buffer
            )

            # Set active flag with TTL (auto-expires when auction ends)
            self.redis_helper.set_with_ttl(
                RedisKeys.auction_active(auction_id),
                "true",
                auction_data.duration
            )

            logger.info(f"Auction created and initialized: {auction_id}")

            # Return response with stream key
            return {
                "auction_id": auction_id,
                "host_user_id": str(auction.host_user_id),
                "title": auction.title,
                "description": auction.description,
                "duration": auction.duration,
                "category": auction.category,
                "starting_bid": float(auction.starting_bid),
                "created_at": auction.created_at.isoformat(),
                "status": auction.status,
                "ivs_channel_arn": auction.ivs_channel_arn,
                "ivs_stream_key": auction.ivs_stream_key,
                "ivs_playback_url": auction.ivs_playback_url,
                "ivs_ingest_endpoint": ivs_channel.get("ingest_endpoint")
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create auction: {e}", exc_info=True)
            raise
        finally:
            db.close()

    def get_auction(self, auction_id: str) -> Optional[Dict]:
        """Get auction details from database"""
        db = SessionLocal()
        try:
            auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()

            if not auction:
                return None

            return auction.to_dict(include_stream_key=False)

        finally:
            db.close()

    def list_auctions(
        self,
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        category: Optional[str] = None
    ) -> List[Dict]:
        """List auctions with filters"""
        db = SessionLocal()
        try:
            query = db.query(Auction)

            if status:
                query = query.filter(Auction.status == status)

            if category:
                query = query.filter(Auction.category == category)

            query = query.order_by(Auction.created_at.desc())
            query = query.limit(limit).offset(offset)

            auctions = query.all()

            return [auction.to_dict() for auction in auctions]

        finally:
            db.close()

    def get_auction_state(self, auction_id: str) -> Optional[Dict]:
        """Get current auction state from Redis"""
        try:
            # Get state hash
            state = self.redis_helper.get_auction_state(auction_id)

            if not state or not state.get("status"):
                return None

            # Get end time
            end_time_key = RedisKeys.auction_end_time(auction_id)
            end_time_ms = int(self.redis_helper.client.get(end_time_key) or 0)

            # Calculate time remaining
            time_remaining = calculate_time_remaining(end_time_ms)

            # Get top bids
            top_bids = self.redis_helper.get_top_bids(auction_id, limit=3)

            return {
                "auction_id": auction_id,
                "status": state.get("status"),
                "current_high_bid": float(state.get("current_high_bid", 0)),
                "high_bidder_id": state.get("high_bidder_id") or None,
                "high_bidder_username": state.get("high_bidder_username") or None,
                "participant_count": int(state.get("participant_count", 0)),
                "bid_count": int(state.get("bid_count", 0)),
                "time_remaining": time_remaining,
                "top_bids": top_bids,
                "anti_snipe_count": int(state.get("anti_snipe_count", 0))
            }

        except Exception as e:
            logger.error(f"Failed to get auction state: {e}", exc_info=True)
            return None

    def close_auction(self, auction_id: str, user_id: str) -> Dict:
        """
        Close an auction manually (host only)

        Args:
            auction_id: Auction UUID
            user_id: User requesting closure (must be host)

        Returns:
            Closure confirmation
        """
        db = SessionLocal()
        try:
            # Get auction
            auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()

            if not auction:
                raise AuctionNotFoundError(auction_id)

            # Verify user is host
            if str(auction.host_user_id) != user_id:
                raise ForbiddenError("Only auction host can close the auction")

            # Update database
            auction.status = "closed"
            auction.ended_at = db.func.now()

            # Get winner from Redis
            state = self.redis_helper.get_auction_state(auction_id)
            if state.get("high_bidder_id"):
                auction.winner_id = state["high_bidder_id"]
                auction.winning_bid = Decimal(state["current_high_bid"])

            db.commit()

            # Update Redis state
            self.redis_helper.update_auction_field(auction_id, "status", "closed")

            logger.info(f"Auction closed: {auction_id}")

            return {
                "auction_id": auction_id,
                "status": "closed",
                "winner_id": str(auction.winner_id) if auction.winner_id else None,
                "winning_bid": float(auction.winning_bid) if auction.winning_bid else None
            }

        except Exception as e:
            db.rollback()
            raise
        finally:
            db.close()
