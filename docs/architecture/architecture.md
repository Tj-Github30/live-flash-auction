# Live Flash Auction – System Architecture

## Overview
The Live Flash Auction platform is a cloud-native, real-time auction application that enables hosts to livestream auctions and participants to place instant bids with minimal latency. The system leverages AWS services for scalability, Cognito for authentication, IVS for streaming, Redis for real-time state, and Flask + React for backend/frontend layers.

---

## High-Level Architecture Diagram
```
Frontend (Vite + React)
        ↓   REST / WebSockets
Backend API (Flask)
        ↓
Redis (ElastiCache) — bid state, locks, pub/sub
        ↓
DynamoDB / RDS — persistent auction + user data

AWS Cognito — Authentication (Google SSO)
AWS IVS — Live streaming for hosts/bidders
AWS S3 — Media asset storage
AWS CloudWatch — Logging/Monitoring
```
---

## Major Components

### 1. **Frontend Application (React + Vite)**
- Displays live stream (IVS Player)
- Real-time bid updates via WebSockets
- Auction pages, chat, and timer countdown
- Auth (Cognito Hosted UI + redirect)
- Calls backend APIs for creating/joining auctions

### 2. **Backend (Flask + Socket.IO)**
- REST endpoints (auction creation, user profile, etc.)
- WebSocket namespaces for:
  - bidding
  - chat
  - timer sync
- Integrates with Redis for pub/sub and bid-state locking

### 3. **Redis (ElastiCache)**
Used for high-speed auction operations:
- current bid
- bid history
- participant list
- distributed lock
- end timestamp for timer sync
- pub/sub broadcasts → WebSocket servers

### 4. **Database Layer**
Two options:
- **DynamoDB** for real-time, flexible NoSQL access  
- **RDS (PostgreSQL)** for relational/transactional data

Stores:
- auctions
- users
- winners
- bid logs (optional)

### 5. **AWS Cognito**
- Google SSO federation
- Hosted UI for login
- Issues JWT tokens used by backend

### 6. **AWS IVS**
- Host livestream ingestion
- Playback URL for participants
- Ultra-low-latency video

### 7. **Timer Sync Service**
- Sends heartbeats every 5–10 seconds
- Drift correction
- Anti-sniping (+30 seconds)

### 8. **Auction End Service**
- Closes auction
- Declares winner
- Writes results
- Cleans Redis

---

## Data Flow Summary

### Auction Creation
1. Host submits auction form
2. Backend validates & creates auction entry
3. IVS channel assigned
4. Redis keys initialized
5. Auction goes live

### Joining Auction
1. User authenticates (Cognito)
2. User joins via WebSocket
3. Redis updates participant list
4. Client receives:
   - playback URL
   - current bid
   - timer state

### Bidding
1. Client → WebSocket: `{type: 'BID', amount: X}`
2. Redis `WATCH/MULTI/EXEC` lock
3. State updated atomically
4. Redis Pub/Sub broadcasts update
5. All clients receive new highest bid

### Timer Sync
- TimerSync service broadcasts time heartbeat
- Clients correct drift
- Anti-snipe extends end timestamp

### Auction End
- Winner selected
- Results stored in DB
- Redis keys deleted
- Stream ended (IVS)

---

## AWS Services Summary

- **Cognito** → Authentication
- **IVS** → Stream ingestion + playback
- **S3** → Product images, static content
- **Redis (ElastiCache)** → State, locks, real-time data
- **DynamoDB / RDS** → Auction + user persistence
- **CloudWatch** → Metrics + logs
- **IAM** → Least-privilege access control
