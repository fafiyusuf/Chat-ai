import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      password: hashedPassword,
      displayName: 'Alice Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      bio: 'Software Engineer | Coffee enthusiast ☕',
      status: 'ONLINE',
      authProvider: 'LOCAL',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      password: hashedPassword,
      displayName: 'Bob Smith',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      bio: 'Product Designer | UX/UI Specialist',
      status: 'OFFLINE',
      authProvider: 'LOCAL',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      password: hashedPassword,
      displayName: 'Charlie Brown',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      bio: 'DevOps Engineer | Cloud Architecture',
      status: 'AWAY',
      authProvider: 'LOCAL',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'diana@example.com' },
    update: {},
    create: {
      email: 'diana@example.com',
      username: 'diana',
      password: hashedPassword,
      displayName: 'Diana Prince',
      avatarUrl: 'https://i.pravatar.cc/150?img=4',
      bio: 'Marketing Manager | Content Creator',
      status: 'ONLINE',
      authProvider: 'LOCAL',
    },
  });

  // Create a chat session between Alice and Bob
  const session1 = await prisma.chatSession.create({
    data: {
      users: {
        create: [
          { userId: user1.id },
          { userId: user2.id },
        ],
      },
      messages: {
        create: [
          {
            content: 'Hey Bob! How are you doing?',
            senderId: user1.id,
            receiverId: user2.id,
          },
          {
            content: 'Hi Alice! I\'m doing great, thanks! Working on some new designs.',
            senderId: user2.id,
            receiverId: user1.id,
            isRead: true,
          },
          {
            content: 'That sounds exciting! I\'d love to see them when you\'re ready.',
            senderId: user1.id,
            receiverId: user2.id,
          },
        ],
      },
    },
  });

  // Create a chat session between Alice and Charlie
  const session2 = await prisma.chatSession.create({
    data: {
      users: {
        create: [
          { userId: user1.id },
          { userId: user3.id },
        ],
      },
      messages: {
        create: [
          {
            content: 'Charlie, can you help me with the deployment issue?',
            senderId: user1.id,
            receiverId: user3.id,
          },
          {
            content: 'Sure! What seems to be the problem?',
            senderId: user3.id,
            receiverId: user1.id,
            isRead: true,
          },
        ],
      },
    },
  });

  // Create an AI chat session for Alice (bonus feature)
  const aiSession = await prisma.aIChatSession.create({
    data: {
      userId: user1.id,
      title: 'Help with React Hooks',
      messages: {
        create: [
          {
            role: 'USER',
            content: 'Can you explain how useEffect works in React?',
          },
          {
            role: 'ASSISTANT',
            content: 'useEffect is a React Hook that lets you synchronize a component with an external system. It runs after the component renders and can optionally clean up before the component unmounts or before the effect runs again.',
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log({
    users: [user1, user2, user3, user4],
    sessions: [session1, session2],
    aiSession,
  });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
