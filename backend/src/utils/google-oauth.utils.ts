import { config } from '../config';
import logger from '../config/logger';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * Get the callback URL based on environment
 */
function getCallbackUrl(): string {
  // Use environment variable if set, otherwise construct from config
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  
  // In production, use the backend URL (Render deployment)
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.BACKEND_URL || config.frontendUrl.replace('3000', '3001')}/api/auth/google/callback`;
  }
  
  // In development, use localhost:3001 (backend port)
  return `http://localhost:3001/api/auth/google/callback`;
}

/**
 * Get Google OAuth URL for user to authorize
 */
export function getGoogleAuthUrl(): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  const options = {
    client_id: config.google.clientId,
    redirect_uri: getCallbackUrl(),
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getGoogleAccessToken(code: string): Promise<GoogleTokenResponse> {
  const url = 'https://oauth2.googleapis.com/token';
  
  const values = {
    code,
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    redirect_uri: getCallbackUrl(),
    grant_type: 'authorization_code',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(values).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Google tokens: ${error}`);
    }

    return (await response.json()) as GoogleTokenResponse;
  } catch (error) {
    logger.error('Error getting Google access token:', error);
    throw error;
  }
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Google user info: ${error}`);
    }

    return (await response.json()) as GoogleUserInfo;
  } catch (error) {
    logger.error('Error getting Google user info:', error);
    throw error;
  }
}
