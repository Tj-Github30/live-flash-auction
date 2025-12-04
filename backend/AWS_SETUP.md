# AWS Services Setup Guide

This document provides setup instructions for all required AWS services.

## Prerequisites

- AWS Account
- AWS CLI configured
- Appropriate IAM permissions

## 1. DynamoDB Tables

### Bids History Table

```bash
aws dynamodb create-table \
  --table-name bids_history \
  --attribute-definitions \
    AttributeName=auction_id,AttributeType=S \
    AttributeName=timestamp#user_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=auction_id,KeyType=HASH \
    AttributeName=timestamp#user_id,KeyType=RANGE \
  --global-secondary-indexes \
    '[{
      "IndexName": "user_id-timestamp-index",
      "KeySchema": [
        {"AttributeName": "user_id", "KeyType": "HASH"},
        {"AttributeName": "timestamp", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
      }
    }]' \
  --provisioned-throughput \
    ReadCapacityUnits=10,WriteCapacityUnits=10 \
  --tags Key=Project,Value=LiveAuction \
  --region us-east-1
```

### Enable TTL on Bids Table

```bash
aws dynamodb update-time-to-live \
  --table-name bids_history \
  --time-to-live-specification \
    "Enabled=true, AttributeName=ttl_expiry" \
  --region us-east-1
```

### Chat Messages Table (Optional - Future Use)

```bash
aws dynamodb create-table \
  --table-name chat_messages \
  --attribute-definitions \
    AttributeName=auction_id,AttributeType=S \
    AttributeName=timestamp#message_id,AttributeType=S \
  --key-schema \
    AttributeName=auction_id,KeyType=HASH \
    AttributeName=timestamp#message_id,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --tags Key=Project,Value=LiveAuction \
  --region us-east-1
```

## 2. SQS Queues

### Bid Persistence Queue (FIFO)

```bash
aws sqs create-queue \
  --queue-name bid-persistence-queue.fifo \
  --attributes '{
    "FifoQueue": "true",
    "ContentBasedDeduplication": "true",
    "MessageRetentionPeriod": "86400",
    "VisibilityTimeout": "300"
  }' \
  --region us-east-1
```

Save the queue URL output for your `.env` file.

### Notification Queue (FIFO)

```bash
aws sqs create-queue \
  --queue-name notification-queue.fifo \
  --attributes '{
    "FifoQueue": "true",
    "ContentBasedDeduplication": "true",
    "MessageRetentionPeriod": "86400",
    "VisibilityTimeout": "300"
  }' \
  --region us-east-1
```

### Chat Persistence Queue (Standard - Optional)

```bash
aws sqs create-queue \
  --queue-name chat-persistence-queue \
  --attributes '{
    "MessageRetentionPeriod": "86400",
    "VisibilityTimeout": "300"
  }' \
  --region us-east-1
```

## 3. AWS IVS (Interactive Video Service)

IVS channels are created dynamically by the Auction Management Service when a new auction is created. No pre-setup required, but ensure your IAM role has these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ivs:CreateChannel",
        "ivs:GetChannel",
        "ivs:DeleteChannel",
        "ivs:StopStream",
        "ivs:ListChannels"
      ],
      "Resource": "*"
    }
  ]
}
```

## 4. AWS Cognito User Pool

### Create User Pool

```bash
aws cognito-idp create-user-pool \
  --pool-name live-auction-users \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }' \
  --auto-verified-attributes email \
  --username-attributes email \
  --schema '[
    {
      "Name": "email",
      "Required": true,
      "Mutable": false
    },
    {
      "Name": "name",
      "Required": true,
      "Mutable": true
    }
  ]' \
  --region us-east-1
```

Save the UserPoolId from the output.

### Create App Client

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --client-name live-auction-app \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region us-east-1
```

Save the ClientId from the output.

## 5. Lambda Functions

### Create Execution Role

```bash
aws iam create-role \
  --role-name live-auction-lambda-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'
```

### Attach Policies

```bash
# Basic Lambda execution
aws iam attach-role-policy \
  --role-name live-auction-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# DynamoDB access
aws iam attach-role-policy \
  --role-name live-auction-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# SQS access
aws iam attach-role-policy \
  --role-name live-auction-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSQSFullAccess

# SNS/SES for notifications
aws iam attach-role-policy \
  --role-name live-auction-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess
```

### Deploy Bid Persistence Lambda

```bash
cd backend/lambdas/bid-persistence
zip -r function.zip . -x "*.pyc" -x "__pycache__/*"

aws lambda create-function \
  --function-name bid-persistence \
  --runtime python3.11 \
  --role arn:aws:iam::<ACCOUNT_ID>:role/live-auction-lambda-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip \
  --environment Variables="{
    AWS_REGION=us-east-1,
    DYNAMODB_BIDS_TABLE=bids_history
  }" \
  --timeout 300 \
  --memory-size 512 \
  --region us-east-1
```

