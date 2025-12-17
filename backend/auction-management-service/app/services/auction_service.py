from typing import Dict, List, Optional
from decimal import Decimal
import boto3
import base64
import uuid
import os
import json # Added for safe parsing
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
            region_name=os.getenv('AWS_REGION', 'us-east-1'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME')

    def _upload_base64_image(self, base64_string: str) -> Optional[str]:
        """Helper to upload Base64 string to S3 and return the URL"""
        if not base64_string or not self.bucket_name:
            return None
        
        try:
            # 1. Check if it's already a URL
            if base64_string.startswith("http"):
                return base64_string

            # 2. Parse Base64 Header
            if "," in base64_string:
                header, encoded = base64_string.split(",", 1)
                file_ext = header.split(";")[0].split("/")[1]
            else:
                encoded = base64_string
                file_ext = "jpg"

            # 3. Decode data
            image_data = base64.b64decode(encoded)
            
            # 4. Generate unique filename
            filename = f"auctions/{uuid.uuid4()}.{file_ext}"

            # 5. Upload to S3
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
        """
        if not image_url or not self.bucket_name:
            return image_url
            
        try:
            # If it's a full URL, extract the key part (path after the domain)
            key = image_url
            if image_url.startswith("http"):
                parsed = urlparse(image_url)
                # Remove leading slash
                key = parsed.path.lstrip("/")

            # Basic sanity: only presign for keys that look like ours or are not data URIs
            if not key or key.startswith("data:"):
                return image_url

            # Generate the signed URL
            return self.s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=3600,
            )
        except Exception as e:
            logger.warning(f"Failed to presign image url: {e}")
            return image_url

    def _attach_realtime_fields(self, auction: Auction, data: Dict) -> Dict:
        """Attach Redis-derived real-time fields used by the UI."""
        try:
            auction_id = str(auction.auction_id)
            state = self.redis_helper.get_auction_state(auction_id) or {}

            # --- 1. End Time Logic ---
            end_time_ms = None
            
            # Try Redis dedicated key
            try:
                raw = self.redis_helper.client.get(RedisKeys.auction_end_time(auction_id))
                if raw: end_time_ms = int(raw)
            except: pass

            # Try Redis state dict
            if end_time_ms is None:
                if state.get("end_time"): end_time_ms = int(state.get("end_time"))

            # Fallback to DB calculation
            if end_time_ms is None and getattr(auction, "created_at", None) and getattr(auction, "duration", None):
                end_time_ms = int(auction.created_at.timestamp() * 1000) + int(auction.duration) * 1000

            if end_time_ms is not None and end_time_ms > 0:
                data["end_time_ms"] = end_time_ms
                data["time_remaining_seconds"] = calculate_time_remaining(end_time_ms)
                data["end_time"] = format_iso_datetime(
                    datetime.fromtimestamp(end_time_ms / 1000, tz=timezone.utc)
                )

            # --- 2. Counts ---
            data["participant_count"] = int(state.get("participant_count", 0) or 0)
            data["bid_count"] = int(state.get("bid_count", 0) or 0)

            # --- 3. High Bid ---
            if state.get("current_high_bid") is not None:
                data["current_high_bid"] = float(state.get("current_high_bid") or 0)
            if state.get("high_bidder_id"):
                data["high_bidder_id"] = state.get("high_bidder_id")
            if state.get("high_bidder_username"):
                data["high_bidder_username"] = state.get("high_bidder_username")

        except Exception as e:
            logger.warning(f"Failed to attach realtime fields: {e}")

        return data

    def _attach_winner_fields(self, auction: Auction, data: Dict) -> Dict:
        """Attach winner info for ended/closed auctions."""
        try:
            winner_id = getattr(auction, "winner_id", None)
            if winner_id:
                winner = getattr(auction, "winner", None)
                if winner is None:
                    try:
                        winner = SessionLocal().query(User).filter(User.user_id == winner_id).first()
                    except: winner = None
                if winner:
                    data["winner_username"] = getattr(winner, "username", None)
        except Exception as e:
            logger.warning(f"Failed to attach winner fields: {e}")

        try:
            if data.get("winning_bid") is not None:
                data["winning_bid"] = float(data["winning_bid"])
        except: pass

        return data

    def _ensure_image_url_column(self):
        try:
            db = SessionLocal()
            db.execute(text("ALTER TABLE auctions ADD COLUMN IF NOT EXISTS image_url VARCHAR(2048);"))
            db.commit()
            db.close()
        except Exception:
            pass

    def create_auction(self, host_user_id: str, auction_data: AuctionCreateRequest) -> Dict:
        db = SessionLocal()
        try:
            if not auction_data.seller_name or not auction_data.seller_name.strip():
                raise ValueError("Seller Name is required.")

            self._ensure_image_url_column()

            # 1. Main Image
            main_image_url = None
            if auction_data.image_url:
                main_image_url = self._upload_base64_image(auction_data.image_url)

            # 2. Gallery Images
            gallery_urls = []
            if auction_data.images and len(auction_data.images) > 0:
                for img_str in auction_data.images:
                    if img_str:
                        url = self._upload_base64_image(img_str)
                        if url: gallery_urls.append(url)

            # 3. Create Record
            auction = Auction(
                host_user_id=host_user_id,
                title=auction_data.title,
                description=auction_data.description,
                duration=auction_data.duration,
                category=auction_data.category,
                starting_bid=auction_data.starting_bid,
                status="live",
                seller_name=auction_data.seller_name.strip(),
                condition=auction_data.condition,
                image_url=main_image_url,
                gallery_images=gallery_urls # Saves as list
            )

            db.add(auction)
            db.commit()
            db.refresh(auction)
            auction_id = str(auction.auction_id)

            # 4. Init Redis
            start_time_ms = get_current_timestamp_ms()
            end_time_ms = start_time_ms + (auction_data.duration * 1000)

            state_data = {
                "host_user_id": str(host_user_id),
                "status": "live",
                "current_high_bid": str(auction_data.starting_bid),
                "start_time": str(start_time_ms),
                "end_time": str(end_time_ms),
                "participant_count": "0",
                "bid_count": "0"
            }
            self.redis_helper.set_auction_state(auction_id, state_data)
            self.redis_helper.set_with_ttl(RedisKeys.auction_end_time(auction_id), str(end_time_ms), auction_data.duration + 3600)
            self.redis_helper.set_with_ttl(RedisKeys.auction_active(auction_id), "true", auction_data.duration)

            # 5. Return with PRESIGNED URLs immediately
            response_data = self.get_auction(auction_id)
            return response_data

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create auction: {e}", exc_info=True)
            raise
        finally:
            db.close()

    def get_auction(self, auction_id: str) -> Optional[Dict]:
        db = SessionLocal()
        try:
            auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()
            if not auction:
                return None
            
            # Use to_dict or manual mapping
            data = getattr(auction, "to_dict", lambda: {})() 
            if not data: # Fallback if to_dict missing
                data = {
                    "auction_id": str(auction.auction_id),
                    "title": auction.title,
                    "description": auction.description,
                    "seller_name": auction.seller_name,
                    "image_url": auction.image_url,
                    "gallery_images": auction.gallery_images,
                    "starting_bid": auction.starting_bid,
                    "status": auction.status,
                    "host_user_id": str(auction.host_user_id),
                    "category": auction.category,
                    "duration": auction.duration,
                    "condition": auction.condition,
                    "created_at": auction.created_at.isoformat() if auction.created_at else None
                }

            # --- VITAL FIX: Presign Main Image ---
            if data.get("image_url"):
                data["image_url"] = self._presign_image_url(data["image_url"])

            # --- VITAL FIX: Presign Gallery Images ---
            raw_gallery = data.get("gallery_images")
            
            # Normalize to list
            gallery_list = []
            if isinstance(raw_gallery, list):
                gallery_list = raw_gallery
            elif isinstance(raw_gallery, str):
                try:
                    parsed = json.loads(raw_gallery)
                    if isinstance(parsed, list): gallery_list = parsed
                except: pass
            
            # Presign every item in the list
            data["gallery_images"] = [
                self._presign_image_url(url) for url in gallery_list if url
            ]

            # Attach Realtime & Winner
            if data.get("status") == "live":
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
            
            # Use get_auction logic (recursively or mapping) to ensure presigning happens
            out = []
            for auction in auctions:
                # We can't call self.get_auction here easily without extra DB hits, so we duplicate the presign logic efficiently
                data = getattr(auction, "to_dict", lambda: {})() 
                if not data: # fallback
                     data = {"auction_id": str(auction.auction_id), "image_url": auction.image_url, "title": auction.title, "status": auction.status}

                data["image_url"] = self._presign_image_url(data.get("image_url"))
                
                # We don't usually load gallery for list view (too heavy), but if you need it:
                # data["gallery_images"] = ...

                if (data.get("status") == "live") or (status == "live"):
                    data = self._attach_realtime_fields(auction, data)
                data = self._attach_winner_fields(auction, data)
                out.append(data)
            return out
        finally:
            db.close()
    
    def close_auction(self, auction_id, user_id):
        """
        Manually closes an auction.
        Only the host can perform this action.
        """
        db = SessionLocal() # Create the session locally
        try:
            # Fetch the auction from the DB
            auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()

            if not auction:
                return {"error": "Auction not found"}, 404

            # Security check
            if str(auction.host_user_id) != str(user_id):
                return {"error": "Unauthorized: Only the host can close this auction"}, 403

            # Update the status and the end time
            auction.status = 'closed'
            auction.ended_at = datetime.now(timezone.utc)

            db.commit()
            
            # Clean up Redis so the UI knows it's over
            try:
                self.redis_helper.client.delete(RedisKeys.auction_active(str(auction_id)))
                self.redis_helper.client.hset(f"auction:{auction_id}:state", "status", "closed")
            except Exception as re:
                logger.warning(f"Failed to update redis during manual close: {re}")

            return {
                "message": "Auction closed successfully",
                "auction_id": str(auction_id),
                "status": "closed"
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Error in close_auction: {e}")
            return {"error": "Database error occurred while closing"}, 500
        finally:
            db.close()

    def get_auction_state(self, auction_id):
        """Fetches the state for the API route"""
        db = SessionLocal() # Create the session locally
        try:
            auction = db.query(Auction).filter(Auction.auction_id == auction_id).first()
            if not auction:
                return None
            
            # Use Redis for real-time bid info if available, fallback to DB
            state = self.redis_helper.get_auction_state(str(auction_id)) or {}
            
            return {
                "auction_id": str(auction.auction_id),
                "status": auction.status,
                "current_high_bid": float(state.get("current_high_bid") or auction.starting_bid),
                "participant_count": int(state.get("participant_count") or 0),
                "bid_count": int(state.get("bid_count") or 0),
                "ended_at": auction.ended_at.isoformat() if auction.ended_at else None
            }
        finally:
            db.close()