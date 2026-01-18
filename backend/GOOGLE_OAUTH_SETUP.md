# Google OAuth Setup Guide

## Overview

This application uses Google OAuth 2.0 for authentication. The OAuth flow redirects users to Google for authentication, then back to the backend callback URL to complete the process.

## Authorized Redirect URIs

You need to configure the following redirect URIs in your Google Cloud Console:

### Local Development
- **Backend (Primary)**: `http://localhost:3001/api/auth/google/callback`
- **Alternative Port**: `http://localhost:3000/api/auth/google/callback` (if testing different configurations)

### Production
- **Render Deployment**: `https://chat-ai-mxwy.onrender.com/api/auth/google/callback`

## Google Cloud Console Configuration

### Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the consent screen if you haven't already
6. Select **Web application** as the application type

### Step 2: Add Authorized Redirect URIs

In the OAuth client configuration, add all three URIs:

```
http://localhost:3001/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
https://chat-ai-mxwy.onrender.com/api/auth/google/callback
```

### Step 3: Save Credentials

1. Copy the **Client ID** and **Client Secret**
2. Add them to your `.env` file (see below)

## Environment Configuration

### Local Development (.env)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

### Production (Render Environment Variables)

Set these in your Render dashboard:

```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_CALLBACK_URL=https://chat-ai-mxwy.onrender.com/api/auth/google/callback

FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://chat-ai-mxwy.onrender.com
```

## How It Works

### Authentication Flow

1. **User clicks "Sign in with Google"** on the frontend
2. Frontend calls `GET /api/auth/google` on the backend
3. Backend returns Google OAuth URL with callback URI
4. User is redirected to Google's consent screen
5. After consent, Google redirects to the callback URI with an authorization code
6. Backend exchanges the code for access token at the callback endpoint
7. Backend fetches user info from Google
8. Backend creates/updates user in database
9. Backend generates JWT tokens
10. Backend redirects to frontend with tokens in query params
11. Frontend stores tokens and logs in the user

### Callback URL Resolution

The callback URL is determined in this order:

1. **GOOGLE_CALLBACK_URL** environment variable (if set) - highest priority
2. **Production mode**: Uses BACKEND_URL from environment
3. **Development mode**: Defaults to `http://localhost:3001/api/auth/google/callback`

This ensures flexibility across different environments while maintaining security.

## Testing

### Test Local Setup

1. Start the backend: `cd backend && pnpm dev`
2. Start the frontend: `cd frontend && pnpm dev`
3. Navigate to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Complete the Google sign-in flow
6. You should be redirected back and logged in

### Verify Callback URL

Check the backend logs to see which callback URL is being used:

```bash
# The Google auth URL will show the redirect_uri parameter
# Example: https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=http://localhost:3001/api/auth/google/callback
```

## Troubleshooting

### Error: redirect_uri_mismatch

**Cause**: The callback URL in your request doesn't match any authorized redirect URIs in Google Cloud Console.

**Solution**: 
1. Check the exact URL in the error message
2. Add that exact URL to your authorized redirect URIs in Google Cloud Console
3. Wait a few minutes for changes to propagate

### Error: Missing or invalid OAuth credentials

**Cause**: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set or incorrect.

**Solution**:
1. Verify credentials in `.env` file
2. Ensure no extra spaces or quotes
3. Restart the backend server after changes

### Frontend receives error query param

Check the error parameter in the URL:
- `?error=missing_code` - Google didn't provide authorization code
- `?error=no_email` - Google profile doesn't have an email
- `?error=oauth_failed` - General OAuth error (check backend logs)

## Security Considerations

1. **Never commit `.env` files** - Keep credentials secure
2. **Use HTTPS in production** - Required for OAuth security
3. **Rotate secrets regularly** - Update OAuth credentials periodically
4. **Limit scopes** - Only request profile and email scopes
5. **Validate redirects** - Frontend URL is validated before redirect

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Google Cloud Console](https://console.cloud.google.com/)
