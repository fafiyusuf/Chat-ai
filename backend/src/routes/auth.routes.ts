import { Router, type Router as IRouter } from 'express';
import { body } from 'express-validator';
import {
    getProfile,
    googleAuth,
    googleCallback,
    login,
    logout,
    refreshToken,
    register,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router: IRouter = Router();

// Register with email/password
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('displayName').optional().trim(),
    body('username').optional().trim(),
  ],
  validate,
  register as any
);

// Login with email/password
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login as any
);

// Refresh access token
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  refreshToken as any
);

// Logout
router.post('/logout', authenticate, logout as any);

// Get current user profile
router.get('/me', authenticate, getProfile as any);

// Google OAuth routes
router.get('/google', googleAuth as any);
router.get('/google/callback', googleCallback as any);

export default router;
