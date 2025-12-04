"""
Lambda Function: Auction End Notifications
Sends notifications to winners and participants
"""
import json
import boto3
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize clients
sns = boto3.client("sns", region_name=os.environ.get("AWS_REGION", "us-east-1"))
ses = boto3.client("ses", region_name=os.environ.get("AWS_REGION", "us-east-1"))


def lambda_handler(event, context):
    """
    Process SQS messages containing auction end notifications

    Args:
        event: SQS event with notification messages
        context: Lambda context

    Returns:
        Processing results
    """
    logger.info(f"Processing {len(event['Records'])} notification records")

    for record in event["Records"]:
        try:
            # Parse message body
            message_body = json.loads(record["body"])

            notification_type = message_body.get("type")

            if notification_type == "auction_end":
                process_auction_end_notification(message_body)

        except Exception as e:
            logger.error(f"Error processing notification: {e}", exc_info=True)

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Notifications processed"})
    }


def process_auction_end_notification(data: dict):
    """
    Send auction end notification to winner

    Args:
        data: Auction end data
    """
    try:
        auction_id = data["auction_id"]
        winner_id = data["winner_id"]
        winner_username = data.get("winner_username", "User")
        winning_bid = data["winning_bid"]
        auction_title = data.get("auction_title", "Auction")

        logger.info(f"Auction ended: {auction_id}, Winner: {winner_id}")

        # TODO: Get winner email from database
        # For now, log the notification
        logger.info(f"Would send email to winner {winner_username}")
        logger.info(f"Auction: {auction_title}, Winning bid: ${winning_bid}")

        # Example: Send SNS notification
        # sns.publish(
        #     TopicArn=os.environ.get("SNS_TOPIC_ARN"),
        #     Subject=f"Congratulations! You won: {auction_title}",
        #     Message=f"You won the auction with a bid of ${winning_bid}!"
        # )

        # Example: Send SES email
        # ses.send_email(
        #     Source="noreply@auction.com",
        #     Destination={"ToAddresses": [winner_email]},
        #     Message={
        #         "Subject": {"Data": f"You Won: {auction_title}"},
        #         "Body": {
        #             "Html": {
        #                 "Data": f"<h1>Congratulations!</h1><p>You won with ${winning_bid}</p>"
        #             }
        #         }
        #     }
        # )

    except Exception as e:
        logger.error(f"Failed to send notification: {e}", exc_info=True)
