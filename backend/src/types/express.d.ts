import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      userId: string;
      email: string;
      username?: string | null;
      displayName?: string | null;
      avatarUrl?: string | null;
      googleId?: string | null;
      status?: string;
    }
  }
}
