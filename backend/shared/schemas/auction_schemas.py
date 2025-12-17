"""
Pydantic schemas for auction-related operations
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class AuctionCreateRequest(BaseModel):
    """Schema for creating a new auction"""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    duration: int = Field(..., gt=0, description="Duration in seconds")
    category: Optional[str] = Field(None, max_length=100)
    starting_bid: Decimal = Field(..., gt=0, description="Starting bid amount")
    
    # --- ADDED: Support for images ---
    image_url: Optional[str] = Field(None, description="Main image URL or Base64 string")
    images: Optional[List[str]] = Field(default=[], description="List of all auction images")

    @validator("starting_bid")
    def validate_starting_bid(cls, v):
        if v <= 0:
            raise ValueError("Starting bid must be greater than 0")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Vintage Rolex Watch",
                "description": "Rare 1960s Rolex Submariner",
                "duration": 3600,
                "category": "Watches",
                "starting_bid": 10000.00,
                "image_url": "https://example.com/watch.jpg",
                "images": ["https://example.com/watch_1.jpg", "https://example.com/watch_2.jpg"]
            }
        }


class AuctionResponse(BaseModel):
    """Schema for auction response"""
    auction_id: str
    host_user_id: str
    title: str
    description: Optional[str]
    duration: int
    category: Optional[str]
    starting_bid: Decimal
    created_at: str
    status: str
    winner_id: Optional[str] = None
    winning_bid: Optional[Decimal] = None
    ended_at: Optional[str] = None
    ivs_playback_url: Optional[str] = None
    
    # --- ADDED: Return images to frontend ---
    image_url: Optional[str] = None
    images: Optional[List[str]] = []

    class Config:
        from_attributes = True


class AuctionCreateResponse(AuctionResponse):
    """Extended response for auction creation (includes stream key)"""
    ivs_stream_key: str
    ivs_channel_arn: str
    ivs_ingest_endpoint: Optional[str] = None


class AuctionStateResponse(BaseModel):
    """Schema for current auction state"""
    auction_id: str
    status: str
    current_high_bid: Optional[Decimal] = None
    high_bidder_id: Optional[str] = None
    high_bidder_username: Optional[str] = None
    participant_count: int = 0
    bid_count: int = 0
    time_remaining: int  # seconds
    top_bids: list = []