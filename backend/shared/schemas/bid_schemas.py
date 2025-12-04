"""
Pydantic schemas for bid-related operations
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from decimal import Decimal


class BidRequest(BaseModel):
    """Schema for placing a bid"""
    auction_id: str = Field(..., description="Auction UUID")
    amount: Decimal = Field(..., gt=0, description="Bid amount")

    @validator("amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Bid amount must be greater than 0")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "auction_id": "123e4567-e89b-12d3-a456-426614174000",
                "amount": 15000.00
            }
        }


class BidResponse(BaseModel):
    """Schema for bid response"""
    status: str  # 'success' or 'failed'
    is_highest: bool
    current_high_bid: Decimal
    your_bid: Decimal
    message: Optional[str] = None


class BidEvent(BaseModel):
    """Schema for bid event broadcast"""
    type: str = "bid"
    auction_id: str
    user_id: str
    username: str
    amount: Decimal
    timestamp: int
    is_new_high: bool


class TopBid(BaseModel):
    """Schema for top bid in leaderboard"""
    user_id: str
    username: str
    amount: Decimal
    timestamp: Optional[int] = None
