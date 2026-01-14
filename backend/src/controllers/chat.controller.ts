import { Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all chat sessions for current user
export const getChatSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const sessions = await prisma.chatSession.findMany({
      where: {
        users: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                status: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Last message
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: req.user.userId,
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json(sessions);
  } catch (error) {
    logger.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
};

// Get specific chat session
export const getChatSessionById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: {
        id,
        users: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                status: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Chat session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    logger.error('Get chat session error:', error);
    res.status(500).json({ error: 'Failed to fetch chat session' });
  }
};

// Create or get existing chat session
export const createChatSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { participantId } = req.body;

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      res.status(404).json({ error: 'Participant not found' });
      return;
    }

    // Check if session already exists
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            userId: {
              in: [req.user.userId, participantId],
            },
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                status: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    if (existingSession) {
      res.json(existingSession);
      return;
    }

    // Create new session
    const session = await prisma.chatSession.create({
      data: {
        isGroup: false,
        users: {
          create: [
            { userId: req.user.userId },
            { userId: participantId },
          ],
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                status: true,
                lastSeen: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(session);
  } catch (error) {
    logger.error('Create chat session error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
};

// Get messages for a session
export const getSessionMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { limit = '50', before } = req.query;

    // Verify user is part of the session
    const session = await prisma.chatSession.findFirst({
      where: {
        id,
        users: {
          some: {
            userId: req.user.userId,
          },
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Chat session not found' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        sessionId: id,
        ...(before && {
          createdAt: {
            lt: new Date(before as string),
          },
        }),
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
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string, 10),
    });

    res.json(messages.reverse());
  } catch (error) {
    logger.error('Get session messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message
export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id: sessionId } = req.params;
    const { content, type = 'TEXT' } = req.body;

    // Verify user is part of the session
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        users: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      include: {
        users: true,
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Chat session not found' });
      return;
    }

    // Find receiver (the other user in the session)
    const receiver = session.users.find((u: any) => u.userId !== req.user!.userId);

    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: req.user.userId,
        receiverId: receiver?.userId,
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

    // Update session's updatedAt
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark message as read
export const markMessageAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    // Only receiver can mark as read
    if (message.receiverId !== req.user.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updatedMessage);
  } catch (error) {
    logger.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};
