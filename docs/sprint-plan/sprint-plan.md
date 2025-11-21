# Live Flash Auction – Sprint Plan (3 Weeks)

## Week 1 – Foundations

### Backend
- Setup Flask app
- Setup Socket.IO
- Add basic routes (/health, /)
- Setup Redis client
- Add project structure (api, sockets, services)

### Frontend
- Create Vite + React project
- Create HomePage + LoginPage
- Setup health check
- Add folder structure

### Team Tasks
- Create feature branches
- Finalize architecture
- Add .env.example
- Assign responsibilities

---

## Week 2 – Core Feature Development

### Authentication (Feature A)
- Google SSO + Cognito Hosted UI
- JWT → frontend & backend validation
- Token refresh
- User profile collection (username + phone)

### Auction Creation (Feature B)
- Create auction form
- Backend route to create auction
- DynamoDB/RDS write
- Redis initialization
- IVS stream setup
- Redirect host to dashboard

### Real-Time Bidding (Feature C)
- WebSocket connections
- Redis locking (WATCH/MULTI/EXEC)
- Bid validation
- Broadcasting bid updates
- Chat system

### Timer Sync (Feature D)
- Heartbeat mechanism
- Drift correction logic
- Anti-sniping (+30 seconds)

---

## Week 3 – Integration, Testing, Deployment

### Integration
- Combine auth + auction pages + bidding UI
- Full end-to-end test:
  - Host creates auction  
  - Participants join  
  - Users bid  
  - Timer sync works  
  - Auction ends  

### Testing
- WebSocket load testing
- Redis state verification
- Timer correctness under drift
- IVS stream playback testing

### Deployment (Optional)
- Backend → Elastic Beanstalk or EC2
- Frontend → S3 + CloudFront
- Redis → ElastiCache
- DB → DynamoDB / RDS

### Final Deliverables
- Demo video
- GitHub repo
- Architecture diagram
- API spec
