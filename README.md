# 🎯 Live Flash Auction Platform

A real-time auction platform built with microservices architecture, deployed on AWS EKS.

## 📋 Overview

This project implements a live flash auction system with real-time bidding, countdown timers, anti-sniping logic, and automated notifications. The backend is fully deployed on AWS EKS, and the frontend is ready for deployment.

## 🏗️ Architecture

### Backend Services (EKS)
- **Auction Management Service** (Port 8000) - CRUD operations, auction lifecycle management
- **Bid Processing Service** (Port 8002) - Atomic bid validation, anti-snipe logic
- **WebSocket Service** (Port 8001) - Real-time updates, chat, participant tracking
- **Timer Service** (Port 8003) - Countdown management, auction end detection

### AWS Infrastructure
- **EKS Cluster**: `live-auction-eks-cluster` (Kubernetes 1.31)
- **RDS PostgreSQL**: Primary database for auctions and users
- **ElastiCache Redis**: Real-time state management and pub/sub
- **DynamoDB**: Bid history persistence
- **SQS**: Message queues for async processing
- **Lambda**: Bid persistence and notification handlers
- **Cognito**: User authentication and authorization
- **ALB**: Application Load Balancer for service exposure

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured with appropriate credentials
- kubectl configured for EKS cluster
- Docker Desktop installed
- Node.js 18+ installed

### Key Documentation
1. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Complete project overview and current status
2. **[HANDOVER.md](./HANDOVER.md)** - Deployment and troubleshooting guide
3. **[ENTIRE_PHASE_GUIDELINES.md](./ENTIRE_PHASE_GUIDELINES.md)** - Step-by-step AWS setup guide
4. **[backend/README.md](./backend/README.md)** - Backend architecture and setup
5. **[frontend/README.md](./frontend/README.md)** - Frontend setup instructions

## 🔧 Current Status

### ✅ Completed
- Backend infrastructure fully deployed on EKS
- All 4 microservices running and operational
- Services exposed via ALB Ingress
- AWS resources verified and operational
- User authentication working end-to-end
- Auction creation and management functional
- Timer service properly handles auction expiration
- Email notifications working for auction closures

### ⚠️ In Progress
- Frontend bug fixes (auction listing, bidding features)
- End-to-end testing

### ⏸️ Pending
- Frontend deployment to S3/CloudFront (deferred until bug fixes)

## 🔄 Deployment

### Redeploy Services

**Timer Service** (⚠️ Required after recent fixes):
```bash
./redeploy-timer-service.sh
```

**All Services**:
```bash
./redeploy-all-services.sh
```

**Individual Services**:
- `./redeploy-auction-service.sh`
- `./redeploy-bid-processor-service.sh`
- `./redeploy-websocket-service.sh`

### Verify AWS Resources
```bash
./verify-aws-resources.sh
```

## 🐛 Recent Fixes (December 18, 2025)

### Critical Bug Fixes
1. **Auction Auto-Closing Issue**: Fixed timer service incorrectly calculating `end_time` from database instead of Redis state
2. **Notification Bug**: Fixed `AttributeError` preventing email notifications when auctions expired
3. **State Endpoint**: Fixed 500 errors in auction state endpoint with proper error handling
4. **Notification Logic**: Improved to send emails to all participants even with no bids

**Action Required**: Redeploy timer service to apply fixes:
```bash
./redeploy-timer-service.sh
```

## 📊 Monitoring & Logs

### Check Service Logs
```bash
# Timer service
kubectl logs -l app=timer -n default --tail=50

# Auction management
kubectl logs -l app=auction-management -n default --tail=50

# WebSocket service
kubectl logs -l app=websocket -n default --tail=50

# Bid processing
kubectl logs -l app=bid-processing -n default --tail=50
```

### Check Lambda Logs
```bash
aws logs tail /aws/lambda/auction-notifications-lambda --since 30m
aws logs tail /aws/lambda/bid-persistence-lambda --since 30m
```

## 🔍 Troubleshooting

### Services Not Responding
1. Check pod status: `kubectl get pods -n default`
2. Check pod logs: `kubectl logs <pod-name> -n default`
3. Check service endpoints: `kubectl get endpoints -n default`
4. Verify ALB: `kubectl get ingress -n default`

### Frontend Connection Issues
1. Verify ALB URL: `kubectl get ingress -n default`
2. Check CORS configuration in backend services
3. Verify API endpoints: `curl http://<ALB_URL>/api/auctions`
4. Check browser console for errors

### Notification Issues
1. Check timer service logs for "Successfully enqueued notification message"
2. Check Lambda logs for notification processing
3. Verify SQS queue: `aws sqs get-queue-attributes --queue-url <QUEUE_URL>`
4. Verify SES email configuration

## 📁 Project Structure

```
live-flash-auction/
├── backend/                    # Backend microservices
│   ├── auction-management-service/
│   ├── bid-processing-service/
│   ├── websocket-service/
│   ├── timer-service/
│   ├── shared/                 # Shared code and utilities
│   ├── lambdas/                # Lambda functions
│   └── k8s/                     # Kubernetes manifests
├── frontend/                    # React + TypeScript frontend
├── infra/                       # Infrastructure as code
├── scripts/                     # Deployment and utility scripts
├── PROJECT_STATUS.md           # Project status and progress
├── HANDOVER.md                 # Deployment guide
└── README.md                   # This file
```

## 🔐 Environment Variables

### Backend (Kubernetes Secrets)
All backend services use Kubernetes secrets (`auction-secrets`). See `backend/k8s/` for configuration.

### Frontend (.env)
Create `frontend/.env` with:
```bash
VITE_API_BASE_URL=<ALB_URL>
VITE_COGNITO_CLIENT_ID=<your-client-id>
VITE_COGNITO_REGION=us-east-1
```

## 📞 Support

For questions about:
- **Architecture**: See `PROJECT_STATUS.md`
- **AWS Setup**: See `ENTIRE_PHASE_GUIDELINES.md`
- **Backend Code**: See `backend/README.md`
- **Frontend Code**: See `frontend/README.md`
- **Deployment**: See `HANDOVER.md`

## 📝 License

This project is part of a Cloud Computing course assignment.

---

**Last Updated**: December 18, 2025  
**Status**: Backend Production Ready, Frontend Pending Deployment


