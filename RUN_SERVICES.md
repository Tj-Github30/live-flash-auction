# 🚀 Step-by-Step Guide: Running Backend & Frontend

## Prerequisites

- **Python 3.11+** installed
- **Node.js 18+** and **npm** installed
- **Docker & Docker Compose** (optional, for full setup with PostgreSQL/Redis)

---

## Option 1: Quick Start (SQLite - No Docker Required) ⚡

### Step 1: Setup Backend Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR on Windows: venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

### Step 2: Create Backend Environment File

```bash
# Still in backend directory
cat > .env << 'EOF'
# Database (SQLite for local testing)
DATABASE_URL=sqlite:///./test_live_auction.db

# Redis (use local Redis or Docker)
REDIS_URL=redis://localhost:6379/0

# AWS Cognito (your existing values)
COGNITO_USER_POOL_ID=us-east-1_UHhA2Am3q
COGNITO_APP_CLIENT_ID=236m0jv1dnmdvddogrquhf0vc9
COGNITO_REGION=us-east-1
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_UHhA2Am3q

# Application Settings
FLASK_ENV=development
FLASK_DEBUG=True
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# AWS Services (optional for local testing)
AWS_REGION=us-east-1
SQS_BID_QUEUE_URL=
SQS_NOTIFICATION_QUEUE_URL=
DYNAMODB_BIDS_TABLE=bids_history
EOF
```

### Step 3: Initialize Database

```bash
# Still in backend directory
python3 setup_sqlite_db.py
```

You should see:
```
✅ Database initialized!
✅ All required tables created!
```

### Step 4: Start Redis (Required)

**Option A: Using Docker (Recommended)**
```bash
# In backend directory
docker-compose up -d redis
```

**Option B: Install Redis Locally**
```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

### Step 5: Start Backend Services

You need **4 terminal windows** for all services, or use the simplified approach below.

#### Simplified: Start Only Auction Management Service (For Testing)

**Terminal 1: Auction Management Service**
```bash
cd backend

# Set Python path
export PYTHONPATH="$(pwd)/shared:$(pwd):$PYTHONPATH"

# Start service
cd auction-management-service
python3 -m app.main
```

Wait for: `* Running on http://0.0.0.0:8000`

#### Full Setup: All 4 Services

**Terminal 1: Auction Management Service (Port 8000)**
```bash
cd backend
export PYTHONPATH="$(pwd)/shared:$(pwd):$PYTHONPATH"
cd auction-management-service
python3 -m app.main
```

**Terminal 2: WebSocket Service (Port 8001)**
```bash
cd backend
export PYTHONPATH="$(pwd)/shared:$(pwd):$PYTHONPATH"
cd websocket-service
python3 app/main.py
```

**Terminal 3: Bid Processing Service (Port 8002)**
```bash
cd backend
export PYTHONPATH="$(pwd)/shared:$(pwd):$PYTHONPATH"
cd bid-processing-service
python3 -m app.main
```

**Terminal 4: Timer Service (Port 8003)**
```bash
cd backend
export PYTHONPATH="$(pwd)/shared:$(pwd):$PYTHONPATH"
cd timer-service
python3 app/main.py
```

### Step 6: Setup Frontend

**Open a NEW terminal window:**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Create environment file
cat > .env << 'EOF'
# Cognito Configuration
VITE_COGNITO_DOMAIN=https://us-east-1uhha2am3q.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=236m0jv1dnmdvddogrquhf0vc9
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/login/callback
VITE_COGNITO_LOGOUT_REDIRECT_URI=http://localhost:5173/login
VITE_COGNITO_REGION=us-east-1

# Backend URLs
VITE_API_BASE_URL=http://localhost:8000
VITE_WEBSOCKET_URL=ws://localhost:8001
EOF
```

### Step 7: Start Frontend

```bash
# Still in frontend directory
npm run dev
```

Wait for: `Local: http://localhost:5173/`

---

## Option 2: Full Setup with Docker Compose 🐳

### Step 1: Start Infrastructure Services

```bash
cd backend

# Start PostgreSQL, Redis, and LocalStack
docker-compose up -d postgres redis localstack

# Wait for services to be healthy (about 30 seconds)
docker-compose ps
```

### Step 2: Create Backend Environment File

