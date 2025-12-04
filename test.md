In addition to the frontend and the auth implementation that we had done
we have covered these services in the holidays

service - Auction Management service
Created Flask app structure and configuration
Implemented auction creation endpoint (POST /auctions)
Implemented AWS IVS integration (create channel)
Initialized auction state in Redis (hash, timer, active flag)
Created auction schemas and validation models
Added PostgreSQL integration with SQLAlchemy

service - WebSocket service
Created Flask-SocketIO app structure
Implemented WebSocket connection handler
Implemented AWS Cognito JWT token validation middleware
Implemented auction room join logic (subscribe to Redis channels)
Store connection mapping in Redis
Send current auction state to new joiners
Update participant count in Redis
Implemented auction room leave logic
Implemented chat message handling
Publish chat to Redis pub/sub basically broadcast to room
Subscribe to Redis pub/sub for bid events
Subscribe to Redis pub/sub for timer updates
Implement personalized broadcast logic (you_are_winning or you_were_outbid)

Apart from that we have also created our postgres and dynamodb tables which are users, auctions and bid_history and created redis data structure

We are currently working on the Bidding service and the timer sync service
bidding service basically validates bids, applies anti snipe rules, updates redis state and timer sync service is for timer thing