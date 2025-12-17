/**
 * WebSocket utility for connecting to Flask-SocketIO server
 */
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const WS_BASE_URL = import.meta.env.VITE_WEBSOCKET_URL || API_BASE_URL;

/**
 * Create a Socket.IO connection
 * Flask-SocketIO uses /socket.io as the default path
 */
export function createSocketConnection(token: string): Socket {
  return io(WS_BASE_URL, {
    path: '/socket.io',
    // IMPORTANT (EKS + ALB + multiple websocket pods):
    // Polling requires sticky sessions; without it you can get "Invalid session" (400) when
    // GET/POST hit different pods. WebSocket-only avoids that entire class of issues.
    transports: ['websocket'],
    upgrade: false,
    autoConnect: false,
    query: {
      token: token
    }
  });
}

/**
 * Get Socket.IO connection URL
 */
export function getSocketIOUrl(): string {
  return WS_BASE_URL;
}

