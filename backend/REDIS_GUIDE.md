# Redis Data Structures and Usage Guide

Complete guide to Redis keys, data structures, and operations used in the Live Flash Auction platform.

## Overview

Redis serves three critical roles:
1. **Real-time Auction State** - Current bid, participants, status
2. **Pub/Sub Messaging** - Event broadcasting to WebSocket clients
3. **Sorted Sets** - Top 3 bid leaderboards

## Data Structures

### 1. Auction State Hash

**Key Pattern**: `auction:{auction_id}:state`

**Type**: Hash

**Fields**:
```
status                  → "live" | "closed"
current_high_bid        → "5000.00"
high_bidder_id          → "uuid-of-user"
high_bidder_username    → "JohnDoe"
start_time             → "1638360000000" (milliseconds)
end_time               → "1638363600000" (milliseconds)
participant_count       → "45"
anti_snipe_count        → "2"
bid_count              → "127"
last_bid_time          → "1638362950000"
```

**Operations**:
```bash
# Set entire state
HSET auction:123:state status "live" current_high_bid "5000" ...

# Get entire state
HGETALL auction:123:state

# Update single field
HSET auction:123:state participant_count "46"

# Get specific field
HGET auction:123:state current_high_bid

# Increment bid count
HINCRBY auction:123:state bid_count 1
```

**TTL**: Set to expire 1 hour after auction ends

---

### 2. Auction End Time

**Key Pattern**: `auction:{auction_id}:end_time`

**Type**: String (Integer as string)

**Value**: Unix timestamp in milliseconds

**Operations**:
```bash
# Set end time with TTL (auto-expires)
SETEX auction:123:end_time 3600 "1638363600000"

# Get end time
GET auction:123:end_time

# Update for anti-snipe extension
SET auction:123:end_time "1638363630000"
```

**TTL**: Same as auction duration + 1 hour buffer

---

### 3. Active Auction Flag

**Key Pattern**: `auction:{auction_id}:active`

**Type**: String

**Value**: "true"

**Purpose**: Auto-expires when auction ends (acts as a quick check)

**Operations**:
```bash
# Set with TTL matching auction duration
SETEX auction:123:active 3600 "true"

# Check if active
EXISTS auction:123:active
```

**TTL**: Auction duration (auto-expires at end)

---

### 4. Top Bids Leaderboard

**Key Pattern**: `auction:{auction_id}:top_bids`

**Type**: Sorted Set

**Members**: `user_id:username` (e.g., "uuid-123:JohnDoe")

**Scores**: Bid amounts (e.g., 5000.00)

**Operations**:
```bash
# Add bid (automatically sorted by score)
ZADD auction:123:top_bids 5000 "uuid-123:JohnDoe"

# Keep only top 3
ZREMRANGEBYRANK auction:123:top_bids 0 -4

# Get top 3 (highest to lowest)
ZREVRANGE auction:123:top_bids 0 2 WITHSCORES

# Count total bids
ZCARD auction:123:top_bids

# Get user's rank
ZREVRANK auction:123:top_bids "uuid-123:JohnDoe"
```

**Example Output**:
```
1) "uuid-456:Alice"
2) "5500"
3) "uuid-123:JohnDoe"
4) "5000"
5) "uuid-789:Bob"
6) "4500"
```

---

### 5. Connected Users Set

**Key Pattern**: `auction:{auction_id}:users`

**Type**: Set

**Members**: User IDs (UUIDs)

**Operations**:
```bash
# Add user to auction
SADD auction:123:users "uuid-123"

# Remove user
SREM auction:123:users "uuid-123"

# Get participant count
SCARD auction:123:users

# Check if user is in auction
SISMEMBER auction:123:users "uuid-123"

# Get all users
SMEMBERS auction:123:users
```

---

### 6. Connection Metadata

**Key Pattern**: `connection:{connection_id}`

**Type**: Hash

