import { Router, type Router as IRouter } from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserStatus,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update current user profile
router.patch(
  '/profile',
  [
    body('displayName').optional().trim(),
    body('username').optional().trim(),
    body('bio').optional().trim(),
    body('avatarUrl').optional().isURL(),
  ],
  validate,
  updateProfile
);

// Update user status
router.patch(
  '/status',
  [body('status').isIn(['ONLINE', 'OFFLINE', 'AWAY'])],
  validate,
  updateUserStatus
);

export default router;
