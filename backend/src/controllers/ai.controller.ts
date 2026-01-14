import { GoogleGenerativeAI } from '@google/generative-ai';
import { Response } from 'express';
import { config } from '../config';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth.middleware';

const genAI = config.gemini.apiKey
  ? new GoogleGenerativeAI(config.gemini.apiKey)
  : null;

// Get all AI chat sessions for current user
export const getAIChatSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const sessions = await prisma.aIChatSession.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json(sessions);
  } catch (error) {
    logger.error('Get AI chat sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch AI chat sessions' });
  }
};

// Create new AI chat session
export const createAIChatSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { title } = req.body;

    const session = await prisma.aIChatSession.create({
      data: {
        userId: req.user.userId,
        title: title || 'New AI Chat',
      },
    });

    res.status(201).json(session);
  } catch (error) {
    logger.error('Create AI chat session error:', error);
    res.status(500).json({ error: 'Failed to create AI chat session' });
  }
};

// Get messages for an AI session
export const getAISessionMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Verify session belongs to user
    const session = await prisma.aIChatSession.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!session) {
      res.status(404).json({ error: 'AI chat session not found' });
      return;
    }

    const messages = await prisma.aIMessage.findMany({
      where: {
        sessionId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    logger.error('Get AI session messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send message to AI and get response
export const sendAIMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!genAI) {
      res.status(503).json({ error: 'AI service not configured' });
      return;
    }

    const { id: sessionId } = req.params;
    const { content } = req.body;

    // Verify session belongs to user
    const session = await prisma.aIChatSession.findFirst({
      where: {
        id: sessionId,
        userId: req.user.userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 20,
        },
      },
    });

    if (!session) {
      res.status(404).json({ error: 'AI chat session not found' });
      return;
    }

    // Save user message
    const userMessage = await prisma.aIMessage.create({
      data: {
        sessionId,
        role: 'USER',
        content,
      },
    });

    // Prepare conversation history for Gemini
    const history = session.messages.map((msg: any) => ({
      role: msg.role === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(content);
    const response = await result.response;
    const aiResponse = response.text() || 'No response';

    // Save AI response
    const aiMessage = await prisma.aIMessage.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        content: aiResponse,
      },
    });

    // Update session's updatedAt
    await prisma.aIChatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    res.json({
      userMessage,
      aiMessage,
    });
  } catch (error) {
    logger.error('Send AI message error:', error);
    res.status(500).json({ error: 'Failed to send AI message' });
  }
};

// Delete AI chat session
export const deleteAIChatSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Verify session belongs to user
    const session = await prisma.aIChatSession.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!session) {
      res.status(404).json({ error: 'AI chat session not found' });
      return;
    }

    await prisma.aIChatSession.delete({
      where: { id },
    });

    res.json({ message: 'AI chat session deleted successfully' });
  } catch (error) {
    logger.error('Delete AI chat session error:', error);
    res.status(500).json({ error: 'Failed to delete AI chat session' });
  }
};
