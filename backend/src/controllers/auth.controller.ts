import { Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  comparePassword,
  deleteRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  storeRefreshToken,
  verifyRefreshToken,
} from '../utils/auth.utils';
import {
  getGoogleAccessToken,
  getGoogleAuthUrl,
  getGoogleUserInfo,
} from '../utils/google-oauth.utils';

// Register new user
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, displayName, username } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        res.status(400).json({ error: 'Username already taken' });
        return;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
        username,
        authProvider: 'LOCAL',
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login with email/password
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ONLINE', lastSeen: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    logger.info(`User logged in: ${email}`);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Refresh access token
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    // Verify refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await deleteRefreshToken(token);
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }

    // Verify token signature
    const decoded = verifyRefreshToken(token);

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId, decoded.email);

    res.json({ accessToken });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await deleteRefreshToken(token);
    }

    // Update user status to offline
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { status: 'OFFLINE', lastSeen: new Date() },
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        status: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Initiate Google OAuth flow
export const googleAuth = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUrl = getGoogleAuthUrl();
    res.json({ url: authUrl });
  } catch (error) {
    logger.error('Google auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate Google auth URL' });
  }
};

// Google OAuth callback handler
export const googleCallback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=missing_code`);
      return;
    }

    // Exchange code for access token
    const { access_token } = await getGoogleAccessToken(code);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(access_token);

    if (!googleUser.email) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`);
      return;
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: googleUser.email },
          { googleId: googleUser.id },
        ],
      },
    });

    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            avatarUrl: googleUser.picture || user.avatarUrl,
            authProvider: 'GOOGLE',
            status: 'ONLINE',
            lastSeen: new Date(),
          },
        });
      } else {
        // Just update status
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            status: 'ONLINE',
            lastSeen: new Date(),
          },
        });
      }
    } else {
      // Create new user from Google profile
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.id,
          displayName: googleUser.name,
          username: googleUser.email.split('@')[0],
          avatarUrl: googleUser.picture,
          authProvider: 'GOOGLE',
          status: 'ONLINE',
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    logger.info(`Google OAuth login successful: ${user.email}`);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (error) {
    logger.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};

