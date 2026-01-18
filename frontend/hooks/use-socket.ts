"use client"

import { useAuth } from '@/lib/auth-context';
import { disconnectSocket, getSocket, initSocket, socketEmit } from '@/lib/socket';
import { useAppStore } from '@/lib/store';
import { useCallback, useEffect } from 'react';

export function useSocket() {
  const { isAuthenticated } = useAuth();
  const { addMessage, updateSession, updateUserStatus, selectedSessionId } = useAppStore();

  // Initialize socket when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    try {
      const socket = initSocket();

      // Listen for new messages
      socket.on('message:new', (message) => {
        addMessage(message);
      });

      // Listen for session updates
      socket.on('session:updated', (session) => {
        updateSession(session);
      });

      // Listen for user status updates
      socket.on('user:status', ({ userId, status, lastSeen }) => {
        updateUserStatus(userId, status, lastSeen);
      });

      // Cleanup on unmount
      return () => {
        disconnectSocket();
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }, [isAuthenticated, addMessage, updateSession, updateUserStatus]);

  // Join session room when selected
  useEffect(() => {
    if (selectedSessionId) {
      socketEmit.joinSession(selectedSessionId);
    }
  }, [selectedSessionId]);

  // Send message via socket
  const sendMessage = useCallback((content: string) => {
    if (selectedSessionId) {
      socketEmit.sendMessage(selectedSessionId, content);
    }
  }, [selectedSessionId]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (selectedSessionId) {
      socketEmit.startTyping(selectedSessionId);
    }
  }, [selectedSessionId]);

  const stopTyping = useCallback(() => {
    if (selectedSessionId) {
      socketEmit.stopTyping(selectedSessionId);
    }
  }, [selectedSessionId]);

  return {
    socket: getSocket(),
    sendMessage,
    startTyping,
    stopTyping,
  };
}
