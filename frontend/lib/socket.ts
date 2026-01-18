import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export interface SocketEvents {
  // Incoming events
  'user:status': (data: { userId: string; status: string; lastSeen: Date }) => void;
  'users:online': (userIds: string[]) => void;
  'user:typing': (data: { userId: string; sessionId: string; isTyping: boolean }) => void;
  'message:new': (data: any) => void;
  'message:delivered': (data: any) => void;
  'message:read': (data: any) => void;
  'session:updated': (data: any) => void;
  'error': (data: { message: string }) => void;
}

export const initSocket = (): Socket => {
  if (socket?.connected) return socket;

  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event helpers
export const socketEmit = {
  sendMessage: (sessionId: string, content: string, type = 'TEXT') => {
    socket?.emit('message:send', { sessionId, content, type });
  },

  markAsRead: (messageId: string) => {
    socket?.emit('message:read', { messageId });
  },

  startTyping: (sessionId: string) => {
    socket?.emit('typing:start', { sessionId });
  },

  stopTyping: (sessionId: string) => {
    socket?.emit('typing:stop', { sessionId });
  },

  joinSession: (sessionId: string) => {
    socket?.emit('session:join', { sessionId });
  },

  leaveSession: (sessionId: string) => {
    socket?.emit('session:leave', { sessionId });
  },

  updateStatus: (status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY') => {
    socket?.emit('status:update', { status });
  },
};

export const socketOn = <K extends keyof SocketEvents>(
  event: K,
  callback: SocketEvents[K]
) => {
  socket?.on(event, callback as any);
};

export const socketOff = <K extends keyof SocketEvents>(
  event: K,
  callback?: SocketEvents[K]
) => {
  if (callback) {
    socket?.off(event, callback as any);
  } else {
    socket?.off(event);
  }
};