**Fields**:
```
user_id         → "uuid-123"
auction_id      → "uuid-456"
username        → "JohnDoe"
connected_at    → "1638360000000"
```

**Operations**:
```bash
# Store connection info
HSET connection:socket-abc user_id "uuid-123" auction_id "uuid-456" username "JohnDoe"

# Set TTL (auto-cleanup)
EXPIRE connection:socket-abc 3600

# Get connection info
HGETALL connection:socket-abc

# Delete on disconnect
DEL connection:socket-abc
```

**TTL**: 1 hour (auto-cleanup for abandoned connections)

---

### 7. Auction Connections Mapping

**Key Pattern**: `connections:auction:{auction_id}`

**Type**: Hash

**Fields**: `user_id → connection_id`

**Purpose**: Map users to their WebSocket connection IDs for personalized messaging

**Operations**:
```bash
# Map user to connection
HSET connections:auction:123 uuid-456 socket-abc

# Get user's connection
HGET connections:auction:123 uuid-456

# Remove mapping
HDEL connections:auction:123 uuid-456

# Get all connections for auction
HGETALL connections:auction:123
```

---

## Pub/Sub Channels

### 1. Auction Events Channel

**Pattern**: `auction:{auction_id}:events`

**Message Types**:

#### Bid Event
```json
{
  "type": "bid",
  "auction_id": "uuid-123",
  "user_id": "uuid-456",
  "username": "JohnDoe",
  "amount": 5000.00,
  "timestamp": 1638360000000,
  "is_new_high": true,
  "anti_snipe_triggered": false
}
```

#### Auction End Event
```json
{
  "type": "auction_end",
  "auction_id": "uuid-123",
  "winner_id": "uuid-456",
  "winner_username": "JohnDoe",
  "winning_bid": 5000.00,
  "end_time": 1638363600000
}
```

**Subscribe**:
```bash
SUBSCRIBE auction:123:events
```

**Publish**:
```bash
PUBLISH auction:123:events '{"type":"bid","user_id":"uuid-456",...}'
```

---

### 2. Timer Updates Channel

**Pattern**: `auction:{auction_id}:timer`

**Message Types**:

#### Heartbeat Timer Sync
```json
{
  "type": "timer_sync",
  "auction_id": "uuid-123",
  "server_time": 1638360000000,
  "auction_end_time": 1638363600000,
  "time_remaining_ms": 3600000,
  "time_remaining_seconds": 3600,
  "sync_type": "heartbeat"
}
```

#### Anti-Snipe Extension
```json
{
  "type": "anti_snipe",
  "auction_id": "uuid-123",
  "new_end_time": 1638363630000,
  "extended_by": 30000,
  "extension_count": 2,
  "max_extensions": 5,
  "reason": "Last-minute bid received"
}
```

#### Final Timer (Auction End)
```json
{
  "type": "timer_sync",
  "auction_id": "uuid-123",
  "time_remaining_ms": 0,
  "time_remaining_seconds": 0,
  "sync_type": "final",
  "auction_ended": true
}
```

---

### 3. Chat Channel

**Pattern**: `auction:{auction_id}:chat`

**Message Format**:
```json
{
  "type": "chat",
  "auction_id": "uuid-123",
  "user_id": "uuid-456",
  "username": "JohnDoe",
  "message": "Hello!",
  "timestamp": 1638360000000
}
```

**Subscribe**:
```bash
SUBSCRIBE auction:123:chat
```

**Pattern Subscribe** (all auctions):
```bash
PSUBSCRIBE auction:*:chat
```

---

## Lua Scripts

### Atomic Bid Comparison Script

Used for atomic bid validation and state update.

