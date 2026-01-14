import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../config/database';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (userId: string, email: string): string => {
  // Using ms format for expiresIn (e.g., "15m" = 15 minutes)
  return jwt.sign(
    { userId, email }, 
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};

export const generateRefreshToken = (userId: string, email: string): string => {
  // Using ms format for expiresIn (e.g., "7d" = 7 days)
  return jwt.sign(
    { userId, email }, 
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
  );
};

export const verifyRefreshToken = (token: string): { userId: string; email: string } => {
  return jwt.verify(token, config.jwt.refreshSecret) as { userId: string; email: string };
};

export const storeRefreshToken = async (
  userId: string,
  token: string
): Promise<void> => {
  const expiresAt = new Date();
  // Parse the refresh token expiration (default 7d)
  const days = parseInt(config.jwt.refreshExpiresIn.replace('d', ''), 10);
  expiresAt.setDate(expiresAt.getDate() + days);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.delete({
    where: { token },
  });
};

