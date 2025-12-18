"""
AWS DynamoDB client for bid and chat persistence
"""
import boto3
from boto3.dynamodb.conditions import Key
from typing import Dict, List, Optional
from decimal import Decimal
import logging
from config.settings import settings

logger = logging.getLogger(__name__)


class DynamoDBClient:
    """AWS DynamoDB client wrapper"""

    def __init__(self):
        self.client = boto3.resource(
            "dynamodb",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID if settings.AWS_ACCESS_KEY_ID else None,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY if settings.AWS_SECRET_ACCESS_KEY else None
        )
        self.bids_table = self.client.Table(settings.DYNAMODB_BIDS_TABLE)
        self.chat_table = self.client.Table(settings.DYNAMODB_CHAT_TABLE)

    def put_bid(self, bid_data: Dict) -> bool:
        """
        Store bid in DynamoDB

        Args:
            bid_data: Dictionary with bid information
            {
                "auction_id": str,
                "user_id": str,
                "username": str,
                "amount": float,
                "timestamp": int,
                "is_winning": bool,
                "is_highest": bool
            }

        Returns:
            True if successful, False otherwise
        """
        try:
            # Convert float to Decimal for DynamoDB
            item = {
                "auction_id": bid_data["auction_id"],
                "timestamp#user_id": f"{bid_data['timestamp']}#{bid_data['user_id']}",
                "bid_id": bid_data.get("bid_id", f"{bid_data['auction_id']}_{bid_data['timestamp']}"),
                "user_id": bid_data["user_id"],
                "username": bid_data["username"],
                "amount": Decimal(str(bid_data["amount"])),
                "timestamp": bid_data["timestamp"],
                "is_winning": bid_data.get("is_winning", False),
                "is_highest": bid_data.get("is_highest", False)
            }

            # Add TTL if provided
            if "ttl_expiry" in bid_data:
                item["ttl_expiry"] = bid_data["ttl_expiry"]

            self.bids_table.put_item(Item=item)
            logger.info(f"Bid stored: {item['bid_id']}")
            return True

        except Exception as e:
            logger.error(f"Failed to store bid: {e}")
            return False

    def get_auction_bids(self, auction_id: str, limit: int = 50) -> List[Dict]:
        """
        Get bids for an auction

        Args:
            auction_id: Auction UUID
            limit: Maximum number of bids to return

        Returns:
            List of bid dictionaries
        """
        try:
            response = self.bids_table.query(
                KeyConditionExpression=Key("auction_id").eq(auction_id),
                Limit=limit,
                ScanIndexForward=False  # Most recent first
            )

            items = response.get("Items", [])

            # Convert Decimal back to float
            for item in items:
                if "amount" in item:
                    item["amount"] = float(item["amount"])

            return items

        except Exception as e:
            logger.error(f"Failed to get auction bids: {e}")
            return []

    def get_user_bids(self, user_id: str, limit: int = 50) -> List[Dict]:
        """
        Get bids for a specific user (using GSI)

        Args:
            user_id: User UUID
            limit: Maximum number of bids to return

        Returns:
            List of bid dictionaries
        """
        try:
            response = self.bids_table.query(
                IndexName="user_id-timestamp-index",
                KeyConditionExpression=Key("user_id").eq(user_id),
                Limit=limit,
                ScanIndexForward=False
            )

            items = response.get("Items", [])

            # Convert Decimal back to float
            for item in items:
                if "amount" in item:
                    item["amount"] = float(item["amount"])

            return items

        except Exception as e:
            logger.error(f"Failed to get user bids: {e}")
            return []

    def put_chat_message(self, chat_data: Dict) -> bool:
        """
        Store chat message in DynamoDB

        Args:
            chat_data: Dictionary with chat message info

        Returns:
            True if successful, False otherwise
        """
        try:
            item = {
                "auction_id": chat_data["auction_id"],
                "timestamp#message_id": f"{chat_data['timestamp']}#{chat_data['message_id']}",
                "message_id": chat_data["message_id"],
                "user_id": chat_data["user_id"],
                "username": chat_data["username"],
                "message": chat_data["message"],
                "timestamp": chat_data["timestamp"],
                "message_type": chat_data.get("message_type", "user")
            }

            # Add TTL
            if "ttl_expiry" in chat_data:
                item["ttl_expiry"] = chat_data["ttl_expiry"]

            self.chat_table.put_item(Item=item)
            logger.info(f"Chat message stored: {item['message_id']}")
            return True

        except Exception as e:
            logger.error(f"Failed to store chat message: {e}")
            return False


# Global DynamoDB client instance
dynamodb_client = DynamoDBClient()
