"""
WebSocket Connection Handler
"""
from flask_socketio import join_room, leave_room, emit
from shared.auth.cognito import cognito_auth
from shared.redis.client import RedisHelper, RedisKeys
from shared.utils.helpers import get_current_timestamp_ms
from shared.utils.logger import setup_logger
import json

logger = setup_logger("connection-handler")

class ConnectionHandler:
    """Handles WebSocket connections and room management"""

    def __init__(self, socketio):
        self.socketio = socketio
        self.redis_helper = RedisHelper()
        # In-memory connection tracking (Local pod memory)
        self.connections = {}  

    def on_connect(self, connection_id: str, args: dict):
        """Handle new WebSocket connection and sync identity to Redis"""
        try:
            token = args.get("token")
            if not token:
                logger.warning(f"Connection rejected (missing token): {connection_id}")
                emit("error", {"message": "Missing authentication token"})
                return False

            claims = cognito_auth.verify_token(token)
            if not claims:
                logger.warning(f"Connection rejected (invalid token): {connection_id}")
                emit("error", {"message": "Invalid or expired token"})
                return False

            user_info = cognito_auth.extract_user_info(claims)

            # 1. Store connection info in LOCAL memory
            conn_data = {
                "user_id": str(user_info["user_id"]),
                "username": str(user_info["username"]),
                "connected_at": str(get_current_timestamp_ms())
            }
            self.connections[connection_id] = conn_data

            # 2. Persist to REDIS for cross-pod identity resolution
            conn_key = RedisKeys.connection(connection_id)
            self.redis_helper.client.hset(conn_key, mapping=conn_data)
            self.redis_helper.client.expire(conn_key, 86400) # 24 hour TTL

            logger.info(f"Connection authenticated & synced to Redis: {connection_id} - User: {user_info['username']}")

            emit("connected", {
                "message": "Connected successfully",
                "user_id": user_info["user_id"],
                "username": user_info["username"]
            })

            return True

        except Exception as e:
            logger.error(f"Connection error: {e}", exc_info=True)
            emit("error", {"message": "Connection failed"})
            return False

    def on_disconnect(self, connection_id: str):
        """Handle WebSocket disconnection and cleanup"""
        try:
            conn_info = self.get_connection(connection_id)
            if not conn_info:
                return

            auction_id = conn_info.get("auction_id")
            user_id = conn_info["user_id"]

            if auction_id:
                # Remove from Redis sets
                self.redis_helper.remove_user_from_auction(auction_id, user_id)
                conn_key = RedisKeys.auction_connections(auction_id)
                self.redis_helper.client.hdel(conn_key, user_id)
                
                # Update participant count
                count = self.redis_helper.get_participant_count(auction_id)
                self.redis_helper.update_auction_field(auction_id, "participant_count", str(count))

                # Broadcast user left
                self.socketio.emit("user_left", {
                    "user_id": user_id,
                    "username": conn_info["username"],
                    "participant_count": count
                }, room=auction_id)

            # Cleanup LOCAL and REDIS identity
            if connection_id in self.connections:
                del self.connections[connection_id]
            
            self.redis_helper.client.delete(RedisKeys.connection(connection_id))

            logger.info(f"Connection cleaned up: {connection_id}")

        except Exception as e:
            logger.error(f"Disconnect error: {e}", exc_info=True)

    def on_join_auction(self, connection_id: str, data: dict):
        """Handle user joining an auction room"""
        try:
            conn_info = self.get_connection(connection_id)
            if not conn_info:
                emit("error", {"message": "Not authenticated"})
                return

            auction_id = data.get("auction_id")
            if not auction_id:
                emit("error", {"message": "Missing auction_id"})
                return

            user_id = conn_info["user_id"]
            username = conn_info["username"]

            # Join Socket.IO room
            join_room(auction_id)

            # Add user to Redis sets
            self.redis_helper.add_user_to_auction(auction_id, user_id)

            # Store connection mapping in Redis
            conn_key = RedisKeys.auction_connections(auction_id)
            self.redis_helper.client.hset(conn_key, user_id, connection_id)

            # Update connection info (local and Redis)
            conn_info["auction_id"] = auction_id
            self.connections[connection_id] = conn_info
            self.redis_helper.client.hset(RedisKeys.connection(connection_id), "auction_id", auction_id)

            # Update participant count
            count = self.redis_helper.get_participant_count(auction_id)
            self.redis_helper.update_auction_field(auction_id, "participant_count", str(count))

            # Get current auction state and return to user
            state = self._get_auction_state_for_user(auction_id, user_id)
            emit("joined_auction", state)

            # Broadcast join to others
            self.socketio.emit("user_joined", {
                "user_id": user_id,
                "username": username,
                "participant_count": count
            }, room=auction_id, skip_sid=connection_id)

            logger.info(f"User {username} joined auction {auction_id}")

        except Exception as e:
            logger.error(f"Join auction error: {e}", exc_info=True)
            emit("error", {"message": "Failed to join auction"})

    def on_leave_auction(self, connection_id: str, data: dict):
        """Handle user leaving an auction room"""
        try:
            conn_info = self.get_connection(connection_id)
            if not conn_info:
                return

            auction_id = data.get("auction_id") or conn_info.get("auction_id")
            if not auction_id:
                return

            user_id = conn_info["user_id"]
            username = conn_info["username"]

            # Leave Socket.IO room
            leave_room(auction_id)

            # Remove from Redis
            self.redis_helper.remove_user_from_auction(auction_id, user_id)
            conn_key = RedisKeys.auction_connections(auction_id)
            self.redis_helper.client.hdel(conn_key, user_id)

            # Update participant count
            count = self.redis_helper.get_participant_count(auction_id)
            self.redis_helper.update_auction_field(auction_id, "participant_count", str(count))

            # Clean up connection info (remove auction_id reference)
            conn_info.pop("auction_id", None)
            self.connections[connection_id] = conn_info
            self.redis_helper.client.hdel(RedisKeys.connection(connection_id), "auction_id")

            emit("left_auction", {"auction_id": auction_id})
            logger.info(f"User {username} left auction {auction_id}")

        except Exception as e:
            logger.error(f"Leave auction error: {e}", exc_info=True)

    def _get_auction_state_for_user(self, auction_id: str, user_id: str) -> dict:
        """Get current auction state AND chat history from Redis"""
        state = self.redis_helper.get_auction_state(auction_id)
        top_bids = self.redis_helper.get_top_bids(auction_id, limit=3)
        
        # --- NEW: Fetch chat history so it appears on reload ---
        try:
            # Get the last 50 messages from Redis
            chat_history = self.redis_helper.get_chat_history(auction_id, limit=50)
        except Exception as e:
            logger.warning(f"Failed to fetch chat history: {e}")
            chat_history = []

        is_winning = state.get("high_bidder_id") == user_id

        return {
            "auction_id": auction_id,
            "status": state.get("status"),
            "current_high_bid": float(state.get("current_high_bid", 0)),
            "high_bidder_id": state.get("high_bidder_id"),
            "high_bidder_username": state.get("high_bidder_username"),
            "participant_count": int(state.get("participant_count", 0)),
            "bid_count": int(state.get("bid_count", 0)),
            "top_bids": top_bids,
            "you_are_winning": is_winning,
            "chat_messages": chat_history  # This is the key the frontend needs!
        }
    def get_connection(self, connection_id: str):
        """Retrieves connection metadata checking local memory then Redis"""
        try:
            # 1. Try local memory
            if connection_id in self.connections:
                return self.connections[connection_id]

            # 2. Try Redis
            key = RedisKeys.connection(connection_id)
            data = self.redis_helper.client.hgetall(key)
            
            if data:
                # Update local cache
                self.connections[connection_id] = data
                return data
                
            logger.warning(f"No connection data found in Redis or Memory for {connection_id}")
            return None
        except Exception as e:
            logger.error(f"Error fetching connection {connection_id}: {e}")
            return None