#!/bin/bash

# AWS Resources Verification Script
# Checks if all required AWS resources exist for Live Flash Auction project

echo "=========================================="
echo "AWS Resources Verification"
echo "Account: 938041861431"
echo "Region: us-east-1"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

# Function to check if output is empty
check_exists() {
    if [ -z "$1" ]; then
        echo -e "${RED}✗${NC} Not found"
        return 1
    else
        echo -e "${GREEN}✓${NC} Found"
        return 0
    fi
}

echo "1. Checking RDS PostgreSQL..."
RDS_INSTANCE=$(aws rds describe-db-instances --region us-east-1 \
    --query 'DBInstances[?contains(DBInstanceIdentifier, `live-auction`) || contains(DBInstanceIdentifier, `auction`)].DBInstanceIdentifier' \
    --output text 2>/dev/null)
if check_exists "$RDS_INSTANCE"; then
    RDS_ENDPOINT=$(aws rds describe-db-instances --region us-east-1 \
        --db-instance-identifier $RDS_INSTANCE \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text 2>/dev/null)
    RDS_STATUS=$(aws rds describe-db-instances --region us-east-1 \
        --db-instance-identifier $RDS_INSTANCE \
        --query 'DBInstances[0].DBInstanceStatus' \
        --output text 2>/dev/null)
    echo "   Instance: $RDS_INSTANCE"
    echo "   Endpoint: $RDS_ENDPOINT"
    echo "   Status: $RDS_STATUS"
else
    echo -e "   ${YELLOW}⚠${NC} RDS instance not found. Check if it exists with a different name."
fi
echo ""

echo "2. Checking ElastiCache Redis..."
REDIS_CLUSTER=$(aws elasticache describe-cache-clusters --region us-east-1 \
    --query 'CacheClusters[?contains(CacheClusterId, `live-auction`) || contains(CacheClusterId, `auction`)].CacheClusterId' \
    --output text 2>/dev/null)
if check_exists "$REDIS_CLUSTER"; then
    REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters --region us-east-1 \
        --cache-cluster-id $REDIS_CLUSTER \
        --query 'CacheClusters[0].ConfigurationEndpoint.Address' \
        --output text 2>/dev/null)
    REDIS_STATUS=$(aws elasticache describe-cache-clusters --region us-east-1 \
        --cache-cluster-id $REDIS_CLUSTER \
        --query 'CacheClusters[0].CacheClusterStatus' \
        --output text 2>/dev/null)
    echo "   Cluster: $REDIS_CLUSTER"
    echo "   Endpoint: $REDIS_ENDPOINT"
    echo "   Status: $REDIS_STATUS"
else
    echo -e "   ${YELLOW}⚠${NC} Redis cluster not found. Check if it exists with a different name."
fi
echo ""

echo "3. Checking SQS Queues..."
BID_QUEUE=$(aws sqs list-queues --region us-east-1 \
    --queue-name-prefix "bid" \
    --output text 2>/dev/null | grep -i "bid")
NOTIFICATION_QUEUE=$(aws sqs list-queues --region us-east-1 \
    --queue-name-prefix "notification" \
    --output text 2>/dev/null | grep -i "notification")

if check_exists "$BID_QUEUE"; then
    echo "   Bid Queue: $BID_QUEUE"
else
    echo -e "   ${RED}✗${NC} Bid persistence queue not found"
fi

if check_exists "$NOTIFICATION_QUEUE"; then
    echo "   Notification Queue: $NOTIFICATION_QUEUE"
else
    echo -e "   ${RED}✗${NC} Notification queue not found"
fi
echo ""

echo "4. Checking Cognito User Pool..."
COGNITO_POOL=$(aws cognito-idp list-user-pools --max-results 10 --region us-east-1 \
    --query 'UserPools[?contains(Name, `live-auction`) || contains(Name, `auction`)].{Id:Id,Name:Name}' \
    --output json 2>/dev/null)
