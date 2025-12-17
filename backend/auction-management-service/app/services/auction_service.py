"""
Auction Service - Business logic for auction management
"""
from typing import Dict, List, Optional
from decimal import Decimal
import boto3
import base64
import uuid
import os
from urllib.parse import urlparse
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from shared.database.connection import SessionLocal
from shared.models.auction import Auction
from shared.models.user import User
from shared.redis.client import RedisHelper, RedisKeys
from shared.schemas.auction_schemas import AuctionCreateRequest
from shared.utils.errors import AuctionNotFoundError, ForbiddenError
from shared.utils.helpers import get_current_timestamp_ms, calculate_time_remaining, parse_decimal, format_iso_datetime
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

    def _presign_image_url(self, image_url: Optional[str]) -> Optional[str]:
        """
        Return a presigned GET URL for an S3 object so images render even when the bucket is private.
        Accepts either:
        - full URL: https://<bucket>.s3.amazonaws.com/<key>
        - plain key: auctions/<uuid>.<ext>
        """
        if not image_url or not self.bucket_name:
            return image_url

    def _attach_realtime_fields(self, auction: Auction, data: Dict) -> Dict:
        """
        Attach Redis-derived real-time fields used by the UI:
        - end_time (ISO), end_time_ms, time_remaining_seconds
        - participant_count, bid_count
        - current_high_bid, high_bidder_id, high_bidder_username
        """
        try:
            auction_id = str(auction.auction_id)
            state = self.redis_helper.get_auction_state(auction_id) or {}

            # end_time_ms: prefer dedicated key, fallback to state field.
            end_time_ms = None
            try:
                raw = self.redis_helper.client.get(RedisKeys.auction_end_time(auction_id))
                if raw:
                    end_time_ms = int(raw)
            except Exception:
                end_time_ms = None

            if end_time_ms is None:
                try:
                    if state.get("end_time"):
                        end_time_ms = int(state.get("end_time"))
                except Exception:
                    end_time_ms = None

            # Fallback: derive end_time from DB created_at + duration if Redis lacks it.
            if end_time_ms is None and getattr(auction, "created_at", None) and getattr(auction, "duration", None):
                try:
                    end_time_ms = int(auction.created_at.timestamp() * 1000) + int(auction.duration) * 1000
                except Exception:
                    end_time_ms = None

            if end_time_ms is not None and end_time_ms > 0:
                data["end_time_ms"] = end_time_ms
                data["time_remaining_seconds"] = calculate_time_remaining(end_time_ms)
                data["end_time"] = format_iso_datetime(
                    datetime.fromtimestamp(end_time_ms / 1000, tz=timezone.utc)
                )

            # counts + bidding fields
            try:
                data["participant_count"] = int(state.get("participant_count", 0) or 0)
            except Exception:
                pass
            try:
                data["bid_count"] = int(state.get("bid_count", 0) or 0)
            except Exception:
                pass

            # High bid fields (Redis is the source of truth for current high bid)
            if state.get("current_high_bid") is not None:
                try:
                    data["current_high_bid"] = float(state.get("current_high_bid") or 0)
                except Exception:
                    pass
            if state.get("high_bidder_id"):
                data["high_bidder_id"] = state.get("high_bidder_id")
            if state.get("high_bidder_username"):
                data["high_bidder_username"] = state.get("high_bidder_username")

        except Exception as e:
            logger.warning(f"Failed to attach realtime fields: {e}")

        return data

    def _attach_winner_fields(self, auction: Auction, data: Dict) -> Dict:
        """
        Attach winner info for ended/closed auctions.
        - winner_username (resolved from DB)
        - winning_bid (already present in model dict, but keep consistent float)
        """
        try:
            winner_id = getattr(auction, "winner_id", None)
            if winner_id:
                # Resolve username from DB if relationship isn't loaded
                winner = getattr(auction, "winner", None)
                if winner is None:
                    try:
                        winner = SessionLocal().query(User).filter(User.user_id == winner_id).first()
                    except Exception:
                        winner = None
                if winner is not None:
                    data["winner_username"] = getattr(winner, "username", None)
        except Exception as e:
            logger.warning(f"Failed to attach winner fields: {e}")

        # Normalize winning_bid to float if present
        try:
            if data.get("winning_bid") is not None:
                data["winning_bid"] = float(data["winning_bid"])
        except Exception:
            pass

        return data

        try:
            key = image_url

            # If stored as URL, extract the key part.
            if image_url.startswith("http"):
                parsed = urlparse(image_url)
                key = parsed.path.lstrip("/")

            # Basic sanity: only presign for keys that look like ours.
            if not key or key.startswith("data:"):
                return image_url

            return self.s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=3600,
            )
        except Exception as e:
            logger.warning(f"Failed to presign image url: {e}")
            return image_url

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
                "image_url": self._presign_image_url(auction.image_url),
                "starting_bid": float(auction.starting_bid),
                "status": auction.status,
                # These help the UI render immediately without extra fetches.
                "end_time_ms": end_time_ms,
                "time_remaining_seconds": calculate_time_remaining(end_time_ms),
                "end_time": format_iso_datetime(datetime.fromtimestamp(end_time_ms / 1000, tz=timezone.utc)),
                "participant_count": 0,
                "bid_count": 0,
                "current_high_bid": float(auction.starting_bid),
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
            data = auction.to_dict()
            data["image_url"] = self._presign_image_url(data.get("image_url"))
            data = self._attach_realtime_fields(auction, data)
            data = self._attach_winner_fields(auction, data)
            return data
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
            out: List[Dict] = []
            for auction in auctions:
                data = auction.to_dict()
                data["image_url"] = self._presign_image_url(data.get("image_url"))
                # For live auctions, attach real-time fields for UI cards.
                if (data.get("status") == "live") or (status == "live"):
                    data = self._attach_realtime_fields(auction, data)
                data = self._attach_winner_fields(auction, data)
                out.append(data)
            return out
        finally:
            db.close()

    def get_auctions_by_ids(self, auction_ids: List[str]) -> List[Dict]:
        """Batch fetch auctions by ID (used by My Bids page)."""
        if not auction_ids:
            return []

        db = SessionLocal()
        try:
            query = db.query(Auction).filter(Auction.auction_id.in_(auction_ids))
            auctions = query.all()
            out: List[Dict] = []
            for auction in auctions:
                data = auction.to_dict()
                data["image_url"] = self._presign_image_url(data.get("image_url"))
                if data.get("status") == "live":
                    data = self._attach_realtime_fields(auction, data)
                data = self._attach_winner_fields(auction, data)
                out.append(data)
            # Preserve caller order as much as possible
            by_id = {a["auction_id"]: a for a in out if a.get("auction_id")}
            return [by_id.get(aid) for aid in auction_ids if aid in by_id]
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