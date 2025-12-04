"""
AWS IVS (Interactive Video Service) client for live streaming
"""
import boto3
import logging
from typing import Dict, Optional
from config.settings import settings

logger = logging.getLogger(__name__)


class IVSClient:
    """AWS IVS client wrapper"""

    def __init__(self):
        self.client = boto3.client(
            "ivs",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID if settings.AWS_ACCESS_KEY_ID else None,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY if settings.AWS_SECRET_ACCESS_KEY else None
        )

    def create_channel(self, auction_id: str, auction_title: str) -> Optional[Dict]:
        """
        Create IVS channel for auction streaming

        Args:
            auction_id: Unique auction identifier
            auction_title: Title of the auction

        Returns:
            Dictionary with channel details or None if failed
            {
                "channel_arn": str,
                "stream_key": str,
                "playback_url": str,
                "ingest_endpoint": str
            }
        """
        try:
            # Create channel
            response = self.client.create_channel(
                name=f"auction_{auction_id}",
                latencyMode="LOW",  # Low latency for real-time bidding
                type=settings.IVS_CHANNEL_TYPE,
                tags={
                    "auction_id": auction_id,
                    "title": auction_title
                }
            )

            channel = response.get("channel", {})
            stream_key = response.get("streamKey", {})

            # Extract channel details
            channel_arn = channel.get("arn")
            playback_url = channel.get("playbackUrl")
            ingest_endpoint = channel.get("ingestEndpoint")
            stream_key_value = stream_key.get("value")

            logger.info(f"IVS channel created: {channel_arn}")

            return {
                "channel_arn": channel_arn,
                "stream_key": stream_key_value,
                "playback_url": playback_url,
                "ingest_endpoint": ingest_endpoint
            }

        except Exception as e:
            logger.error(f"Failed to create IVS channel: {e}")
            return None

    def delete_channel(self, channel_arn: str) -> bool:
        """
        Delete IVS channel

        Args:
            channel_arn: ARN of the channel to delete

        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.delete_channel(arn=channel_arn)
            logger.info(f"IVS channel deleted: {channel_arn}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete IVS channel: {e}")
            return False

    def get_channel(self, channel_arn: str) -> Optional[Dict]:
        """
        Get channel details

        Args:
            channel_arn: ARN of the channel

        Returns:
            Dictionary with channel details or None
        """
        try:
            response = self.client.get_channel(arn=channel_arn)
            return response.get("channel")

        except Exception as e:
            logger.error(f"Failed to get IVS channel: {e}")
            return None

    def stop_stream(self, channel_arn: str) -> bool:
        """
        Stop active stream on channel

        Args:
            channel_arn: ARN of the channel

        Returns:
            True if successful, False otherwise
        """
        try:
            self.client.stop_stream(channelArn=channel_arn)
            logger.info(f"Stream stopped: {channel_arn}")
            return True

        except Exception as e:
            logger.error(f"Failed to stop stream: {e}")
            return False


# Global IVS client instance
ivs_client = IVSClient()
