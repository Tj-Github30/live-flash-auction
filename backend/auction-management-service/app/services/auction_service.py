"""
Auction Service - Business logic for auction management
"""
from typing import Dict, List, Optional
from decimal import Decimal
import boto3
import base64
import uuid
import os
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from shared.database.connection import SessionLocal
from shared.models.auction import Auction
from shared.models.user import User
from shared.redis.client import RedisHelper, RedisKeys
from shared.schemas.auction_schemas import AuctionCreateRequest
from shared.utils.errors import AuctionNotFoundError, ForbiddenError
from shared.utils.helpers import get_current_timestamp_ms, calculate_time_remaining, parse_decimal
from shared.config.settings import settings
import logging

logger = logging.getLogger(__name__)

class AuctionService:
    """Service for auction operations"""

    def __init__(self):
        self.redis_helper = RedisHelper()
        # Initialize S3 Client
        self.s3_client = boto3.client(
            's3',
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME')

    def _upload_base64_image(self, base64_string: str) -> Optional[str]:
        """Helper to upload Base64 string to S3 and return the URL"""
        if not base64_string or not self.bucket_name:
            return None
        
        try:
            # 1. Check if it's already a URL (in case frontend sends a link)
            if base64_string.startswith("http"):
                return base64_string

            # 2. Parse Base64 Header (e.g., "data:image/jpeg;base64,.....")
            if "," in base64_string:
                header, encoded = base64_string.split(",", 1)
                file_ext = header.split(";")[0].split("/")[1]
            else:
                encoded = base64_string
                file_ext = "jpg" # default

            # 3. Decode data
            image_data = base64.b64decode(encoded)
            
            # 4. Generate unique filename
            filename = f"auctions/{uuid.uuid4()}.{file_ext}"

            # 5. Upload to S3
            # NOTE: Do not set ACL='public-read' here.
            # Many modern S3 buckets have Object Ownership "Bucket owner enforced" (ACLs disabled),
            # and PutObjectAcl will fail with AccessDenied / AccessControlListNotSupported.
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=image_data,
                ContentType=f"image/{file_ext}"
            )

            # 6. Return the public URL
            return f"https://{self.bucket_name}.s3.amazonaws.com/{filename}"

        except Exception as e:
            logger.error(f"Image upload failed: {e}")
            return None

    def _ensure_image_url_column(self):
        """
        Best-effort runtime migration for legacy DBs.
        If the DB user lacks ALTER privileges, we log and continue; the subsequent INSERT
        will fail with a clear error from the API layer.
        """
        try:
            db = SessionLocal()
            try:
                db.execute(text("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS image_url VARCHAR(2048);"))
                db.commit()
            finally:
                db.close()
        except Exception as e:
            logger.warning(f"DB schema check failed (image_url column): {e}")

    def create_auction(self, host_user_id: str, auction_data: AuctionCreateRequest) -> Dict:
        """
        Create a new auction with Images and Redis initialization.
        """
        db = SessionLocal()
        try:
            # Ensure DB schema supports image_url (safe no-op if already present)
            self._ensure_image_url_column()

            # --- STEP 1: Upload Image to S3 ---
            main_image_url = None
            if auction_data.image_url:
                main_image_url = self._upload_base64_image(auction_data.image_url)

            # (Optional) Handle multiple images if your DB supports it
            # additional_images = [self._upload_base64_image(img) for img in auction_data.images]

            # --- STEP 2: Create auction in database ---
            auction = Auction(
                host_user_id=host_user_id,
                title=auction_data.title,
                description=auction_data.description,
                duration=auction_data.duration,
                category=auction_data.category,
                starting_bid=auction_data.starting_bid,
                status="live",
                # Save the S3 URL here
                image_url=main_image_url,
            )

            db.add(auction)
            db.commit()
            db.refresh(auction)

            auction_id = str(auction.auction_id)

            # --- STEP 3: Initialize Redis ---
            start_time_ms = get_current_timestamp_ms()
            end_time_ms = start_time_ms + (auction_data.duration * 1000)

            state_data = {
                # Used by bid-processing to enforce "host cannot bid" without extra DB round-trips.
                "host_user_id": str(host_user_id),
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

            self.redis_helper.set_with_ttl(
                RedisKeys.auction_end_time(auction_id),
                str(end_time_ms),
                auction_data.duration + 3600
            )

            self.redis_helper.set_with_ttl(
                RedisKeys.auction_active(auction_id),
                "true",
                auction_data.duration
            )

            logger.info(f"Auction created: {auction_id}")

            return {
                "auction_id": auction_id,
                "host_user_id": str(auction.host_user_id),
                "title": auction.title,
                "image_url": auction.image_url, # Return the URL to frontend
                "starting_bid": float(auction.starting_bid),
                "status": auction.status,
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create auction: {e}", exc_info=True)
            raise
        finally:
            db.close()

    # ... (Keep get_auction, list_auctions, get_auction_state, close_auction exactly as they were) ...
    # Be sure to include the rest of your class methods below here!
    
    def get_auction(self, auction_id: str) -> Optional[Dict]:
        """Get auction details from database"""
        db = SessionLocal()
        try:
            auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()
            if not auction:
                return None
            return auction.to_dict()
        finally:
            db.close()

    def list_auctions(self, status=None, limit=20, offset=0, category=None) -> List[Dict]:
        db = SessionLocal()
        try:
            query = db.query(Auction)
            if status:
                query = query.filter(Auction.status == status)
            if category:
                query = query.filter(Auction.category == category)
            query = query.order_by(Auction.created_at.desc()).limit(limit).offset(offset)
            auctions = query.all()
            return [auction.to_dict() for auction in auctions]
        finally:
            db.close()

    def get_auction_state(self, auction_id: str) -> Optional[Dict]:
        try:
            state = self.redis_helper.get_auction_state(auction_id)
            if not state or not state.get("status"):
                return None
            end_time_key = RedisKeys.auction_end_time(auction_id)
            end_time_ms = int(self.redis_helper.client.get(end_time_key) or 0)
            time_remaining = calculate_time_remaining(end_time_ms)
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
        db = SessionLocal()
        try:
            auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()
            if not auction:
                raise AuctionNotFoundError(auction_id)
            if str(auction.host_user_id) != user_id:
                raise ForbiddenError("Only auction host can close the auction")
            auction.status = "closed"
            auction.ended_at = db.func.now()
            state = self.redis_helper.get_auction_state(auction_id)
            if state.get("high_bidder_id"):
                auction.winner_id = state["high_bidder_id"]
                auction.winning_bid = Decimal(state["current_high_bid"])
            db.commit()
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