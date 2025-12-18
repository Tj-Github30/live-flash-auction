"""
AWS SQS client for message queue operations
"""
import boto3
import json
import logging
from typing import Dict, Optional
from shared.config.settings import settings

logger = logging.getLogger(__name__)


class SQSClient:
    """AWS SQS client wrapper"""

    def __init__(self):
        self.client = boto3.client(
            "sqs",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID if settings.AWS_ACCESS_KEY_ID else None,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY if settings.AWS_SECRET_ACCESS_KEY else None
        )

    def send_bid_message(self, bid_data: Dict) -> Optional[str]:
        """
        Send bid data to SQS for persistence

        Args:
            bid_data: Dictionary containing bid information

        Returns:
            Message ID if successful, None otherwise
        """
        try:
            response = self.client.send_message(
                QueueUrl=settings.SQS_BID_QUEUE_URL,
                MessageBody=json.dumps(bid_data),
                MessageGroupId=bid_data.get("auction_id"),  # For FIFO queue
                MessageDeduplicationId=f"{bid_data.get('auction_id')}_{bid_data.get('timestamp')}"
            )
            logger.info(f"Bid message sent: {response.get('MessageId')}")
            return response.get("MessageId")

        except Exception as e:
            logger.error(f"Failed to send bid message: {e}")
            return None

    def send_notification_message(self, notification_data: Dict) -> Optional[str]:
        """
        Send notification data to SQS

        Args:
            notification_data: Dictionary containing notification info

        Returns:
            Message ID if successful, None otherwise
        """
        try:
            response = self.client.send_message(
                QueueUrl=settings.SQS_NOTIFICATION_QUEUE_URL,
                MessageBody=json.dumps(notification_data),
                MessageGroupId=notification_data.get("auction_id"),
                MessageDeduplicationId=f"{notification_data.get('auction_id')}_{notification_data.get('timestamp')}"
            )
            logger.info(f"Notification message sent: {response.get('MessageId')}")
            return response.get("MessageId")

        except Exception as e:
            logger.error(f"Failed to send notification message: {e}")
            return None

    def send_chat_message(self, chat_data: Dict) -> Optional[str]:
        """
        Send chat data to SQS for persistence

        Args:
            chat_data: Dictionary containing chat message info

        Returns:
            Message ID if successful, None otherwise
        """
        try:
            response = self.client.send_message(
                QueueUrl=settings.SQS_CHAT_QUEUE_URL,
                MessageBody=json.dumps(chat_data)
            )
            logger.info(f"Chat message sent: {response.get('MessageId')}")
            return response.get("MessageId")

        except Exception as e:
            logger.error(f"Failed to send chat message: {e}")
            return None


# Global SQS client instance
sqs_client = SQSClient()
