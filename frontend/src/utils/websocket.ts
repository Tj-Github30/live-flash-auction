/**
 * WebSocket utility for connecting to Flask-SocketIO server
 */
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Create a Socket.IO connection
 * Flask-SocketIO uses /socket.io as the default path
 */
export function createSocketConnection(token: string): Socket {
  return io(API_BASE_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
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
  return API_BASE_URL;
}

