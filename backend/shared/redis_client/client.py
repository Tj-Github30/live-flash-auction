"""
Redis client configuration and connection pool
"""
import redis
from redis.connection import ConnectionPool
from typing import Optional
import json
from shared.config.settings import settings


class RedisClient:
    """Redis client wrapper with connection pooling"""

    _pool: Optional[ConnectionPool] = None
    _client: Optional[redis.Redis] = None

    @classmethod
    def get_pool(cls) -> ConnectionPool:
        """Get or create Redis connection pool with timeouts and health checks"""
        if cls._pool is None:
            cls._pool = ConnectionPool.from_url(
                settings.REDIS_URL,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                decode_responses=True,
                socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                socket_connect_timeout=settings.REDIS_SOCKET_CONNECT_TIMEOUT,
                socket_keepalive=settings.REDIS_SOCKET_KEEPALIVE,
                health_check_interval=settings.REDIS_HEALTH_CHECK_INTERVAL,
                retry_on_timeout=settings.REDIS_RETRY_ON_TIMEOUT
            )
        return cls._pool

    @classmethod
    def get_client(cls) -> redis.Redis:
        """Get Redis client from pool"""
        if cls._client is None:
            cls._client = redis.Redis(connection_pool=cls.get_pool())
        return cls._client

    @classmethod
    def get_pubsub_client(cls, socket_timeout: int = None) -> redis.Redis:
        """
        Get a dedicated Redis client for pub/sub operations
        """
        timeout = socket_timeout or settings.REDIS_SOCKET_TIMEOUT

        return redis.Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_timeout=timeout,
            socket_connect_timeout=settings.REDIS_SOCKET_CONNECT_TIMEOUT,
            socket_keepalive=settings.REDIS_SOCKET_KEEPALIVE,
            health_check_interval=settings.REDIS_HEALTH_CHECK_INTERVAL,
            retry_on_timeout=settings.REDIS_RETRY_ON_TIMEOUT
        )

    @classmethod
    def ping_redis(cls) -> bool:
        """
        Test Redis connectivity
        """
        try:
            client = cls.get_client()
            return client.ping()
        except Exception:
            return False

    @classmethod
    def close(cls):
        """Close Redis connection pool"""
        if cls._pool:
            cls._pool.disconnect()
            cls._pool = None
            cls._client = None


class RedisKeys:
    """Helper class for Redis key generation"""

    @staticmethod
    def auction_state(auction_id: str) -> str:
        """Key for auction state hash"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:state"

    @staticmethod
    def auction_end_time(auction_id: str) -> str:
        """Key for auction end time"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:end_time"

    @staticmethod
    def auction_active(auction_id: str) -> str:
        """Key for auction active flag"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:active"

    @staticmethod
    def top_bids(auction_id: str) -> str:
        """Key for top bids sorted set"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:top_bids"

    @staticmethod
    def auction_users(auction_id: str) -> str:
        """Key for connected users set"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:users"

    # --- ADDED: Chat History Key ---
    @staticmethod
    def chat_history(auction_id: str) -> str:
        """Key for chat history list"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:chat_history"

    @staticmethod
    def connection(connection_id: str) -> str:
        """Key for connection metadata"""
        return f"{settings.REDIS_CONNECTION_PREFIX}:{connection_id}"

    @staticmethod
    def auction_connections(auction_id: str) -> str:
        """Key for auction connections mapping"""
        return f"connections:{settings.REDIS_AUCTION_PREFIX}:{auction_id}"

    @staticmethod
    def channel_events(auction_id: str) -> str:
        """Pub/sub channel for auction events"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:events"

    @staticmethod
    def channel_timer(auction_id: str) -> str:
        """Pub/sub channel for timer updates"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:timer"

    @staticmethod
    def channel_chat(auction_id: str) -> str:
        """Pub/sub channel for chat messages"""
        return f"{settings.REDIS_AUCTION_PREFIX}:{auction_id}:chat"


class RedisHelper:
    """Helper methods for Redis operations"""

    def __init__(self):
        self.client = RedisClient.get_client()

    # --- ADDED: Chat Methods ---
    def save_chat_message(self, auction_id: str, message_data: dict, max_history: int = 100):
        """Save chat message to a Redis list and trim to maintain history limit"""
        key = RedisKeys.chat_history(auction_id)
        self.client.rpush(key, json.dumps(message_data))
        self.client.ltrim(key, -max_history, -1)

    def get_chat_history(self, auction_id: str, limit: int = 50):
        """Retrieves and parses chat history from the Redis List"""
        key = RedisKeys.chat_history(auction_id)
        # Get raw JSON strings from the Redis List
        raw_msgs = self.client.lrange(key, -limit, -1)
        
        messages = []
        for m in raw_msgs:
            try:
                # We must parse the string back into a dictionary for the API
                messages.append(json.loads(m))
            except (json.JSONDecodeError, TypeError):
                continue
        return messages
    # --- YOUR ORIGINAL METHODS (UNCHANGED) ---
    def set_auction_state(self, auction_id: str, state_data: dict) -> bool:
        """Set auction state hash"""
        key = RedisKeys.auction_state(auction_id)
        return self.client.hset(key, mapping=state_data)

    def get_auction_state(self, auction_id: str) -> dict:
        """Get auction state hash"""
        key = RedisKeys.auction_state(auction_id)
        return self.client.hgetall(key)

    def update_auction_field(self, auction_id: str, field: str, value: str) -> int:
        """Update single field in auction state"""
        key = RedisKeys.auction_state(auction_id)
        return self.client.hset(key, field, value)

    def add_top_bid(self, auction_id: str, user_id: str, username: str, amount: float) -> int:
        """Add bid to top bids sorted set and maintain only top 3"""
        key = RedisKeys.top_bids(auction_id)
        member = f"{user_id}:{username}"
        self.client.zadd(key, {member: amount})
        count = self.client.zcard(key)
        if count > 3:
            self.client.zremrangebyrank(key, 0, count - 4)
        return count

    def get_top_bids(self, auction_id: str, limit: int = 3) -> list:
        """Get top N bids from sorted set"""
        key = RedisKeys.top_bids(auction_id)
        try:
            bids = self.client.zrevrange(key, 0, limit - 1, withscores=True)
            result = []
            for member, score in bids:
                user_id, username = member.split(":", 1)
                result.append({"user_id": user_id, "username": username, "amount": score})
            return result
        except Exception:
            return []

    def add_user_to_auction(self, auction_id: str, user_id: str) -> int:
        key = RedisKeys.auction_users(auction_id)
        return self.client.sadd(key, user_id)

    def remove_user_from_auction(self, auction_id: str, user_id: str) -> int:
        key = RedisKeys.auction_users(auction_id)
        return self.client.srem(key, user_id)

    def get_participant_count(self, auction_id: str) -> int:
        key = RedisKeys.auction_users(auction_id)
        return self.client.scard(key)

    def publish_event(self, channel: str, data: dict) -> int:
        return self.client.publish(channel, json.dumps(data))

    def set_with_ttl(self, key: str, value: str, ttl: int) -> bool:
        return self.client.setex(key, ttl, value)


# Lua script for atomic bid comparison
BID_COMPARISON_SCRIPT = """
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
    return 1
else
    return 0
end
"""