# Live Flash Auction - Backend Services

Real-time bidding platform with Flask-based microservices for live auctions with video streaming.

## Architecture

### Services

1. **Auction Management Service** (Port 8000)
   - Create and manage auctions
   - AWS IVS channel creation
   - Auction metadata and CRUD operations

2. **WebSocket Service** (Port 8001)
   - Real-time bidirectional communication
   - Chat messaging
   - Event broadcasting (bids, timer updates)
   - User presence tracking

3. **Bid Processing Service** (Port 8002)
   - Bid validation and atomic processing
   - Anti-snipe logic
   - Redis Lua scripts for atomic operations
   - Async bid persistence to DynamoDB

4. **Timer Service** (Port 8003)
   - Single source of truth for auction timers
   - Countdown management
   - Auction end detection
   - Timer synchronization broadcasts

### Technology Stack

- **Backend**: Flask (Python 3.11)
- **Database**: PostgreSQL (users, auctions)
- **Cache/State**: Redis (auction state, pub/sub, leaderboards)
- **Storage**: AWS DynamoDB (bid history)
- **Queue**: AWS SQS (async processing)
- **Video**: AWS IVS (live streaming)
- **Auth**: AWS Cognito (JWT tokens)
- **Orchestration**: Kubernetes (EKS)

## Local Development

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. **Start infrastructure with Docker Compose**
   ```bash
   docker-compose up -d postgres redis localstack
   ```

4. **Install shared dependencies**
   ```bash
   cd shared
   pip install -r requirements.txt
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec postgres psql -U auction_user -d live_auction -f /docker-entrypoint-initdb.d/init.sql
   ```

6. **Start services**

   Each service can be run independently:

   ```bash
   # Terminal 1 - Auction Management
   cd auction-management-service
   pip install -r requirements.txt
   python app/main.py

   # Terminal 2 - WebSocket
   cd websocket-service
   pip install -r requirements.txt
   python app/main.py

   # Terminal 3 - Bid Processing
   cd bid-processing-service
   pip install -r requirements.txt
   python app/main.py

   # Terminal 4 - Timer Service
   cd timer-service
   pip install -r requirements.txt
   python app/main.py
   ```

7. **Or use Docker Compose to run all services**
   ```bash
   docker-compose up --build
   ```

## API Documentation

**Base URL**: `http://k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com`

**Note**: All API endpoints are prefixed with `/api` when accessed via ALB Ingress.

### Auction Management Service

#### Create Auction
```http
POST /api/auctions
Authorization: Bearer <cognito_token>
Content-Type: application/json

{
  "title": "Vintage Rolex Watch",
  "description": "Rare 1960s Rolex Submariner",
  "duration": 3600,
  "category": "Watches",
  "starting_bid": 10000.00
}
```

#### Get Auction
```http
GET /api/auctions/{auction_id}
```

#### List Auctions
```http
GET /api/auctions?status=live&limit=20&offset=0&category=Watches
```

#### Get Auction State
```http
GET /api/auctions/{auction_id}/state
```

### Authentication Endpoints

#### Initiate Auth (Send OTP)
```http
POST /api/auth/initiate
Content-Type: application/json

{
  "email": "user@example.com",
  "isSignup": false
}
```

#### Verify OTP
```http
POST /api/auth/verify
Content-Type: application/json

{
  "session": "<session_token>",
  "otp": "123456"
}
```

#### Resend OTP
```http
POST /api/auth/resend
Content-Type: application/json

{
  "session": "<session_token>"
}
```

### Bid Processing Service

#### Place Bid
```http
POST /api/bids
Authorization: Bearer <cognito_token>
Content-Type: application/json

{
  "auction_id": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 15000.00
}
```

**Note**: The bid processing service is exposed via ALB at `/api/bids`.

### WebSocket Service

**Connection URL**: `ws://k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com`  
**Path**: `/socket.io` (Flask-SocketIO default)

#### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com', {
  path: '/socket.io',  // Flask-SocketIO default path
  transports: ['websocket', 'polling'],
  query: { 
    token: cognito_jwt_token,
    auction_id: 'auction-uuid'
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  // Emit join_auction after connection
  socket.emit('join_auction', {
    auction_id: '123e4567-e89b-12d3-a456-426614174000',
    token: cognito_jwt_token
  });
});
```

#### Join Auction
```javascript
socket.emit('join_auction', {
  auction_id: '123e4567-e89b-12d3-a456-426614174000',
  token: cognito_jwt_token
});

socket.on('joined_auction', (state) => {
  console.log('Auction state:', state);
});
```

#### Send Chat Message
```javascript
socket.emit('chat_message', {
  auction_id: auction_id,
  message: 'Hello!',
  user_id: user_id,
  username: username
});

socket.on('chat_message', (data) => {
  console.log('New message:', data);
});
```

#### Receive Bid Updates
```javascript
socket.on('bid_update', (data) => {
  console.log('New bid:', data);
  // data contains: high_bid, top_bids, you_are_winning, etc.
});
```

#### Receive Timer Updates
```javascript
socket.on('timer_update', (data) => {
  console.log('Timer:', data.time_remaining_seconds);
  // Sync local timer with server time
});
```

## Redis Data Structures

### Auction State Hash
```
Key: auction:{auction_id}:state
Fields:
  - status: "live" | "closed"
  - current_high_bid: "5000.00"
  - high_bidder_id: "uuid"
  - high_bidder_username: "JohnDoe"
  - participant_count: "45"
  - bid_count: "127"
