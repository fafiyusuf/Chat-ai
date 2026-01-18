import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { config } from '../config';
import prisma from '../config/database';
import logger from '../config/logger';

interface AuthSocket extends Socket {
  userId?: string;
  email?: string;
}

interface OnlineUsers {
  [userId: string]: string; // userId -> socketId
}

const onlineUsers: OnlineUsers = {};

export const initializeSocketIO = (server: HTTPServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: AuthSocket, next: any) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
      };

      socket.userId = decoded.userId;
      socket.email = decoded.email;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: AuthSocket) => {
    const userId = socket.userId!;
    logger.info(`User connected: ${userId}`);

    // Store socket connection
    onlineUsers[userId] = socket.id;

    // Update user status to online
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ONLINE', lastSeen: new Date() },
    });

    // Broadcast user online status
    io.emit('user:status', {
      userId,
      status: 'ONLINE',
      lastSeen: new Date(),
    });

    // Emit online users list to the connected user
    const onlineUserIds = Object.keys(onlineUsers);
    socket.emit('users:online', onlineUserIds);

    // Join user's chat rooms
    const userSessions = await prisma.chatSessionUser.findMany({
      where: { userId },
      select: { sessionId: true },
    });

    userSessions.forEach((session: { sessionId: string }) => {
      socket.join(`chat:${session.sessionId}`);
    });

    // Handle typing indicator
    socket.on('typing:start', ({ sessionId }: { sessionId: string }) => {
      socket.to(`chat:${sessionId}`).emit('user:typing', {
        userId,
        sessionId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ sessionId }: { sessionId: string }) => {
      socket.to(`chat:${sessionId}`).emit('user:typing', {
        userId,
        sessionId,
        isTyping: false,
      });
    });

    // Handle new message
    socket.on(
      'message:send',
      async (data: {
        sessionId: string;
        content: string;
        type?: string;
        receiverId?: string;
      }) => {
        try {
          const { sessionId, content, type = 'TEXT', receiverId } = data;

          // Verify user is part of the session
          const session = await prisma.chatSession.findFirst({
            where: {
              id: sessionId,
              users: {
                some: {
                  userId,
                },
              },
            },
          });

          if (!session) {
            socket.emit('error', { message: 'Session not found' });
            return;
          }

          // Map type string to valid MessageType enum
          const validTypes = ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'];
          const messageType = validTypes.includes(type) ? type : 'TEXT';

          // Create message
          const message = await prisma.message.create({
            data: {
              content,
              type: messageType as 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM',
              senderId: userId,
              receiverId,
              sessionId,
            },
            include: {
              sender: {
                select: {
                  id: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          });

          // Update session
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
          });

          // Broadcast message to all users in the session
          io.to(`chat:${sessionId}`).emit('message:new', message);

          // Send notification to receiver if they're online
          if (receiverId && onlineUsers[receiverId]) {
            io.to(onlineUsers[receiverId]).emit('notification:new', {
              type: 'message',
              message,
            });
          }
        } catch (error) {
          logger.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    );

    // Handle message read
    socket.on('message:read', async ({ messageId }: { messageId: string }) => {
      try {
        const message = await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true },
        });

        // Notify sender
        if (message.senderId && onlineUsers[message.senderId]) {
          io.to(onlineUsers[message.senderId]).emit('message:read', {
            messageId,
            readAt: new Date(),
          });
        }
      } catch (error) {
        logger.error('Mark message as read error:', error);
      }
    });

    // Handle joining a new chat session
    socket.on('session:join', ({ sessionId }: { sessionId: string }) => {
      socket.join(`chat:${sessionId}`);
      logger.info(`User ${userId} joined session ${sessionId}`);
    });

    // Handle leaving a chat session
    socket.on('session:leave', ({ sessionId }: { sessionId: string }) => {
      socket.leave(`chat:${sessionId}`);
      logger.info(`User ${userId} left session ${sessionId}`);
    });

    // Handle user status change
    socket.on(
      'status:update',
      async ({ status }: { status: 'ONLINE' | 'AWAY' | 'OFFLINE' }) => {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { status, lastSeen: new Date() },
          });

          io.emit('user:status', {
            userId,
            status,
            lastSeen: new Date(),
          });
        } catch (error) {
          logger.error('Update status error:', error);
        }
      }
    );

    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${userId}`);

      // Remove from online users
      delete onlineUsers[userId];

      // Update user status to offline
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'OFFLINE', lastSeen: new Date() },
      });

      // Broadcast user offline status
      io.emit('user:status', {
        userId,
        status: 'OFFLINE',
        lastSeen: new Date(),
      });
    });
  });

  return io;
};

export const getOnlineUsers = (): string[] => {
  return Object.keys(onlineUsers);
};
