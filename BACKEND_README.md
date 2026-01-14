# 💬 Real-Time Chat Application - Full Stack MVP

A production-ready, real-time chat application built with Next.js, Express, Socket.IO, and PostgreSQL.

## 🎯 Project Overview

This is a complete chat application MVP built for the Shipper Developer challenge. It includes:

- ✅ **Real-time messaging** with WebSocket
- ✅ **User authentication** (JWT + Google OAuth)
- ✅ **User presence** (online/offline/away status)
- ✅ **Message persistence** in PostgreSQL
- ✅ **Chat history** and sessions
- ✅ **AI Chat** (bonus feature with OpenAI)
- ✅ **1:1 Figma replication** (frontend)
- ✅ **Production-ready** backend

## 📁 Project Structure

```
.
├── backend/                 # Express + Socket.IO backend
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── socket/         # WebSocket handlers
│   │   ├── middleware/     # Auth, validation, errors
│   │   └── config/         # Configuration
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── README.md           # Backend documentation
│
├── app/                    # Next.js frontend
├── components/             # React components
│   ├── chat-interface.tsx
│   ├── message-list.tsx
│   ├── sidebar.tsx
│   └── ui/                # shadcn/ui components
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Backend Setup (3 minutes)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL (get from Neon.tech)

# Setup database
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Start server
npm run dev
```

Backend runs on **http://localhost:3001**

📚 **Full backend docs**: `backend/README.md`

### 2. Frontend Setup (2 minutes)

```bash
# From root directory
npm install

# Configure environment
# Add to .env.local:
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Start frontend
npm run dev
```

Frontend runs on **http://localhost:3000**

## 📖 Documentation

### Backend Documentation
| File | Description |
|------|-------------|
| `backend/README.md` | Complete API documentation |
| `backend/QUICKSTART.md` | 5-minute setup guide |
| `backend/API_TESTING.md` | API testing examples |
| `backend/FRONTEND_INTEGRATION.md` | React/Next.js integration |
| `backend/DEPLOYMENT.md` | Production deployment guide |
| `backend/PROJECT_OVERVIEW.md` | Architecture overview |
| `backend/CHECKLIST.md` | Setup verification checklist |

### Key Features Documentation
- **Authentication**: JWT + Google OAuth in `backend/src/controllers/auth.controller.ts`
- **Real-time Chat**: WebSocket events in `backend/src/socket/index.ts`
- **Database Schema**: Prisma schema in `backend/prisma/schema.prisma`
- **AI Chat**: OpenAI integration in `backend/src/controllers/ai.controller.ts`

## 🎨 Frontend Features

Based on Figma design with:
- ✅ Modern chat interface
- ✅ User list with status indicators
- ✅ Real-time message updates
- ✅ Typing indicators
- ✅ Message timestamps
- ✅ User profiles
- ✅ Responsive design
- ✅ Dark mode support (theme provider)

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 16
- **UI**: React + shadcn/ui + Tailwind CSS
- **State**: Zustand (lib/store.ts)
- **Real-time**: Socket.IO Client
- **API**: Axios

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **WebSocket**: Socket.IO
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: JWT + Google OAuth
- **AI**: OpenAI API
- **Security**: Helmet, CORS, bcrypt, Rate Limiting

## 🌟 Features Implemented

### Required Features ✅
- [x] Authentication page (Google OAuth + JWT)
- [x] User list (online/offline status)
- [x] Click user to start chat
- [x] User info display (name, picture, status)
- [x] Chat sessions saved in DB
- [x] Real-time messaging with WebSocket

### Bonus Features ✅
- [x] AI Chat with OpenAI
- [x] Typing indicators
- [x] Message read receipts
- [x] User presence (online/away/offline)
- [x] Message history pagination
- [x] Refresh token rotation
- [x] Rate limiting
- [x] Comprehensive logging

## 🧪 Demo Users

After running `npm run prisma:seed` in backend:

```
Email: alice@example.com   | Password: password123
Email: bob@example.com     | Password: password123
Email: charlie@example.com | Password: password123
Email: diana@example.com   | Password: password123
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login with email/password
POST   /api/auth/google         # Login with Google
POST   /api/auth/refresh        # Refresh access token
GET    /api/auth/me             # Get current user
POST   /api/auth/logout         # Logout
```

### Users
```
GET    /api/users               # List users (with filters)
GET    /api/users/:id           # Get user by ID
PATCH  /api/users/profile       # Update profile
PATCH  /api/users/status        # Update status
```

### Chat
```
GET    /api/chat/sessions                  # Get chat sessions
POST   /api/chat/sessions                  # Create session
GET    /api/chat/sessions/:id/messages     # Get messages
POST   /api/chat/sessions/:id/messages     # Send message
PATCH  /api/chat/messages/:id/read         # Mark as read
```