```

### Top Bids Leaderboard
```
Key: auction:{auction_id}:top_bids
Type: Sorted Set
Members: user_id:username
Scores: bid amounts (top 3 only)
```

### Pub/Sub Channels
```
auction:{auction_id}:events   - Bid events, auction updates
auction:{auction_id}:timer    - Timer updates, anti-snipe
auction:{auction_id}:chat     - Chat messages
```

## Database Schema

### Users Table
```sql
user_id         UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
phone           VARCHAR(20)
is_verified     BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP
updated_at      TIMESTAMP
name            VARCHAR(255)
username        VARCHAR(100) UNIQUE NOT NULL
```

### Auctions Table
```sql
auction_id      UUID PRIMARY KEY
host_user_id    UUID REFERENCES users
title           VARCHAR(500) NOT NULL
description     TEXT
duration        INTEGER NOT NULL
category        VARCHAR(100)
starting_bid    DECIMAL(10,2) NOT NULL
created_at      TIMESTAMP
status          VARCHAR(20) DEFAULT 'live'
winner_id       UUID REFERENCES users
winning_bid     DECIMAL(10,2)
ended_at        TIMESTAMP
ivs_channel_arn VARCHAR(255)
ivs_stream_key  TEXT
ivs_playback_url TEXT
```

## Deployment

### Current Deployment Status

**Production ALB**: `k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com`

All services are deployed on EKS and exposed via ALB Ingress:
- `/api/auctions` → Auction Management Service (port 8000)
- `/api/auth` → Auction Management Service (port 8000)
- `/api/bids` → Bid Processing Service (port 8002)
- `/socket.io` → WebSocket Service (port 8001)
- `/health` → Health checks

### Build Docker Images

**Important**: Always build for `linux/amd64` platform (EKS nodes are x86_64).

```bash
# Build all services
docker-compose build

# Or build individually (with platform flag)
docker build --platform linux/amd64 -t auction-management:latest ./auction-management-service
docker build --platform linux/amd64 -t websocket:latest ./websocket-service
docker build --platform linux/amd64 -t bid-processing:latest ./bid-processing-service
docker build --platform linux/amd64 -t timer:latest ./timer-service
```

### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/auction-management/
kubectl apply -f k8s/websocket/
kubectl apply -f k8s/bid-processing/
kubectl apply -f k8s/timer/
kubectl apply -f k8s/ingress.yaml
```

### Redeploy Services

**Quick Redeploy** (Auction Management Service):
```bash
./redeploy-auction-service.sh
```

**Manual Redeploy**:
```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 938041861431.dkr.ecr.us-east-1.amazonaws.com

# 2. Build and push (example for auction-management-service)
cd backend
docker build --platform linux/amd64 -f auction-management-service/Dockerfile \
  -t 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/auction-management-service:latest .
docker push 938041861431.dkr.ecr.us-east-1.amazonaws.com/live-auction/auction-management-service:latest

# 3. Restart deployment
kubectl rollout restart deployment/auction-management-service
kubectl rollout status deployment/auction-management-service --timeout=5m
```

**See `../HANDOVER.md` for complete redeployment guide for all services.**

## Testing

### Health Check Endpoints

**Local Development**:
- Auction Management: http://localhost:8000/health
- WebSocket: http://localhost:8001/health
- Bid Processing: http://localhost:8002/health
- Timer: http://localhost:8003/health

**Production (via ALB)**:
- Health Check: http://k8s-default-liveauct-6106fb6182-1786964572.us-east-1.elb.amazonaws.com/health

### Verify Deployment

```bash
# Check pod status
kubectl get pods -l app=auction-management
kubectl get pods -l app=websocket
kubectl get pods -l app=bid-processing
kubectl get pods -l app=timer

# Check service endpoints
kubectl get ingress

# View logs
kubectl logs -l app=auction-management --tail=50
```

**See `../verify-aws-resources.sh` for comprehensive resource verification.**

## Lambda Functions

### Bid Persistence
- Trigger: SQS (bid-persistence-queue)
- Action: Write bids to DynamoDB
- Batch size: 10-100 records

### Auction Notifications
- Trigger: SQS (notification-queue)
- Action: Send emails/notifications to winners
- Uses: AWS SES/SNS

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `AWS_REGION` - AWS region
- `COGNITO_USER_POOL_ID` - AWS Cognito pool
- `SQS_*_QUEUE_URL` - SQS queue URLs
- `DYNAMODB_BIDS_TABLE` - DynamoDB table name

## Troubleshooting

### Redis connection issues
```bash
# Check Redis is running
docker-compose ps redis
redis-cli ping
```

### Database connection issues
```bash
# Check Postgres is running
docker-compose ps postgres
docker-compose exec postgres psql -U auction_user -d live_auction -c "SELECT 1"
```

### WebSocket connection issues
- Ensure CORS origins are configured correctly
- Verify Cognito token is valid (not expired)
- Check WebSocket service logs: `kubectl logs -l app=websocket`
- Verify ALB Ingress is routing `/socket.io` correctly
- Check that WebSocket service is using `/socket.io` path (Flask-SocketIO default)

### ALB/Ingress issues
- Check Ingress status: `kubectl get ingress`
- Verify ALB controller logs: `kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller`
- Ensure subnets are correctly configured in Ingress annotations
- Check security groups allow traffic on port 80

## 📚 Related Documentation

- **`../HANDOVER.md`** - Project handover guide with redeployment steps
- **`../PROJECT_STATUS.md`** - Current project status and progress
- **`../ENTIRE_PHASE_GUIDELINES.md`** - Complete AWS setup guide
- **`../frontend/README.md`** - Frontend documentation

## License

MIT
