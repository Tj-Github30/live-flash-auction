# 🚀 Live Flash Auction - Project Handover Guide

**Date**: December 2025  
**Status**: Production Ready - Backend Deployed on EKS, Frontend Ready for Deployment

---

## 📋 Quick Start

### Prerequisites
- AWS CLI configured with appropriate credentials
- kubectl configured for EKS cluster
- Docker Desktop installed
- Node.js 18+ installed

### Key Files
- **Backend**: `backend/` - All microservices
- **Frontend**: `frontend/` - React + TypeScript application
- **Kubernetes**: `backend/k8s/` - All deployment manifests
- **Documentation**: See below for important docs

---

## 📚 Important Documentation

### Essential Reading
1. **`PROJECT_STATUS.md`** - Complete project overview and current status
2. **`ENTIRE_PHASE_GUIDELINES.md`** - Step-by-step AWS setup guide
3. **`backend/README.md`** - Backend architecture and setup
4. **`frontend/README.md`** - Frontend setup instructions

### Deployment Scripts
- **`redeploy-auction-service.sh`** - Rebuild and redeploy auction service (see Redeployment Guide below)
- **`verify-aws-resources.sh`** - Verify all AWS resources

---

## 🔧 Current Deployment Status

### Backend (EKS)
- ✅ Auction Management Service - Running
- ✅ WebSocket Service - Running  
- ✅ Bid Processing Service - Running
- ✅ Timer Service - Running
- ✅ ALB Ingress - Configured at: `k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com`

### Frontend
- ⚠️ Login working correctly
- ⚠️ Other features have bugs (need fixing)
- ⏸️ Deployment deferred to last step (after bug fixes)

### AWS Resources
- ✅ RDS PostgreSQL
- ✅ ElastiCache Redis
- ✅ DynamoDB (bids_history)
- ✅ SQS Queues
- ✅ Lambda Functions
- ✅ Cognito User Pool

---

## 🔄 Check AWS Services

### Check AWS Services

**Quick Method** (using script):
```bash
./verify-aws-resources.sh
```
---

## 🔄 Redeployment Guide

### Redeploy Auction Management Service

**Quick Method** (using script):
```bash
./redeploy-auction-service.sh
```

**Manual Method**:
```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 938041861431.dkr.ecr.us-east-1.amazonaws.com

# 2. Build Docker image (for linux/amd64 platform)
cd backend
docker build --platform linux/amd64 -f auction-management-service/Dockerfile -t 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/auction-management-service:latest .

# 3. Push to ECR
docker push 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/auction-management-service:latest

# 4. Restart Kubernetes deployment
kubectl rollout restart deployment/auction-management-service

# 5. Wait for rollout
kubectl rollout status deployment/auction-management-service --timeout=5m

# 6. Verify pods
kubectl get pods -l app=auction-management
```

### Redeploy Other Services

**WebSocket Service**:
```bash
cd backend
docker build --platform linux/amd64 -f websocket-service/Dockerfile -t 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/websocket-service:latest .
docker push 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/websocket-service:latest
kubectl rollout restart deployment/websocket-service
kubectl rollout status deployment/websocket-service --timeout=5m
```

**Bid Processing Service**:
```bash
cd backend
docker build --platform linux/amd64 -f bid-processing-service/Dockerfile -t 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/bid-processing-service:latest .
docker push 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/bid-processing-service:latest
kubectl rollout restart deployment/bid-processing-service
kubectl rollout status deployment/bid-processing-service --timeout=5m
```

**Timer Service**:
```bash
cd backend
docker build --platform linux/amd64 -f timer-service/Dockerfile -t 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/timer-service:latest .
docker push 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/timer-service:latest
kubectl rollout restart deployment/timer-service
kubectl rollout status deployment/timer-service --timeout=5m
```

**Important Notes**:
- Always use `--platform linux/amd64` when building Docker images (EKS nodes are x86_64)
- Wait for rollout to complete before testing
- Check pod logs if issues occur: `kubectl logs -l app=<service-name> --tail=50`

---

## 🚀 Next Steps

1. **Fix Frontend Bugs** (if needed):
   - Login is working correctly
   - Other features have bugs that need fixing
   - See `PROJECT_STATUS.md` for details

2. **Deploy Frontend** (Last Step - After Bug Fixes):
   ```bash
   cd frontend
   npm install
   npm run build
   # Upload to S3 + CloudFront (see ENTIRE_PHASE_GUIDELINES.md Phase 2)
   ```

3. **Update Frontend .env**:
   ```bash
   VITE_API_BASE_URL=http://k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com
   ```

4. **Test End-to-End**:
   - Test login flow
   - Create auction
   - Join auction room
   - Place bids
   - Test WebSocket real-time updates

---

## 📝 Environment Variables

### Backend (Kubernetes Secrets)
All backend services use Kubernetes secrets (`auction-secrets`). See `backend/k8s/` for configuration.

### Frontend (.env)
Create `frontend/.env` with:
```bash
VITE_API_BASE_URL=<ALB_URL>
VITE_COGNITO_CLIENT_ID=<your-client-id>
VITE_COGNITO_REGION=us-east-1
# ... other Cognito vars
```

---

## 🐛 Troubleshooting

### Backend Issues
- Check pod logs: `kubectl logs -l app=auction-management`
- Verify ALB: `kubectl get ingress`
- Check AWS resources: `./verify-aws-resources.sh`

### Frontend Issues
- Check browser console for errors
- Verify API URL in `.env`
- Test API directly: `curl http://<ALB_URL>/api/auctions`

---

## 📞 Support

For questions about:
- **Architecture**: See `PROJECT_STATUS.md`
- **AWS Setup**: See `ENTIRE_PHASE_GUIDELINES.md`
- **Backend Code**: See `backend/README.md`
- **Frontend Code**: See `frontend/README.md`

---

**Good luck! 🎉**