### AI Chat (Bonus)
```
GET    /api/ai/sessions                    # Get AI sessions
POST   /api/ai/sessions                    # Create AI session
POST   /api/ai/sessions/:id/messages       # Chat with AI
DELETE /api/ai/sessions/:id                # Delete session
```

## 🔌 WebSocket Events

### Client → Server
- `typing:start` / `typing:stop` - Typing indicators
- `message:send` - Send message
- `message:read` - Mark message as read
- `session:join` / `session:leave` - Join/leave chat
- `status:update` - Update user status

### Server → Client
- `user:status` - User status changed
- `users:online` - List of online users
- `user:typing` - Someone is typing
- `message:new` - New message received
- `notification:new` - New notification

## 🚀 Deployment

### Backend
Recommended: **Railway** (easiest)
1. Connect GitHub repo
2. Add PostgreSQL
3. Set environment variables
4. Deploy!

Alternatives: Render, Fly.io
See `backend/DEPLOYMENT.md` for detailed guides.

### Frontend
Recommended: **Vercel**
1. Connect GitHub repo
2. Set environment variables
3. Deploy!

Alternative: Netlify

### Database
Recommended: **Neon** (PostgreSQL)
- Free tier available
- Auto-scaling
- Built-in backups

## 🔒 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT with short-lived tokens (15 min)
- ✅ Refresh token rotation
- ✅ CORS protection
- ✅ Rate limiting (100 req/15 min)
- ✅ Helmet security headers
- ✅ Request validation
- ✅ SQL injection protection (Prisma)

## 📊 Performance

- WebSocket for low-latency real-time
- Database connection pooling
- Indexed database queries
- Efficient Prisma queries
- Rate limiting
- Logging for monitoring

## 🎯 Design Implementation

This project replicates the Figma design 1:1:
- Exact spacing and sizing
- Color scheme matching
- Typography matching
- Component hierarchy
- Interactive states
- Responsive breakpoints

> **Note**: The signup/login page has a custom conversion-focused design as requested.

## 📝 Testing

### Backend
```bash
cd backend

# Start server
npm run dev

# Test health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

# View database
npm run prisma:studio
```

### Frontend
```bash
npm run dev
# Open http://localhost:3000
# Login with demo credentials
# Start chatting!
```

## 🎁 Bonus Ideas Implemented

1. ✅ **AI Chat** - Chat with OpenAI GPT
2. ✅ **Typing Indicators** - See when users are typing
3. ✅ **Read Receipts** - Know when messages are read
4. ✅ **User Presence** - Online/Away/Offline status
5. ✅ **Message History** - Infinite scroll with pagination
6. ✅ **Search Users** - Find users quickly
7. ✅ **Profile Management** - Update name, bio, avatar

## 🛠️ Development

### Backend
```bash
cd backend
npm run dev              # Start dev server
npm run build            # Build for production
npm run prisma:studio    # Open database GUI
```

### Frontend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Lint code
```

## 📱 System Requirements

- Node.js 18+
- PostgreSQL (via Neon)
- npm or pnpm
- Modern browser (for frontend)

## 🤝 Integration

Complete frontend integration examples in `backend/FRONTEND_INTEGRATION.md`:
- React hooks for Socket.IO
- Authentication context
- Chat components
- API client setup
- Protected routes

## 📈 What's Next?

Future enhancements ready to implement:
- [ ] Group chats (schema ready)
- [ ] File uploads
- [ ] Voice/video calls
- [ ] Message reactions
- [ ] Push notifications
- [ ] Email notifications
- [ ] User blocking
- [ ] Message search

## 🎓 Learning Resources

- Backend: `backend/README.md`
- Quick Start: `backend/QUICKSTART.md`
- API Testing: `backend/API_TESTING.md`
- Deployment: `backend/DEPLOYMENT.md`
- Frontend Integration: `backend/FRONTEND_INTEGRATION.md`

## ✨ Highlights

**Speed**: Built in 1 day as required
**Quality**: Production-ready code
**Documentation**: Comprehensive guides
**Security**: Industry best practices
**Features**: All required + bonuses
**Design**: 1:1 Figma replication
**Testing**: Demo data included
**Deployment**: Ready to deploy

## 📞 Demo

### Test Link
[Coming soon - Deploy and add link here]

### Demo Video
[Coming soon - Add walkthrough video]

## 🏆 Success Metrics

- ✅ All MVP requirements met
- ✅ Bonus features implemented
- ✅ Production-ready
- ✅ Well-documented
- ✅ Easy to deploy
- ✅ Scalable architecture
- ✅ Secure implementation
- ✅ Great developer experience

---

**Built with ❤️ for the Shipper Developer MVP Challenge**

For questions or issues, check the documentation in `backend/` folder.
