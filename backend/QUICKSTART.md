# 🚀 Quick Start Guide

Get your chat application backend up and running in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed
- ✅ npm or pnpm installed
- ✅ PostgreSQL database (we'll use Neon - it's free!)

## Step 1: Get a Database (2 minutes)

1. Go to [Neon](https://neon.tech) and sign up (free)
2. Create a new project
3. Copy your connection string - it looks like:
   ```
   postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require
   ```

## Step 2: Setup Backend (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Now edit `.env` and add your database URL:
```env
DATABASE_URL="your-neon-connection-string-here"
JWT_SECRET="change-this-to-random-string"
JWT_REFRESH_SECRET="change-this-to-different-random-string"
```

## Step 3: Initialize Database (1 minute)

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with demo data (optional but recommended)
npm run prisma:seed
```

## Step 4: Start Server

```bash
npm run dev
```

You should see:
```
🚀 Server started on port 3001
📝 Environment: development
🌐 Frontend URL: http://localhost:3000
💾 Database connected
🔌 WebSocket initialized
```

## Step 5: Test It!

Open a new terminal and test:

```bash
# Health check
curl http://localhost:3001/health

# Login with demo user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

## Demo Users (after seeding)

- alice@example.com / password123
- bob@example.com / password123
- charlie@example.com / password123
- diana@example.com / password123

## What's Next?

### For Development:
1. Read `API_TESTING.md` for API documentation
2. Read `FRONTEND_INTEGRATION.md` to connect your frontend
3. Use Prisma Studio to view data: `npm run prisma:studio`

### Optional Features:

**Google OAuth:**
1. Get credentials from [Google Cloud Console](https://console.cloud.google.com)
2. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-secret
   ```

**AI Chat (Bonus):**
1. Get API key from [OpenAI](https://platform.openai.com)
2. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-your-key
   ```

### For Production:
1. Read `DEPLOYMENT.md` for deployment guide
2. Deploy to Railway, Render, or Fly.io
3. Update `FRONTEND_URL` in production environment

## Common Issues

### "Cannot connect to database"
- Check your DATABASE_URL is correct
- Make sure it includes `?sslmode=require` for Neon
- Test connection: `npm run prisma:studio`

### "Port 3001 already in use"
- Change PORT in `.env` file
- Or kill the process using port 3001

### TypeScript errors during npm install
- These are expected during initial setup
- Run `npm run prisma:generate` to fix
- Rebuild: `npm run build`

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Demo data
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── socket/          # WebSocket handlers
│   ├── utils/           # Helper functions
│   └── server.ts        # Main server
├── .env                 # Your config (create this)
├── .env.example         # Template
└── package.json
```

## Available Scripts

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start               # Start production server
npm run prisma:generate # Generate Prisma Client
npm run prisma:push     # Push schema to DB
npm run prisma:migrate  # Create migration
npm run prisma:studio   # Open database GUI
npm run prisma:seed     # Seed demo data
```

## Quick Commands Reference

```bash
# Development
npm run dev

# View database
npm run prisma:studio

# Reset database (careful!)
npm run prisma:push -- --force-reset
npm run prisma:seed

# Check logs
tail -f logs/all.log
```

## API Endpoints Summary

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile
- `GET /api/users` - List users
- `GET /api/chat/sessions` - Chat sessions
- `POST /api/chat/sessions` - Create session
- `GET /api/chat/sessions/:id/messages` - Get messages
- `POST /api/chat/sessions/:id/messages` - Send message
- `POST /api/ai/sessions` - Create AI chat
- `POST /api/ai/sessions/:id/messages` - Chat with AI

## WebSocket Events

**Connect:** `socket.io-client` with JWT token in auth
**Events:** message:new, user:status, typing:start, typing:stop

## Need Help?

1. Check `README.md` for detailed documentation
2. Check `API_TESTING.md` for API examples
3. Check `FRONTEND_INTEGRATION.md` for React/Next.js integration
4. Check `DEPLOYMENT.md` for production deployment

## Success Checklist

- ✅ Server starts without errors
- ✅ `/health` endpoint returns OK
- ✅ Can login with demo user
- ✅ Database visible in Prisma Studio
- ✅ WebSocket connects (check in frontend)

**You're all set! Start building your chat app! 🎉**
