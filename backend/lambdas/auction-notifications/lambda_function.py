"""
Lambda Function: Auction End Notifications
Sends notifications to winners and participants
"""
import json
import boto3
import os
import logging
from typing import List, Dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize clients
ses = boto3.client("ses", region_name=os.environ.get("AWS_REGION", "us-east-1"))

FROM_EMAIL = os.environ.get("NOTIFY_FROM_EMAIL") or os.environ.get("SES_FROM_EMAIL")


def lambda_handler(event, context):
    """
    Process SQS messages containing notifications.
    Expected message for auction close (type=auction_closed):
    {
      "type": "auction_closed",
      "auction_id": "...",
      "title": "...",
      "final_price": 123.45,
      "winner": { "user_id": "...", "email": "...", "name": "...", "username": "..." },
      "losers": [{ "user_id": "...", "email": "...", "name": "...", "username": "..." }],
      "timestamp": 123456789
    }
    """
    logger.info(f"Processing {len(event['Records'])} notification records")

    for record in event["Records"]:
        try:
            message_body = json.loads(record["body"])
            notification_type = message_body.get("type")

            if notification_type == "auction_closed":
                process_auction_closed_notification(message_body)

        except Exception as e:
            logger.error(f"Error processing notification: {e}", exc_info=True)

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Notifications processed"})
    }


def process_auction_closed_notification(data: Dict):
    """
    Send winner + loser emails when an auction closes.
    """
    try:
        auction_title = data.get("title", "Auction")
        final_price = data.get("final_price", 0)
        winner = data.get("winner")
        losers: List[Dict] = data.get("losers", []) or []

        if not FROM_EMAIL:
            logger.warning("NOTIFY_FROM_EMAIL/SES_FROM_EMAIL not set; skipping email sends.")
            return

        # Winner email
        if winner and winner.get("email"):
            send_email(
                to_addresses=[winner["email"]],
                subject=f"You won: {auction_title}",
                html_body=f"""
                    <h2>Congratulations!</h2>
                    <p>You won <strong>{auction_title}</strong> for ${final_price}.</p>
                """,
                text_body=f"You won {auction_title} for ${final_price}."
            )

        # Loser emails
        for loser in losers:
            if not loser.get("email"):
                continue
            send_email(
                to_addresses=[loser["email"]],
                subject=f"Auction ended: {auction_title}",
                html_body=f"""
                    <h3>Auction ended</h3>
                    <p>You were outbid on <strong>{auction_title}</strong>. Final price: ${final_price}.</p>
                """,
                text_body=f"You were outbid on {auction_title}. Final price: ${final_price}."
            )

    except Exception as e:
        logger.error(f"Failed to send auction_closed notification: {e}", exc_info=True)


def send_email(to_addresses: List[str], subject: str, html_body: str, text_body: str = ""):
    try:
        ses.send_email(
            Source=FROM_EMAIL,
            Destination={"ToAddresses": to_addresses},
            Message={
                "Subject": {"Data": subject},
                "Body": {
                    "Html": {"Data": html_body},
                    "Text": {"Data": text_body or subject},
                },
            },
        )
        logger.info(f"Sent email to {to_addresses}: {subject}")
    except Exception as e:
        logger.error(f"SES send failed to {to_addresses}: {e}", exc_info=True)