```bash
# In backend directory
cat > .env << 'EOF'
# Database (PostgreSQL from Docker)
DATABASE_URL=postgresql://auction_user:auction_pass@localhost:5432/live_auction

# Redis (from Docker)
REDIS_URL=redis://localhost:6379/0

# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_UHhA2Am3q
COGNITO_APP_CLIENT_ID=236m0jv1dnmdvddogrquhf0vc9
COGNITO_REGION=us-east-1
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_UHhA2Am3q

# Application Settings
FLASK_ENV=development
FLASK_DEBUG=True
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# AWS Services (LocalStack for local testing)
AWS_REGION=us-east-1
AWS_ENDPOINT_URL=http://localhost:4566  # LocalStack endpoint
SQS_BID_QUEUE_URL=http://localhost:4566/000000000000/bid-persistence-queue.fifo
SQS_NOTIFICATION_QUEUE_URL=http://localhost:4566/000000000000/notification-queue.fifo
DYNAMODB_BIDS_TABLE=bids_history
EOF
```

### Step 3: Initialize Database

```bash
# Wait for PostgreSQL to be ready, then initialize
docker-compose exec postgres psql -U auction_user -d live_auction -f /docker-entrypoint-initdb.d/init.sql
```

### Step 4: Install Backend Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 5: Start Backend Services

Follow the same steps as **Option 1, Step 5** (4 terminal windows)

### Step 6: Setup and Start Frontend

Follow **Option 1, Steps 6-7**

---

## Verification Steps ✅

### 1. Check Backend Health

```bash
# Test Auction Management Service
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","service":"auction-management"}
```

### 2. Check Frontend

Open browser: **http://localhost:5173**

You should see the login page.

### 3. Test Authentication

1. Click "Login" → Redirects to Cognito
2. Login with your credentials
3. Should redirect back to app

### 4. Test API (After Login)

```bash
# Get your token from browser localStorage or Cognito
# Then test creating an auction:
curl -X POST http://localhost:8000/auctions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Auction",
    "description": "Testing",
    "duration": 3600,
    "category": "Test",
    "starting_bid": 100.00
  }'
```

---

## Troubleshooting 🔧

### Backend Issues

**Problem: "Module not found" errors**
```bash
# Make sure PYTHONPATH is set correctly
export PYTHONPATH="$(pwd)/shared:$(pwd):$PYTHONPATH"

# Verify shared directory exists
ls -la ../shared
```

**Problem: "Cannot connect to database"**
```bash
# For SQLite: Check file exists
ls -la test_live_auction.db

# For PostgreSQL: Check Docker container
docker-compose ps postgres
docker-compose logs postgres
```

**Problem: "Cannot connect to Redis"**
```bash
# Check Redis is running
redis-cli ping

# Or check Docker container
docker-compose ps redis
docker-compose logs redis
```

### Frontend Issues

**Problem: "Cannot find module" errors**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem: "CORS errors"**
- Make sure `CORS_ORIGINS` in backend `.env` includes `http://localhost:5173`
- Restart backend service after changing `.env`

**Problem: "WebSocket connection failed"**
- Make sure WebSocket service is running on port 8001
- Check `VITE_WEBSOCKET_URL` in frontend `.env`

---

## Quick Reference Commands 📝

### Start All Services (Quick)

```bash
# Terminal 1: Backend
cd backend && export PYTHONPATH="$(pwd)/shared:$(pwd):$PYTHONPATH" && cd auction-management-service && python3 -m app.main

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Stop Services

```bash
# Stop backend: Press Ctrl+C in terminal

# Stop Docker services
cd backend
docker-compose down

# Stop Redis (if installed locally)
brew services stop redis  # macOS
# OR
sudo systemctl stop redis  # Linux
```

### View Logs

```bash
# Backend logs: Check terminal output

# Docker logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

---

## Next Steps 🎯

Once everything is running:

1. ✅ Test authentication flow
2. ✅ Create an auction
3. ✅ Test bidding (if all services are running)
4. ✅ Test WebSocket real-time updates
5. ✅ Check database for created records

---

## Port Reference

- **8000**: Auction Management Service
- **8001**: WebSocket Service
- **8002**: Bid Processing Service
- **8003**: Timer Service
- **5173**: Frontend (Vite dev server)
- **5432**: PostgreSQL (Docker)
- **6379**: Redis (Docker/local)
- **4566**: LocalStack (AWS services simulation)

---

Happy coding! 🚀

