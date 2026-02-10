import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // Allow Socket.io to negotiate (polling → WebSocket) instead of forcing WebSocket only.
      // This is more resilient across different dev environments and proxies.
    })
  }
  return socket
}

