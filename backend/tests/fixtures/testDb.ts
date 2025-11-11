import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Clean all test data from the database
 * Order matters due to foreign key constraints
 */
export async function cleanDatabase() {
  const tables = [
    'MessageRead',
    'ChatMessage',
    'ChatChannel',
    'DisputeEvidence',
    'Dispute',
    'MatchPlayer',
    'Match',
    'TeamMember',
    'TeamInvite',
    'TeamElo',
    'Team',
    'Friendship',
    'FriendRequest',
    'Notification',
    'Transaction',
    'UserElo',
    'UserProfile',
    'User',
    'Game',
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (error) {
      // Table might not exist yet, ignore
      console.warn(`Warning: Could not truncate table ${table}`);
    }
  }
}

/**
 * Setup test database - run migrations and clean data
 */
export async function setupTestDb() {
  await cleanDatabase();
}

/**
 * Teardown test database
 */
export async function teardownTestDb() {
  await cleanDatabase();
  await prisma.$disconnect();
}

export { prisma };
