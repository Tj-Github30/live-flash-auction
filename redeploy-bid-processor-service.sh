#!/bin/bash

# Redeploy Bid Processing Service to EKS
# This script builds the Docker image, pushes it to ECR, and restarts the Kubernetes deployment

set -e

echo "=========================================="
echo "Redeploying Bid Processing Service"
echo "=========================================="
echo ""

# Configuration
ECR_REGISTRY="938041861431.dkr.ecr.us-east-1.amazonaws.com"
ECR_REPO="live-auction/bid-processing-service"
IMAGE_TAG="latest"
AWS_REGION="us-east-1"
SERVICE_NAME="bid-processing-service"

# Full image name
IMAGE_NAME="${ECR_REGISTRY}/${ECR_REPO}:${IMAGE_TAG}"

echo "Step 1: Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

echo ""
echo "Step 2: Building Docker image for linux/amd64 platform (no cache)..."
cd backend
docker build --platform linux/amd64 --no-cache -f bid-processing-service/Dockerfile -t ${IMAGE_NAME} .

echo ""
echo "Step 3: Deleting old image from ECR (if exists)..."
aws ecr batch-delete-image \
    --repository-name ${ECR_REPO} \
    --image-ids imageTag=${IMAGE_TAG} \
    --region ${AWS_REGION} 2>/dev/null || echo "No old image to delete (or doesn't exist)"

echo ""
echo "Step 4: Pushing new image to ECR..."
docker push ${IMAGE_NAME}

echo ""
echo "Step 5: Restarting Kubernetes deployment..."
kubectl rollout restart deployment/${SERVICE_NAME}

echo ""
echo "Step 6: Waiting for rollout to complete..."
kubectl rollout status deployment/${SERVICE_NAME} --timeout=5m

echo ""
echo "=========================================="
echo "✅ Redeployment Complete!"
echo "=========================================="
echo ""
echo "New pods:"
kubectl get pods -l app=bid-processing
echo ""
echo "To check logs:"
echo "  kubectl logs -l app=bid-processing --tail=50"
echo ""
echo "To test the endpoint (via ingress/ALB):"
echo "  curl http://<YOUR-ALB-DNS>/api/bids"


