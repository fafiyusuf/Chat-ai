# Chat Application Backend

Full-stack real-time chat application backend built with Express, Socket.IO, Prisma, and PostgreSQL (Neon).

## Features

- ✅ JWT Authentication
- ✅ Google OAuth Support
- ✅ Real-time messaging with WebSocket (Socket.IO)
- ✅ User presence (online/offline/away status)
- ✅ Chat sessions and message history
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ AI Chat (Bonus - OpenAI integration)
- ✅ PostgreSQL database with Prisma ORM
- ✅ Rate limiting and security (Helmet)
- ✅ Request validation
- ✅ Comprehensive logging

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.IO
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT + Google OAuth
- **AI**: OpenAI API (optional)
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (Neon account recommended)
- Google OAuth credentials (optional)
- OpenAI API key (optional, for AI chat feature)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database (Get from Neon: https://neon.tech)
DATABASE_URL="postgresql://username:password@host.region.neon.tech/database?sslmode=require"

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Google OAuth (optional - get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI (optional - for AI chat feature)
OPENAI_API_KEY=sk-your-openai-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

#### Create Neon Database

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL` in `.env`

#### Run Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Or use migrations (recommended for production)
npm run prisma:migrate

# Seed database with demo data
npm run prisma:seed
```

### 4. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID and Client Secret to `.env`

### 5. Run the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server will start on `http://localhost:3001`

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "username": "johndoe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Google OAuth
```http
POST /api/auth/google
Content-Type: application/json

{
  "token": "google-id-token"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer {access-token}
```

### User Endpoints

#### Get All Users
```http
GET /api/users?status=ONLINE&search=john
Authorization: Bearer {access-token}
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer {access-token}
```

#### Update Profile
```http
PATCH /api/users/profile
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "displayName": "John Smith",
  "bio": "Software Developer",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### Update Status
```http
PATCH /api/users/status
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "status": "AWAY"
}
```

### Chat Endpoints

#### Get Chat Sessions
```http
GET /api/chat/sessions
Authorization: Bearer {access-token}
```

#### Create/Get Chat Session
```http
POST /api/chat/sessions
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "participantId": "user-id"
}
```

#### Get Session Messages
```http
GET /api/chat/sessions/:id/messages?limit=50&before=2024-01-01T00:00:00Z
Authorization: Bearer {access-token}
```

#### Send Message
```http
POST /api/chat/sessions/:id/messages
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "content": "Hello!",
  "type": "TEXT"
}
```

#### Mark Message as Read
```http
PATCH /api/chat/messages/:id/read
Authorization: Bearer {access-token}
```

### AI Chat Endpoints (Bonus)

#### Get AI Sessions
```http
GET /api/ai/sessions
Authorization: Bearer {access-token}
```

#### Create AI Session
```http
POST /api/ai/sessions
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "title": "Help with React"
}
```

#### Send AI Message
```http
POST /api/ai/sessions/:id/messages
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "content": "How do I use hooks in React?"
}
```

## WebSocket Events

### Client → Server

- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:send` - Send a new message
- `message:read` - Mark message as read
- `session:join` - Join a chat session
- `session:leave` - Leave a chat session
- `status:update` - Update user status

### Server → Client

- `user:status` - User status changed
- `users:online` - List of online users
- `user:typing` - User typing indicator
- `message:new` - New message received
- `message:read` - Message was read
- `notification:new` - New notification

### WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for events
socket.on('connect', () => {
  console.log('Connected');
});

socket.on('message:new', (message) => {
  console.log('New message:', message);
});

// Emit events
socket.emit('typing:start', { sessionId: 'session-id' });
socket.emit('message:send', {
  sessionId: 'session-id',
  content: 'Hello!',
  receiverId: 'user-id'
});
```

## Database Schema

### User
- id, email, username, password
- displayName, avatarUrl, bio
- status (ONLINE/OFFLINE/AWAY)
- authProvider (LOCAL/GOOGLE)
- googleId

### ChatSession
- id, name, isGroup
- users (many-to-many)
- messages (one-to-many)

### Message
- id, content, type
- sender, receiver, session
- isRead, createdAt

### AIChatSession (Bonus)
- id, userId, title
- messages (one-to-many)

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── config/
│   │   ├── index.ts       # Configuration
│   │   ├── database.ts    # Prisma client
│   │   └── logger.ts      # Winston logger
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── chat.controller.ts
│   │   └── ai.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── chat.routes.ts
│   │   └── ai.routes.ts
│   ├── socket/
│   │   └── index.ts       # WebSocket handlers
│   ├── utils/
│   │   └── auth.utils.ts
│   └── server.ts          # Main server file
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## Development Tips

### Prisma Studio
View and edit database data:
```bash
npm run prisma:studio
```

### Logs
Logs are stored in `logs/` directory:
- `logs/error.log` - Error logs only
- `logs/all.log` - All logs

### Demo Users
After seeding, you can login with:
- Email: `alice@example.com`
- Email: `bob@example.com`
- Email: `charlie@example.com`
- Email: `diana@example.com`
- Password: `password123`

## Security Considerations

- JWT tokens are short-lived (15 minutes)
- Refresh tokens stored in database
- Passwords hashed with bcrypt
- Rate limiting on all API endpoints
- Helmet middleware for security headers
- CORS configured for frontend origin
- Input validation on all endpoints

## Deployment

### Environment Variables
Set all required environment variables on your hosting platform.

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

### Recommended Platforms
- **Backend**: Railway, Render, Fly.io, Heroku
- **Database**: Neon, Supabase, Railway
- **Frontend**: Vercel, Netlify

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure SSL mode is enabled for Neon
- Check if database is accessible from your network

### WebSocket Connection Issues
- Verify CORS settings
- Check if frontend URL matches `FRONTEND_URL`
- Ensure JWT token is valid

### AI Chat Not Working
- Verify `OPENAI_API_KEY` is set
- Check OpenAI API quota and billing
- Review error logs in `logs/error.log`

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
