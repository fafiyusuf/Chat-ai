# API Testing Guide

## Using cURL

### 1. Register a new user

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User",
    "username": "testuser"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `accessToken` from the response for the next requests.

### 3. Get current user profile

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Get all users

```bash
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Update profile

```bash
curl -X PATCH http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Updated Name",
    "bio": "This is my bio"
  }'
```

### 6. Update status

```bash
curl -X PATCH http://localhost:3001/api/users/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "AWAY"
  }'
```

### 7. Get chat sessions

```bash
curl http://localhost:3001/api/chat/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Create chat session

```bash
curl -X POST http://localhost:3001/api/chat/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "OTHER_USER_ID"
  }'
```

### 9. Send message

```bash
curl -X POST http://localhost:3001/api/chat/sessions/SESSION_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello there!",
    "type": "TEXT"
  }'
```

### 10. Get session messages

```bash
curl http://localhost:3001/api/chat/sessions/SESSION_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 11. Create AI chat session (Bonus)

```bash
curl -X POST http://localhost:3001/api/ai/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Help with React"
  }'
```

### 12. Send AI message (Bonus)

```bash
curl -X POST http://localhost:3001/api/ai/sessions/AI_SESSION_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Explain React hooks"
  }'
```

## Using Postman

1. Import the collection (create a Postman collection with these endpoints)
2. Set environment variable `baseUrl` to `http://localhost:3001`
3. Set environment variable `token` after login
4. Use `{{baseUrl}}` and `{{token}}` in requests

## Using HTTPie

### Register
```bash
http POST http://localhost:3001/api/auth/register \
  email=test@example.com \
  password=password123 \
  displayName="Test User"
```

### Login
```bash
http POST http://localhost:3001/api/auth/login \
  email=test@example.com \
  password=password123
```

### Get users (with auth)
```bash
http GET http://localhost:3001/api/users \
  "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## WebSocket Testing

### Using Socket.IO Client

```javascript
// test-socket.js
const io = require('socket.io-client');

const token = 'YOUR_ACCESS_TOKEN'; // Get from login

const socket = io('http://localhost:3001', {
  auth: {
    token: token
  }
});

socket.on('connect', () => {
  console.log('✓ Connected to WebSocket');
  
  // Listen for online users
  socket.on('users:online', (users) => {
    console.log('Online users:', users);
  });
  
  // Listen for new messages
  socket.on('message:new', (message) => {
    console.log('New message:', message);
  });
  
  // Listen for user status
  socket.on('user:status', (data) => {
    console.log('User status:', data);
  });
  
  // Send a message after 2 seconds
  setTimeout(() => {
    socket.emit('message:send', {
      sessionId: 'YOUR_SESSION_ID',
      content: 'Test message from socket',
      receiverId: 'RECEIVER_USER_ID'
    });
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

socket.on('disconnect', () => {
  console.log('✗ Disconnected from WebSocket');
});
```

Run with:
```bash
node test-socket.js
```

## Testing Workflow

1. **Setup**
   - Start backend: `npm run dev`
   - Seed database: `npm run prisma:seed`

2. **Authentication**
   - Login with demo user (alice@example.com / password123)
   - Save access token

3. **User Management**
   - Get all users
   - Update your profile
   - Change status

4. **Chat**
   - Get user list
   - Create chat session with another user
   - Send messages
   - Check message history

5. **Real-time**
   - Connect via WebSocket
   - Send messages
   - Observe typing indicators
   - Monitor online status

6. **AI Chat (if configured)**
   - Create AI session
   - Send messages to AI
   - Get responses

## Common Issues

### 401 Unauthorized
- Token expired (tokens last 15 minutes)
- Get new token via `/api/auth/login`

### 404 Not Found
- Check endpoint URL
- Verify IDs exist in database

### 500 Server Error
- Check server logs
- Verify database connection
- Check environment variables
