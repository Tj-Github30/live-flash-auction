# Live Flash Auction – API Specification

All backend APIs follow REST JSON format.

Base URL (local):

http://localhost:8000


## Auth APIs

`GET /auth/login`
Redirects to Cognito Hosted UI.

`GET /auth/callback`
Handles Google SSO callback → Issues JWT.

`GET /auth/me`
Returns current user profile.

---

## Auction APIs

`POST /auction/create`
Create a new auction.

### Request:
```json
{
  "title": "Sneaker Drop",
  "starting_bid": 100,
  "timer_duration": 120,
  "image_url": "s3://bucket/image.jpg"
}

Response:
{
  "auction_id": "a123",
  "ivs_stream_key": "...",
  "ivs_playback_url": "https://ivs.com/play/123"
}
```
`GET /auction/live`
Returns all currently live auctions.

`GET /auction/:auction_id`
Fetch auction details.

---
## WebSocket Endpoints

- Namespace: /ws/auction/<auction_id>
- Client → Server (Bid)
```
{
  "type": "BID",
  "amount": 500
}
```

- Server → Client (Bid Update)
```
{
  "type": "BID_UPDATE",
  "amount": 500,
  "bidder": "User123"
}
```

- Timer Heartbeat
```
{
  "type": "TIMER",
  "server_time": 170000000,
  "end_ts": 170000120
}
```

## Timer Sync APIs

`POST /auction/:id/extend`
(Used for anti-sniping)
```
{ "extra_seconds": 30 }
```

## Winner APIs

`POST /auction/:id/close`
Closes auction manually.

#### Response:

```
{
  "winner": {
    "user_id": "u123",
    "amount": 900
  }
}

```

---

