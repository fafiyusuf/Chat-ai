# Frontend Integration Guide

This guide shows how to integrate the backend with your Next.js frontend.

## Installation

```bash
cd .. # Go back to root
npm install socket.io-client axios
# or
pnpm add socket.io-client axios
```

## Configuration

Create `lib/config.ts`:

```typescript
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
};
```

Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## API Client

Create `lib/api.ts`:

```typescript
import axios from 'axios';
import { config } from './config';

const api = axios.create({
  baseURL: `${config.apiUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${config.apiUrl}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## Authentication Service

Create `lib/auth.ts`:

```typescript
import api from './api';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(data: {
    email: string;
    password: string;
    displayName?: string;
    username?: string;
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    this.setTokens(response.data);
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    this.setTokens(response.data);
    return response.data;
  },

  async loginWithGoogle(token: string): Promise<AuthResponse> {
    const response = await api.post('/auth/google', { token });
    this.setTokens(response.data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      this.clearTokens();
    }
  },

  setTokens(data: AuthResponse) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  },

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },
};
```

## WebSocket Hook

Create `hooks/useSocket.ts`:

```typescript
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '@/lib/config';
import { authService } from '@/lib/auth';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = authService.getAccessToken();

    if (!token) return;

    const socket = io(config.wsUrl, {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('✓ Connected to WebSocket');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from WebSocket');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, isConnected };
};
```

## Chat Service

Create `lib/chat.ts`:

```typescript
import api from './api';

export interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  senderId: string;
  receiverId?: string;
  sessionId: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export interface ChatSession {
  id: string;
  users: Array<{
    user: {
      id: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
      status: string;
    };
  }>;
  messages: Message[];
}

export const chatService = {
  async getSessions(): Promise<ChatSession[]> {
    const response = await api.get('/chat/sessions');
    return response.data;
  },

  async createSession(participantId: string): Promise<ChatSession> {
    const response = await api.post('/chat/sessions', { participantId });
    return response.data;
  },

  async getMessages(sessionId: string, limit = 50): Promise<Message[]> {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`, {
      params: { limit },
    });
    return response.data;
  },

  async sendMessage(
    sessionId: string,
    content: string,
    type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
  ): Promise<Message> {
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, {
      content,
      type,
    });
    return response.data;
  },

  async markAsRead(messageId: string): Promise<void> {
    await api.patch(`/chat/messages/${messageId}/read`);
  },
};
```

## User Service

Create `lib/users.ts`:

```typescript
import api from './api';
import { User } from './auth';

export const userService = {
  async getAll(params?: {
    status?: 'ONLINE' | 'OFFLINE' | 'AWAY';
    search?: string;
  }): Promise<User[]> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async updateProfile(data: {
    displayName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  async updateStatus(
    status: 'ONLINE' | 'OFFLINE' | 'AWAY'
  ): Promise<{ status: string }> {
    const response = await api.patch('/users/status', { status });
    return response.data;
  },
};
```

## Chat Component Example

Create `components/chat-room.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { chatService, Message } from '@/lib/chat';
import { authService } from '@/lib/auth';

interface ChatRoomProps {
  sessionId: string;
}

export function ChatRoom({ sessionId }: ChatRoomProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Load current user
    authService.getProfile().then(setCurrentUser);

    // Load messages
    chatService.getMessages(sessionId).then(setMessages);

    if (!socket) return;

    // Join session
    socket.emit('session:join', { sessionId });

    // Listen for new messages
    socket.on('message:new', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('session:leave', { sessionId });
      socket.off('message:new');
    };
  }, [sessionId, socket]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('message:send', {
      sessionId,
      content: newMessage,
      type: 'TEXT',
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      <div className="p-2 text-sm">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs rounded-lg p-3 ${
                msg.senderId === currentUser?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

## User List Component

Create `components/user-list.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/lib/users';
import { useSocket } from '@/hooks/useSocket';
import { User } from '@/lib/auth';

export function UserList({ onSelectUser }: { onSelectUser: (user: User) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    // Load users
    userService.getAll().then(setUsers);

    if (!socket) return;

    // Listen for status updates
    socket.on('user:status', ({ userId, status }) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status } : user
        )
      );
    });

    return () => {
      socket.off('user:status');
    };
  }, [socket]);

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Users</h2>
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
        >
          <div className="relative">
            <img
              src={user.avatarUrl || '/default-avatar.png'}
              alt={user.displayName}
              className="w-12 h-12 rounded-full"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                user.status === 'ONLINE'
                  ? 'bg-green-500'
                  : user.status === 'AWAY'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">{user.displayName || user.email}</p>
            <p className="text-sm text-gray-500">{user.status}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
```

## Auth Context Provider

Create `contexts/auth-context.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = authService.getAccessToken();
    if (token) {
      authService
        .getProfile()
        .then(setUser)
        .catch(() => authService.clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Usage in Layout

Update `app/layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Protected Route Example

Create `components/protected-route.tsx`:

```typescript
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

## Complete Chat Page Example

Create `app/chat/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { UserList } from '@/components/user-list';
import { ChatRoom } from '@/components/chat-room';
import { chatService } from '@/lib/chat';
import { User } from '@/lib/auth';

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    const session = await chatService.createSession(user.id);
    setSessionId(session.id);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        {/* User list sidebar */}
        <div className="w-80 border-r overflow-y-auto p-4">
          <UserList onSelectUser={handleSelectUser} />
        </div>

        {/* Chat area */}
        <div className="flex-1">
          {sessionId ? (
            <ChatRoom sessionId={sessionId} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## Next Steps

1. Customize UI components to match your Figma design
2. Add typing indicators
3. Add message read receipts
4. Implement file uploads
5. Add group chats
6. Integrate AI chat feature

## Troubleshooting

### WebSocket not connecting
- Check NEXT_PUBLIC_WS_URL in .env.local
- Verify backend is running
- Check browser console for errors

### 401 errors
- Token might be expired
- Check localStorage has accessToken
- Auth context should handle refresh

### CORS errors
- Backend FRONTEND_URL must match your frontend URL
- Check CORS middleware in backend
