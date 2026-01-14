# Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. **Create account** at [Railway](https://railway.app)

2. **Deploy from GitHub:**
   - Connect your GitHub repository
   - Railway will auto-detect Node.js
   - Add environment variables in Railway dashboard

3. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets DATABASE_URL

4. **Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-random-string>
   JWT_REFRESH_SECRET=<generate-random-string>
   FRONTEND_URL=https://your-frontend.vercel.app
   GOOGLE_CLIENT_ID=<optional>
   GOOGLE_CLIENT_SECRET=<optional>
   OPENAI_API_KEY=<optional>
   ```

5. **Deploy:**
   - Railway deploys automatically on push
   - Get your app URL from Railway dashboard

### Option 2: Render

1. **Create account** at [Render](https://render.com)

2. **Create Web Service:**
   - Connect repository
   - Build Command: `cd backend && npm install && npm run build && npm run prisma:generate`
   - Start Command: `cd backend && npm run prisma:push && npm start`
   - Environment: Node

3. **Add PostgreSQL:**
   - Dashboard → New → PostgreSQL
   - Copy Internal Database URL
   - Add to environment as DATABASE_URL

4. **Environment Variables:** (same as Railway)

5. **Deploy:**
   - Render deploys automatically

### Option 3: Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Create app:**
   ```bash
   cd backend
   fly launch
   ```

4. **Add PostgreSQL:**
   ```bash
   fly postgres create
   fly postgres attach <postgres-app-name>
   ```

5. **Set secrets:**
   ```bash
   fly secrets set JWT_SECRET=xxx
   fly secrets set JWT_REFRESH_SECRET=xxx
   fly secrets set FRONTEND_URL=xxx
   ```

6. **Deploy:**
   ```bash
   fly deploy
   ```

## Database Setup - Neon (Recommended)

1. **Create account** at [Neon](https://neon.tech)

2. **Create project:**
   - Choose region closest to your server
   - Select PostgreSQL version

3. **Get connection string:**
   - Copy from Neon dashboard
   - Format: `postgresql://user:pass@host.region.neon.tech/dbname?sslmode=require`

4. **Add to environment:**
   ```
   DATABASE_URL=<your-neon-connection-string>
   ```

5. **Run migrations:**
   ```bash
   npm run prisma:push
   npm run prisma:seed  # Optional: demo data
   ```

## Alternative Database Options

### Supabase
- Free PostgreSQL hosting
- Built-in auth (alternative to JWT)
- Get connection string from dashboard

### Railway PostgreSQL
- Integrated with Railway deployment
- Auto-configured DATABASE_URL

### Traditional PostgreSQL
- DigitalOcean Managed Database
- AWS RDS
- Google Cloud SQL

## Frontend Integration

Update your Next.js frontend:

```typescript
// lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
```

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=https://your-backend.railway.app
```

## Environment Variables Checklist

### Required
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Random string (32+ characters)
- ✅ `JWT_REFRESH_SECRET` - Different random string
- ✅ `FRONTEND_URL` - Your frontend URL

### Optional
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `OPENAI_API_KEY` - For AI chat feature
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Set to 'production'

## Generate Secure Secrets

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

## Post-Deployment Checklist

1. ✅ Database connected and migrations run
2. ✅ Health check passes: `https://your-app.com/health`
3. ✅ Can register new user
4. ✅ Can login
5. ✅ WebSocket connects (check browser console)
6. ✅ CORS allows frontend domain
7. ✅ Environment variables set correctly

## Testing Production

```bash
# Health check
curl https://your-app.com/health

# Register
curl -X POST https://your-app.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST https://your-app.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Monitoring & Logs

### Railway
- View logs in dashboard
- Auto-scaling available

### Render
- Logs tab in dashboard
- Set up alerts

### Fly.io
```bash
fly logs
fly status
```

## Performance Optimization

1. **Enable compression:**
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Add caching headers:**
   ```typescript
   app.use((req, res, next) => {
     res.set('Cache-Control', 'public, max-age=300');
     next();
   });
   ```

3. **Database connection pooling:**
   - Neon: Built-in pooling
   - Add `?connection_limit=5` to DATABASE_URL

4. **Rate limiting:**
   - Already configured in server.ts
   - Adjust limits in config

## Scaling

### Horizontal Scaling
- Railway: Auto-scaling
- Render: Upgrade plan
- Fly.io: `fly scale count 2`

### Database
- Neon: Auto-scaling storage
- Add read replicas for heavy read loads

### WebSocket
- Use Redis adapter for multiple instances:
  ```typescript
  import { createAdapter } from '@socket.io/redis-adapter';
  io.adapter(createAdapter(redisClient));
  ```

## Troubleshooting

### Database Connection Failed
- Check DATABASE_URL format
- Verify network access
- Ensure SSL mode enabled

### CORS Errors
- Update FRONTEND_URL in environment
- Check CORS middleware configuration

### WebSocket Connection Failed
- Verify WS_URL in frontend
- Check firewall/load balancer settings
- Ensure WebSocket protocol enabled

### High Memory Usage
- Reduce Prisma connection pool
- Add memory limits to container
- Monitor with `NODE_OPTIONS=--max-old-space-size=512`

## SSL/HTTPS

Most platforms provide automatic SSL:
- Railway: ✅ Automatic
- Render: ✅ Automatic
- Fly.io: ✅ Automatic

For custom domains, add in platform settings.

## Backup & Recovery

### Automated Backups
- Neon: Daily backups included
- Railway: Database snapshots
- Render: Backup add-on

### Manual Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Cost Estimates

### Free Tier
- **Railway**: $5 credit/month (enough for small apps)
- **Render**: Free tier available
- **Neon**: Free tier with 0.5GB storage
- **Vercel** (frontend): Free tier generous

### Production (~$15-30/month)
- Backend hosting: $7-15
- Database: $0-10
- Domain: $1-3/month

## Support & Resources

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
