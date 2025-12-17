"""
Lambda Function: Bid Persistence
Consumes SQS messages and writes bids to DynamoDB
"""
import json
import boto3
import os
from decimal import Decimal
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize clients
dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1"))
bids_table = dynamodb.Table(os.environ.get("DYNAMODB_BIDS_TABLE", "bids_history"))


def lambda_handler(event, context):
    """
    Process SQS messages containing bid data

    Args:
        event: SQS event with bid messages
        context: Lambda context

    Returns:
        Batch processing results
    """
    logger.info(f"Processing {len(event['Records'])} bid records")

    successful = 0
    failed = 0

    for record in event["Records"]:
        try:
            # Parse message body
            message_body = json.loads(record["body"])

            # Process bid
            result = persist_bid(message_body)

            if result:
                successful += 1
            else:
                failed += 1

        except Exception as e:
            logger.error(f"Error processing record: {e}", exc_info=True)
            failed += 1

    logger.info(f"Batch complete: {successful} successful, {failed} failed")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "successful": successful,
            "failed": failed
        })
    }


def persist_bid(bid_data: dict) -> bool:
    """
    Persist single bid to DynamoDB

    Args:
        bid_data: Bid information from SQS

    Returns:
        True if successful, False otherwise
    """
    try:
        # Calculate TTL (90 days from now)
        import time
        ttl_expiry = int(time.time()) + (90 * 24 * 60 * 60)

        # Prepare item
        item = {
            "auction_id": bid_data["auction_id"],
            # Must match the DynamoDB sort key name created in ENTIRE_PHASE_GUIDELINES.md
            # (Phase 6: `timestamp_user_id`).
            "timestamp_user_id": f"{bid_data['timestamp']}#{bid_data['user_id']}",
            "bid_id": bid_data.get("bid_id", f"{bid_data['auction_id']}_{bid_data['timestamp']}"),
            "user_id": bid_data["user_id"],
            "username": bid_data["username"],
            "amount": Decimal(str(bid_data["amount"])),
            "timestamp": bid_data["timestamp"],
            "ttl_expiry": ttl_expiry
        }

        # Write to DynamoDB
        bids_table.put_item(Item=item)

        logger.info(f"Bid persisted: {item['bid_id']}")
        return True

    except Exception as e:
        logger.error(f"Failed to persist bid: {e}", exc_info=True)
        return False
