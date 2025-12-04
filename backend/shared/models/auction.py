"""
Auction model
"""
from sqlalchemy import Column, String, Text, Integer, DECIMAL, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from database.connection import Base


class Auction(Base):
    __tablename__ = "auctions"

    auction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    host_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    duration = Column(Integer, nullable=False)  # in seconds
    category = Column(String(100), index=True)
    starting_bid = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(20), default="live", index=True)  # 'live' or 'closed'
    winner_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    winning_bid = Column(DECIMAL(10, 2))
    ended_at = Column(DateTime(timezone=True))
    ivs_channel_arn = Column(String(255))
    ivs_stream_key = Column(Text)
    ivs_playback_url = Column(Text)

    # Relationships
    host = relationship("User", foreign_keys=[host_user_id], backref="hosted_auctions")
    winner = relationship("User", foreign_keys=[winner_id], backref="won_auctions")

    def to_dict(self, include_stream_key=False):
        """Convert model to dictionary"""
        data = {
            "auction_id": str(self.auction_id),
            "host_user_id": str(self.host_user_id),
            "title": self.title,
            "description": self.description,
            "duration": self.duration,
            "category": self.category,
            "starting_bid": float(self.starting_bid) if self.starting_bid else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "status": self.status,
            "winner_id": str(self.winner_id) if self.winner_id else None,
            "winning_bid": float(self.winning_bid) if self.winning_bid else None,
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "ivs_channel_arn": self.ivs_channel_arn,
            "ivs_playback_url": self.ivs_playback_url
        }

        # Only include stream key if explicitly requested (security)
        if include_stream_key:
            data["ivs_stream_key"] = self.ivs_stream_key

        return data

    def __repr__(self):
        return f"<Auction {self.title} ({self.status})>"
