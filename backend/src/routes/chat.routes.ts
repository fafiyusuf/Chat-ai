import { Router, type Router as IRouter } from 'express';
import { body } from 'express-validator';
import {
    createChatSession,
    getChatSessionById,
    getChatSessions,
    getSessionMessages,
    markMessageAsRead,
    sendMessage,
} from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get all chat sessions for the current user
router.get('/sessions', getChatSessions);

// Get specific chat session
router.get('/sessions/:id', getChatSessionById);

// Create or get chat session with a user
router.post(
  '/sessions',
  [body('participantId').notEmpty().withMessage('Participant ID is required')],
  validate,
  createChatSession
);

// Get messages for a session
router.get('/sessions/:id/messages', getSessionMessages);

// Send a message
router.post(
  '/sessions/:id/messages',
  [
    body('content').notEmpty().withMessage('Message content is required'),
    body('type').optional().isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']),
  ],
  validate,
  sendMessage
);

// Mark message as read
router.patch('/messages/:id/read', markMessageAsRead);

export default router;
