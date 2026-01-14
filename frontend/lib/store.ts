import { create } from "zustand";
import { chatApi, usersApi } from "./api";

// Types matching backend responses
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status?: string;
  lastSeen?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sessionId: string;
  createdAt: string;
  sender?: User;
}

// Backend returns 'users' not 'participants'
export interface ChatSessionUser {
  userId: string;
  user: User;
}

export interface ChatSession {
  id: string;
  name?: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  users: ChatSessionUser[];  // Backend uses 'users' not 'participants'
  messages: Message[];
  _count?: {
    messages: number;
  };
}

export interface ContactInfo {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status?: string;
  phone?: string;
  location?: string;
  joinedDate: string;
}

export type PageType = "home" | "files" | "settings" | "calls" | "ai-chat" | "profile";
export type ModalType = "newMessage" | "editProfile" | "newGroup" | "settings" | "addMembers" | null;

interface ModalPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

interface AppState {
  // Navigation
  activePage: PageType;
  setActivePage: (page: PageType) => void;

  // Sessions & Messages
  sessions: ChatSession[];
  selectedSessionId: string | null;
  messages: Message[];
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  
  // Users
  users: User[];
  currentUser: User | null;
  isLoadingUsers: boolean;
  
  // UI State
  selectedContactInfo: ContactInfo | null;
  isInfoPanelOpen: boolean;
  activeModal: ModalType;
  modalPosition: ModalPosition | null;
  searchQuery: string;
  
  // Actions - Data Fetching
  fetchSessions: () => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  
  // Actions - Chat Operations
  selectSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  createSession: (participantIds: string[], name?: string, isGroup?: boolean) => Promise<ChatSession | null>;
  
  // Actions - UI
  setSelectedContactInfo: (info: ContactInfo | null) => void;
  toggleInfoPanel: () => void;
  openModal: (modal: ModalType, position?: ModalPosition) => void;
  closeModal: () => void;
  setSearchQuery: (query: string) => void;
  
  // Real-time updates
  addMessage: (message: Message) => void;
  updateSession: (session: ChatSession) => void;
  updateUserStatus: (userId: string, status: string, lastSeen: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial Navigation State
  activePage: "home",
  setActivePage: (page) => set({ activePage: page }),

  // Initial Sessions & Messages State
  sessions: [],
  selectedSessionId: null,
  messages: [],
  isLoadingSessions: false,
  isLoadingMessages: false,

  // Initial Users State
  users: [],
  currentUser: null,
  isLoadingUsers: false,

  // Initial UI State
  selectedContactInfo: null,
  isInfoPanelOpen: false,
  activeModal: null,
  modalPosition: null,
  searchQuery: "",

  // Fetch all chat sessions from backend
  fetchSessions: async () => {
    set({ isLoadingSessions: true });
    try {
      const sessions = await chatApi.getSessions();
      set({ sessions, isLoadingSessions: false });
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      set({ isLoadingSessions: false });
    }
  },

  // Fetch messages for a specific session
  fetchMessages: async (sessionId: string) => {
    set({ isLoadingMessages: true });
    try {
      const messages = await chatApi.getMessages(sessionId);
      set({ messages, isLoadingMessages: false });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      set({ isLoadingMessages: false });
    }
  },

  // Fetch all users from backend
  fetchUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const users = await usersApi.getAll();
      set({ users, isLoadingUsers: false });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ isLoadingUsers: false });
    }
  },

  // Set current user (from auth)
  setCurrentUser: (user) => set({ currentUser: user }),

  // Select a session and load its messages
  selectSession: async (sessionId: string) => {
    set({ selectedSessionId: sessionId });
    await get().fetchMessages(sessionId);
    
    // Set contact info from session users
    const session = get().sessions.find(s => s.id === sessionId);
    if (session && !session.isGroup && session.users) {
      const otherUser = session.users.find(
        (u: ChatSessionUser) => u.userId !== get().currentUser?.id
      );
      if (otherUser) {
        set({
          selectedContactInfo: {
            id: otherUser.user.id,
            name: otherUser.user.displayName || otherUser.user.username || "Unknown",
            username: otherUser.user.username || "",
            email: otherUser.user.email,
            avatarUrl: otherUser.user.avatarUrl,
            status: otherUser.user.status || "offline",
            joinedDate: otherUser.user.lastSeen || new Date().toISOString(),
          }
        });
      }
    }
  },

  // Send a message to the selected session
  sendMessage: async (content: string) => {
    const sessionId = get().selectedSessionId;
    if (!sessionId || !content.trim()) return;
    
    try {
      const message = await chatApi.sendMessage(sessionId, content);
      // Add message to local state (will also come via socket)
      set(state => ({
        messages: [...state.messages, message]
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  },

  // Create a new chat session
  createSession: async (participantIds: string[], name?: string, isGroup = false) => {
    try {
      // Note: isGroup is determined by backend based on participant count
      const session = await chatApi.createSession(participantIds, name);
      set(state => ({
        sessions: [session, ...state.sessions]
      }));
      return session;
    } catch (error) {
      console.error("Failed to create session:", error);
      return null;
    }
  },

  // UI Actions
  setSelectedContactInfo: (info) => set({ selectedContactInfo: info }),
  
  toggleInfoPanel: () => set(state => ({ isInfoPanelOpen: !state.isInfoPanelOpen })),
  
  openModal: (modal, position) => set({ activeModal: modal, modalPosition: position || null }),
  
  closeModal: () => set({ activeModal: null, modalPosition: null }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Real-time message updates (called from socket events)
  addMessage: (message: Message) => {
    set(state => {
      // Only add if it's for the current session
      if (message.sessionId === state.selectedSessionId) {
        // Avoid duplicates
        if (state.messages.some(m => m.id === message.id)) {
          return state;
        }
        return { messages: [...state.messages, message] };
      }
      return state;
    });
    
    // Update session's last message (backend uses messages array)
    set(state => ({
      sessions: state.sessions.map(session =>
        session.id === message.sessionId
          ? { 
              ...session, 
              messages: [message, ...(session.messages || [])].slice(0, 1), // Keep only most recent
              updatedAt: message.createdAt 
            }
          : session
      )
    }));
  },

  // Update session (e.g., when a new participant joins)
  updateSession: (updatedSession: ChatSession) => {
    set(state => ({
      sessions: state.sessions.map(session =>
        session.id === updatedSession.id ? updatedSession : session
      )
    }));
  },

  // Update user status (called from socket events)
  updateUserStatus: (userId: string, status: string, lastSeen: string) => {
    set(state => {
      // Update current user if it's them
      const updatedCurrentUser = state.currentUser?.id === userId
        ? { ...state.currentUser, status, lastSeen }
        : state.currentUser;

      // Update users list
      const updatedUsers = state.users.map(user =>
        user.id === userId ? { ...user, status, lastSeen } : user
      );

      // Update users in all sessions
      const updatedSessions = state.sessions.map(session => ({
        ...session,
        users: session.users.map(sessionUser =>
          sessionUser.userId === userId
            ? {
                ...sessionUser,
                user: { ...sessionUser.user, status, lastSeen }
              }
            : sessionUser
        )
      }));

      // Update contact info if it's the selected contact
      const updatedContactInfo = state.selectedContactInfo?.id === userId
        ? { ...state.selectedContactInfo, status, joinedDate: lastSeen }
        : state.selectedContactInfo;

      return {
        currentUser: updatedCurrentUser,
        users: updatedUsers,
        sessions: updatedSessions,
        selectedContactInfo: updatedContactInfo
      };
    });
  },
}));