if [ "$COGNITO_POOL" != "[]" ] && [ ! -z "$COGNITO_POOL" ]; then
    echo -e "${GREEN}✓${NC} Cognito user pool found"
    echo "$COGNITO_POOL" | jq -r '.[] | "   ID: \(.Id), Name: \(.Name)"'
else
    echo -e "${RED}✗${NC} Cognito user pool not found"
fi
echo ""

echo "5. Checking DynamoDB Tables..."
DYNAMODB_TABLE=$(aws dynamodb list-tables --region us-east-1 \
    --query 'TableNames[?contains(@, `bid`) || contains(@, `auction`)]' \
    --output text 2>/dev/null)
if check_exists "$DYNAMODB_TABLE"; then
    echo "   Table: $DYNAMODB_TABLE"
else
    echo -e "   ${YELLOW}⚠${NC} DynamoDB table not found (may use different name)"
fi
echo ""

echo "6. Checking Lambda Functions..."
LAMBDA_FUNCTIONS=$(aws lambda list-functions --region us-east-1 \
    --query 'Functions[?contains(FunctionName, `auction`) || contains(FunctionName, `bid`)].{Name:FunctionName,Runtime:Runtime}' \
    --output json 2>/dev/null)
if [ "$LAMBDA_FUNCTIONS" != "[]" ] && [ ! -z "$LAMBDA_FUNCTIONS" ]; then
    echo -e "${GREEN}✓${NC} Lambda functions found"
    echo "$LAMBDA_FUNCTIONS" | jq -r '.[] | "   \(.Name) (\(.Runtime))"'
else
    echo -e "${RED}✗${NC} Lambda functions not found"
fi
echo ""

echo "7. Checking EKS Cluster..."
EKS_CLUSTER=$(aws eks list-clusters --region us-east-1 \
    --query 'clusters[?contains(@, `live-auction`) || contains(@, `auction`)]' \
    --output text 2>/dev/null)
if check_exists "$EKS_CLUSTER"; then
    CLUSTER_STATUS=$(aws eks describe-cluster --name $EKS_CLUSTER --region us-east-1 \
        --query 'cluster.status' \
        --output text 2>/dev/null)
    echo "   Cluster: $EKS_CLUSTER"
    echo "   Status: $CLUSTER_STATUS"
else
    echo -e "   ${RED}✗${NC} EKS cluster not found"
fi
echo ""

echo "8. Checking ECR Repositories..."
ECR_REPOS=$(aws ecr describe-repositories --region us-east-1 \
    --query 'repositories[?contains(repositoryName, `live-auction`) || contains(repositoryName, `auction`)].repositoryName' \
    --output text 2>/dev/null)
if check_exists "$ECR_REPOS"; then
    echo -e "${GREEN}✓${NC} ECR repositories found:"
    for repo in $ECR_REPOS; do
        echo "   - $repo"
    done
else
    echo -e "${RED}✗${NC} ECR repositories not found"
fi
echo ""

echo "9. Checking Kubernetes Services..."
if command -v kubectl &> /dev/null; then
    echo "   Checking if kubectl is configured..."
    if kubectl cluster-info &> /dev/null; then
        echo -e "${GREEN}✓${NC} kubectl is configured"
        echo ""
        echo "   Backend Services:"
        kubectl get svc -o wide 2>/dev/null | grep -E "(auction|bid|websocket|timer)" || echo "   No services found"
        echo ""
        echo "   Pods Status:"
        kubectl get pods -o wide 2>/dev/null | grep -E "(auction|bid|websocket|timer)" || echo "   No pods found"
    else
        echo -e "${YELLOW}⚠${NC} kubectl not configured or cluster not accessible"
        echo "   Run: aws eks update-kubeconfig --name live-auction-eks-cluster --region us-east-1"
    fi
else
    echo -e "${YELLOW}⚠${NC} kubectl not installed"
fi
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Green (✓) = Found and configured"
echo "- Red (✗) = Not found or missing"
echo "- Yellow (⚠) = Needs attention"
echo ""
echo "Next Steps:"
echo "1. Fix any red items (missing resources)"
echo "2. Verify yellow items (may exist with different names)"
echo "3. Check PROJECT_STATUS.md for detailed status"

