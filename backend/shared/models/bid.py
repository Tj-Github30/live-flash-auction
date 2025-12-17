"""
Bid model
"""
from sqlalchemy import Column, String, DECIMAL, DateTime, ForeignKey
from sqlalchemy.sql import func
import uuid

from shared.database.connection import Base, GUID


class Bid(Base):
    __tablename__ = "bids"

    bid_id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    auction_id = Column(GUID(), ForeignKey("auctions.auction_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID(), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    username = Column(String(255), nullable=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    def to_dict(self):
        return {
            "bid_id": str(self.bid_id),
            "auction_id": str(self.auction_id),
            "user_id": str(self.user_id),
            "username": self.username,
            "amount": float(self.amount),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

