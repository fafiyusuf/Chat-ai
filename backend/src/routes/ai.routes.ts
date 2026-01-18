import { Router, type Router as IRouter } from 'express';
import { body } from 'express-validator';
import {
  createAIChatSession,
  deleteAIChatSession,
  getAIChatSessions,
  getAISessionMessages,
  sendAIMessage,
} from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get all AI chat sessions
router.get('/sessions', getAIChatSessions);

// Create new AI chat session
router.post(
  '/sessions',
  [body('title').optional().trim()],
  validate,
  createAIChatSession
);

// Get messages for an AI session
router.get('/sessions/:id/messages', getAISessionMessages);

// Send message to AI
router.post(
  '/sessions/:id/messages',
  [body('content').notEmpty().withMessage('Message content is required')],
  validate,
  sendAIMessage
);

// Delete AI chat session
router.delete('/sessions/:id', deleteAIChatSession);

export default router;
