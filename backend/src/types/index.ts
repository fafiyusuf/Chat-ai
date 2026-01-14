export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
  lastSeen: Date;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  name?: string;
  isGroup: boolean;
  users: ChatSessionUser[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSessionUser {
  id: string;
  userId: string;
  sessionId: string;
  user: User;
  joinedAt: Date;
  lastReadAt: Date;
}

export interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  senderId: string;
  receiverId?: string;
  sessionId: string;
  isRead: boolean;
  sender: User;
  receiver?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AIChatSession {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: Date;
}