### Deploy Notification Lambda

```bash
cd backend/lambdas/auction-notifications
zip -r function.zip . -x "*.pyc" -x "__pycache__/*"

aws lambda create-function \
  --function-name auction-notifications \
  --runtime python3.11 \
  --role arn:aws:iam::<ACCOUNT_ID>:role/live-auction-lambda-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip \
  --environment Variables="{
    AWS_REGION=us-east-1
  }" \
  --timeout 300 \
  --memory-size 256 \
  --region us-east-1
```

### Connect SQS to Lambda

#### Bid Persistence

```bash
aws lambda create-event-source-mapping \
  --function-name bid-persistence \
  --event-source-arn arn:aws:sqs:us-east-1:<ACCOUNT_ID>:bid-persistence-queue.fifo \
  --batch-size 10 \
  --region us-east-1
```

#### Notifications

```bash
aws lambda create-event-source-mapping \
  --function-name auction-notifications \
  --event-source-arn arn:aws:sqs:us-east-1:<ACCOUNT_ID>:notification-queue.fifo \
  --batch-size 10 \
  --region us-east-1
```

## 6. RDS PostgreSQL

### Create DB Subnet Group

```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name live-auction-subnet-group \
  --db-subnet-group-description "Subnet group for live auction DB" \
  --subnet-ids subnet-xxxxx subnet-yyyyy \
  --region us-east-1
```

### Create PostgreSQL Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier live-auction-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username auction_admin \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --db-subnet-group-name live-auction-subnet-group \
  --vpc-security-group-ids sg-xxxxx \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --region us-east-1
```

Wait for instance to be available, then get endpoint:

```bash
aws rds describe-db-instances \
  --db-instance-identifier live-auction-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

## 7. ElastiCache Redis

### Create Cache Subnet Group

```bash
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name live-auction-redis-subnet \
  --cache-subnet-group-description "Redis subnet for live auction" \
  --subnet-ids subnet-xxxxx subnet-yyyyy \
  --region us-east-1
```

### Create Redis Cluster

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id live-auction-redis \
  --engine redis \
  --engine-version 7.0 \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1 \
  --cache-subnet-group-name live-auction-redis-subnet \
  --security-group-ids sg-xxxxx \
  --region us-east-1
```

Get Redis endpoint:

```bash
aws elasticache describe-cache-clusters \
  --cache-cluster-id live-auction-redis \
  --show-cache-node-info \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' \
  --output text
```

## 8. Update Environment Variables

After creating all AWS resources, update your `.env` file:

```bash
# Database
DATABASE_URL=postgresql://auction_admin:<password>@<rds-endpoint>:5432/live_auction

# Redis
REDIS_URL=redis://<elasticache-endpoint>:6379/0

# AWS Cognito
COGNITO_USER_POOL_ID=<user-pool-id>
COGNITO_APP_CLIENT_ID=<app-client-id>
COGNITO_REGION=us-east-1
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/<user-pool-id>

# SQS Queues
SQS_BID_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/<account-id>/bid-persistence-queue.fifo
SQS_NOTIFICATION_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/<account-id>/notification-queue.fifo

# DynamoDB
DYNAMODB_BIDS_TABLE=bids_history
```

## Cost Estimates (Monthly)

- **RDS PostgreSQL (db.t3.micro)**: ~$15
- **ElastiCache Redis (cache.t3.micro)**: ~$12
- **DynamoDB (on-demand)**: ~$1-5 (depends on traffic)
- **SQS**: Nearly free (first 1M requests free)
- **Lambda**: Nearly free (first 1M requests free)
- **IVS**: Pay per streaming hour (~$2-3/hour)

**Estimated Total**: $30-40/month (plus IVS streaming costs)

## Security Checklist

- [ ] Enable MFA for AWS root account
- [ ] Use IAM roles with least privilege
- [ ] Enable encryption at rest for RDS and DynamoDB
- [ ] Use VPC for all resources
- [ ] Configure security groups with minimal access
- [ ] Enable CloudWatch logs for all services
- [ ] Set up AWS WAF for API endpoints
- [ ] Enable AWS Shield for DDoS protection
- [ ] Rotate credentials regularly
- [ ] Use AWS Secrets Manager for sensitive data

## Monitoring

Enable CloudWatch alarms for:
- RDS CPU/Memory usage
- Redis CPU/Memory usage
- Lambda errors and throttles
- SQS queue depth
- DynamoDB throttles

## Next Steps

1. Test all services locally with LocalStack
2. Deploy to staging environment
3. Load test the platform
4. Set up CI/CD pipeline
5. Configure production monitoring
6. Set up backup and disaster recovery
