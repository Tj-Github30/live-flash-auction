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
        # In-memory connection tracking
        self.connections = {}  # {connection_id: {user_id, auction_id, username}}

    def on_connect(self, connection_id: str, args: dict):
        """
        Handle new WebSocket connection

        Args:
            connection_id: Socket.IO session ID
            args: Query parameters from connection
        """
        try:
            # Extract and verify token
            token = args.get("token")
            if not token:
                emit("error", {"message": "Missing authentication token"})
                return False

            # Verify Cognito token
            claims = cognito_auth.verify_token(token)
            if not claims:
                emit("error", {"message": "Invalid or expired token"})
                return False

            user_info = cognito_auth.extract_user_info(claims)

            # Store connection info in memory
            self.connections[connection_id] = {
                "user_id": user_info["user_id"],
                "username": user_info["username"],
                "connected_at": get_current_timestamp_ms()
            }

            logger.info(f"Connection authenticated: {connection_id} - User: {user_info['username']}")

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
            conn_info = self.connections.get(connection_id)
            if not conn_info:
                return

            auction_id = conn_info.get("auction_id")
            user_id = conn_info["user_id"]

            # If user was in an auction, clean up
            if auction_id:
                # Remove from Redis sets
                self.redis_helper.remove_user_from_auction(auction_id, user_id)

                # Delete connection mapping
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

            # Remove from memory
            del self.connections[connection_id]

            logger.info(f"Connection cleaned up: {connection_id}")

        except Exception as e:
            logger.error(f"Disconnect error: {e}", exc_info=True)

    def on_join_auction(self, connection_id: str, data: dict):
        """
        Handle user joining an auction room

        Args:
            connection_id: Socket.IO session ID
            data: {auction_id: str}
        """
        try:
            conn_info = self.connections.get(connection_id)
            if not conn_info:
                emit("error", {"message": "Not authenticated"})
                return

            auction_id = data.get("auction_id")
            if not auction_id:
                emit("error", {"message": "Missing auction_id"})
                return

            user_id = conn_info["user_id"]
            username = conn_info["username"]

            # Check if auction exists and is active
            auction_state = self.redis_helper.get_auction_state(auction_id)
            if not auction_state:
                emit("error", {"message": "Auction not found or not active"})
                return

            # Join Socket.IO room
            join_room(auction_id)

            # Add user to Redis sets
            self.redis_helper.add_user_to_auction(auction_id, user_id)

            # Store connection mapping
            conn_key = RedisKeys.auction_connections(auction_id)
            self.redis_helper.client.hset(conn_key, user_id, connection_id)

            # Update connection info
            conn_info["auction_id"] = auction_id
            self.connections[connection_id] = conn_info

            # Update participant count
            count = self.redis_helper.get_participant_count(auction_id)
            self.redis_helper.update_auction_field(auction_id, "participant_count", str(count))

            # Get current auction state
            state = self._get_auction_state_for_user(auction_id, user_id)

            # Send current state to joining user
            emit("joined_auction", state)

            # Broadcast user joined to room
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
            conn_info = self.connections.get(connection_id)
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

            # Update connection info
            conn_info.pop("auction_id", None)
            self.connections[connection_id] = conn_info

            # Broadcast user left
            self.socketio.emit("user_left", {
                "user_id": user_id,
                "username": username,
                "participant_count": count
            }, room=auction_id)

            emit("left_auction", {"auction_id": auction_id})

            logger.info(f"User {username} left auction {auction_id}")

        except Exception as e:
            logger.error(f"Leave auction error: {e}", exc_info=True)

    def _get_auction_state_for_user(self, auction_id: str, user_id: str) -> dict:
        """Get current auction state with user-specific info"""
        state = self.redis_helper.get_auction_state(auction_id)
        top_bids = self.redis_helper.get_top_bids(auction_id, limit=3)

        # Check if user is winning
        is_winning = state.get("high_bidder_id") == user_id

        from utils.helpers import calculate_time_remaining
        end_time_ms = int(self.redis_helper.client.get(RedisKeys.auction_end_time(auction_id)) or 0)

        return {
            "auction_id": auction_id,
            "status": state.get("status"),
            "current_high_bid": float(state.get("current_high_bid", 0)),
            "high_bidder_username": state.get("high_bidder_username"),
            "participant_count": int(state.get("participant_count", 0)),
            "bid_count": int(state.get("bid_count", 0)),
            "time_remaining": calculate_time_remaining(end_time_ms),
            "top_bids": top_bids,
            "you_are_winning": is_winning
        }
