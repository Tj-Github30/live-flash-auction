#!/bin/bash

# Redeploy Auction Management Service to EKS
# This script builds the Docker image, pushes it to ECR, and restarts the Kubernetes deployment

set -e

echo "=========================================="
echo "Redeploying Auction Management Service"
echo "=========================================="
echo ""

# Configuration
ECR_REGISTRY="938041861431.dkr.ecr.us-east-1.amazonaws.com"
ECR_REPO="live-auction/auction-management-service"
IMAGE_TAG="latest"
AWS_REGION="us-east-1"
SERVICE_NAME="auction-management-service"

# Full image name
IMAGE_NAME="${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}"

echo "Step 1: Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

echo ""
echo "Step 2: Building Docker image for linux/amd64 platform..."
cd backend
docker build --platform linux/amd64 -f auction-management-service/Dockerfile -t ${IMAGE_NAME} .

echo ""
echo "Step 3: Pushing new image to ECR..."
docker push ${IMAGE_NAME}

echo ""
echo "Step 4: Restarting Kubernetes deployment..."
kubectl rollout restart deployment/${SERVICE_NAME}

echo ""
echo "Step 5: Waiting for rollout to complete..."
kubectl rollout status deployment/${SERVICE_NAME} --timeout=5m

echo ""
echo "=========================================="
echo "✅ Redeployment Complete!"
echo "=========================================="
echo ""
echo "New pods:"
kubectl get pods -l app=auction-management
echo ""
echo "To check logs:"
echo "  kubectl logs -l app=auction-management --tail=50"
echo ""
echo "To test the endpoint:"
echo "  curl http://k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com/api/auctions"