```lua
local auction_key = KEYS[1]
local bid_amount = tonumber(ARGV[1])
local user_id = ARGV[2]
local username = ARGV[3]
local timestamp = ARGV[4]

local current_high = tonumber(redis.call('HGET', auction_key, 'current_high_bid') or '0')

if bid_amount > current_high then
    redis.call('HSET', auction_key,
        'current_high_bid', tostring(bid_amount),
        'high_bidder_id', user_id,
        'high_bidder_username', username,
        'last_bid_time', timestamp
    )
    redis.call('HINCRBY', auction_key, 'bid_count', 1)
    return 1  -- Success
else
    return 0  -- Outbid
end
```

**Usage in Python**:
```python
# Register script
script = redis_client.register_script(BID_COMPARISON_SCRIPT)

# Execute
result = script(
    keys=[f'auction:{auction_id}:state'],
    args=[amount, user_id, username, timestamp]
)

is_new_high = bool(result)
```

---

## Common Operations

### Initialize New Auction

```python
def initialize_auction(auction_id, starting_bid, duration):
    start_time = int(time.time() * 1000)
    end_time = start_time + (duration * 1000)

    # Set state hash
    redis.hset(f'auction:{auction_id}:state', mapping={
        'status': 'live',
        'current_high_bid': str(starting_bid),
        'high_bidder_id': '',
        'high_bidder_username': '',
        'start_time': str(start_time),
        'end_time': str(end_time),
        'participant_count': '0',
        'anti_snipe_count': '0',
        'bid_count': '0'
    })

    # Set end time with TTL
    redis.setex(f'auction:{auction_id}:end_time', duration + 3600, str(end_time))

    # Set active flag
    redis.setex(f'auction:{auction_id}:active', duration, 'true')
```

### Get Complete Auction State

```python
def get_auction_state(auction_id):
    # Get state hash
    state = redis.hgetall(f'auction:{auction_id}:state')

    # Get end time
    end_time = int(redis.get(f'auction:{auction_id}:end_time') or 0)

    # Get top bids
    top_bids = redis.zrevrange(f'auction:{auction_id}:top_bids', 0, 2, withscores=True)

    return {
        'status': state.get('status'),
        'current_high_bid': float(state.get('current_high_bid', 0)),
        'high_bidder': state.get('high_bidder_username'),
        'participant_count': int(state.get('participant_count', 0)),
        'time_remaining': calculate_time_remaining(end_time),
        'top_bids': parse_top_bids(top_bids)
    }
```

### Cleanup After Auction End

```python
def cleanup_auction(auction_id):
    # Update status
    redis.hset(f'auction:{auction_id}:state', 'status', 'closed')

    # Don't delete keys immediately - set TTL for post-auction queries
    ttl = 3600  # 1 hour
    redis.expire(f'auction:{auction_id}:state', ttl)
    redis.expire(f'auction:{auction_id}:top_bids', ttl)
    redis.expire(f'auction:{auction_id}:users', ttl)
    redis.expire(f'connections:auction:{auction_id}', ttl)
```

---

## Performance Tips

1. **Use Pipelining** for multiple commands:
   ```python
   pipe = redis.pipeline()
   pipe.hset(key1, field, value)
   pipe.zadd(key2, {member: score})
   pipe.expire(key1, ttl)
   pipe.execute()
   ```

2. **Use Connection Pooling** (already configured in shared/redis/client.py)

3. **Monitor Key Expiration** with Redis TTL commands

4. **Use Redis MONITOR** in development to debug:
   ```bash
   redis-cli MONITOR
   ```

5. **Set Memory Limits** in Redis config to prevent OOM

---

## Monitoring Commands

```bash
# Check memory usage
INFO memory

# Get number of keys
DBSIZE

# Find keys by pattern
KEYS auction:*:state

# Check TTL
TTL auction:123:end_time

# Monitor real-time commands
MONITOR

# Get slow queries
SLOWLOG GET 10
```

---

## Backup and Persistence

Redis is configured with both RDB and AOF persistence:

- **RDB**: Snapshots every 5 minutes if data changed
- **AOF**: Append-only file for durability

For production, use Redis managed service (ElastiCache) with automatic backups.
