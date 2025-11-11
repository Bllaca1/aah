import { PrismaClient, UserRole, AccountStatus, MatchStatus, MatchTeamSize, Platform, ServerRegion } from '@prisma/client';
import { hashPassword } from '../../src/services/auth';

const prisma = new PrismaClient();

/**
 * Factory for creating test users
 */
export async function createTestUser(overrides: any = {}) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);

  const hashedPassword = await hashPassword('Password123!');

  const user = await prisma.user.create({
    data: {
      username: overrides.username || `testuser${timestamp}${random}`,
      email: overrides.email || `test${timestamp}${random}@example.com`,
      password: overrides.password || hashedPassword,
      displayName: overrides.displayName || `Test User ${random}`,
      emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : true,
      role: overrides.role || UserRole.USER,
      accountStatus: overrides.accountStatus || AccountStatus.ACTIVE,
      credits: overrides.credits !== undefined ? overrides.credits : 1000,
      eloRating: overrides.eloRating || 1000,
      gamesPlayed: overrides.gamesPlayed || 0,
      gamesWon: overrides.gamesWon || 0,
      gamesLost: overrides.gamesLost || 0,
      goodSportRating: overrides.goodSportRating || 5.0,
      ...overrides,
    },
  });

  return user;
}

/**
 * Factory for creating test games
 */
export async function createTestGame(overrides: any = {}) {
  const game = await prisma.game.create({
    data: {
      name: overrides.name || 'Test Game',
      slug: overrides.slug || 'test-game',
      description: overrides.description || 'A test game',
      iconUrl: overrides.iconUrl || 'https://example.com/icon.png',
      bannerUrl: overrides.bannerUrl || 'https://example.com/banner.png',
      isActive: overrides.isActive !== undefined ? overrides.isActive : true,
      minWager: overrides.minWager || 10,
      maxWager: overrides.maxWager || 1000,
      platformFeePercent: overrides.platformFeePercent || 10,
      ...overrides,
    },
  });

  return game;
}

/**
 * Factory for creating test matches
 */
export async function createTestMatch(creatorId: string, gameId: string, overrides: any = {}) {
  const match = await prisma.match.create({
    data: {
      creatorId,
      gameId,
      wagerAmount: overrides.wagerAmount || 100,
      teamSize: overrides.teamSize || MatchTeamSize.SOLO,
      platform: overrides.platform || Platform.PC,
      serverRegion: overrides.serverRegion || ServerRegion.NA_EAST,
      status: overrides.status || MatchStatus.LOBBY,
      isPrivate: overrides.isPrivate || false,
      requiresVerification: overrides.requiresVerification || false,
      minElo: overrides.minElo || null,
      maxElo: overrides.maxElo || null,
      ...overrides,
    },
  });

  // Create match player entry for creator
  await prisma.matchPlayer.create({
    data: {
      matchId: match.id,
      userId: creatorId,
      team: 'A',
      isReady: false,
    },
  });

  return match;
}

/**
 * Factory for creating test teams
 */
export async function createTestTeam(captainId: string, overrides: any = {}) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);

  const team = await prisma.team.create({
    data: {
      name: overrides.name || `Test Team ${random}`,
      tag: overrides.tag || `TT${random}`,
      captainId,
      description: overrides.description || 'A test team',
      isRecruiting: overrides.isRecruiting !== undefined ? overrides.isRecruiting : true,
      maxMembers: overrides.maxMembers || 5,
      ...overrides,
    },
  });

  // Add captain as team member
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId: captainId,
      role: 'CAPTAIN',
    },
  });

  return team;
}

/**
 * Factory for creating test disputes
 */
export async function createTestDispute(matchId: string, reporterId: string, overrides: any = {}) {
  const dispute = await prisma.dispute.create({
    data: {
      matchId,
      reporterId,
      reason: overrides.reason || 'Test dispute reason',
      evidenceDeadline: overrides.evidenceDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000),
      ...overrides,
    },
  });

  return dispute;
}

/**
 * Factory for creating test transactions
 */
export async function createTestTransaction(userId: string, overrides: any = {}) {
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount: overrides.amount || 100,
      type: overrides.type || 'DEPOSIT',
      description: overrides.description || 'Test transaction',
      balanceAfter: overrides.balanceAfter || 1100,
      ...overrides,
    },
  });

  return transaction;
}

/**
 * Factory for creating test friendships
 */
export async function createTestFriendship(userId1: string, userId2: string) {
  const friendship = await prisma.friendship.create({
    data: {
      userId: userId1,
      friendId: userId2,
    },
  });

  // Create reciprocal friendship
  await prisma.friendship.create({
    data: {
      userId: userId2,
      friendId: userId1,
    },
  });

  return friendship;
}

/**
 * Factory for creating test notifications
 */
export async function createTestNotification(userId: string, overrides: any = {}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: overrides.type || 'FRIEND_REQUEST',
      title: overrides.title || 'Test Notification',
      message: overrides.message || 'This is a test notification',
      isRead: overrides.isRead || false,
      ...overrides,
    },
  });

  return notification;
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  await prisma.messageRead.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatChannel.deleteMany();
  await prisma.disputeEvidence.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.matchPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.teamInvite.deleteMany();
  await prisma.teamElo.deleteMany();
  await prisma.team.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.userElo.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.game.deleteMany();
}

export { prisma };
