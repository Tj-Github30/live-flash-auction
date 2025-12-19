# 🎯 Live Flash Auction Platform

A real-time auction platform built with microservices architecture, deployed on AWS EKS.

## 👥 Team Members
- Tejaswini PRadip Srivastava
- Komal Bagwe
- Frank Wang
- Shwetanshu Raj

## 📋 Overview

This project implements a live flash auction system with real-time bidding, countdown timers, anti-sniping logic, and automated notifications. The backend is fully deployed on AWS EKS, and the frontend is ready for deployment.

## Demo & Presentation
- [Youtbe Video](https://www.youtube.com/watch?v=yf7C636RsY4)
- [Presentation](https://docs.google.com/presentation/d/1boE4evdzk-UhxoZZ3doOs1HZDF_qqqV7Cd1rvZ-Ieks/edit?usp=sharing)

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
1. **[ENTIRE_PHASE_GUIDELINES.md](./ENTIRE_PHASE_GUIDELINES.md)** - Step-by-step AWS setup guide
2. **[backend/README.md](./backend/README.md)** - Backend architecture and setup
3. **[frontend/README.md](./frontend/README.md)** - Frontend setup instructions

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
└── README.md                   # This file
```

## Quick start (local dev)

> Exact commands can differ depending on your environment. Use the component READMEs as the source of truth.

1) Clone
```bash
git clone https://github.com/Tj-Github30/live-flash-auction
cd live-flash-auction
```

2) Backend

Follow backend/README.md

3) Frontend

Follow frontend/README.md

Frontend environment variables

Create frontend/.env:
```bash
VITE_API_BASE_URL=<ALB_URL_OR_LOCAL_API_BASE>
VITE_COGNITO_CLIENT_ID=<your-client-id>
VITE_COGNITO_REGION=us-east-1
```

## 🔄 Deployment

Start here: ENTIRE_PHASE_GUIDELINES.md

### Redeploy Services

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
- **AWS Setup**: See `ENTIRE_PHASE_GUIDELINES.md`
- **Backend Code**: See `backend/README.md`
- **Frontend Code**: See `frontend/README.md`

## 📝 License

This project is part of a Cloud Computing course assignment.

---



