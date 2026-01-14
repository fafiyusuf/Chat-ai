import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database';
import { config } from './index';
import logger from './logger';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: `${config.frontendUrl}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if user already exists
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { googleId },
            ],
          },
        });

        if (user) {
          // Update existing user with Google info if not already set
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                avatarUrl: avatarUrl || user.avatarUrl,
                authProvider: 'GOOGLE',
              },
            });
          }
        } else {
          // Create new user from Google profile
          user = await prisma.user.create({
            data: {
              email,
              googleId,
              displayName,
              username: email.split('@')[0], // Generate username from email
              avatarUrl,
              authProvider: 'GOOGLE',
              status: 'ONLINE',
            },
          });
        }

        logger.info(`Google OAuth success for user: ${email}`);
        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
