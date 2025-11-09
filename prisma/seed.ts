import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  console.log('Deleting messageReads...');
  await prisma.messageRead.deleteMany();
  console.log('Deleting chatMessages...');
  await prisma.chatMessage.deleteMany();
  console.log('Deleting chatChannels...');
  await prisma.chatChannel.deleteMany();
  console.log('Deleting notifications...');
  await prisma.notification.deleteMany();
  console.log('Deleting transactions...');
  await prisma.transaction.deleteMany();
  console.log('Deleting teamInvites...');
  await prisma.teamInvite.deleteMany();
  console.log('Deleting friendRequests...');
  await prisma.friendRequest.deleteMany();
  console.log('Deleting friendships...');
  await prisma.friendship.deleteMany();
  console.log('Deleting disputeEvidence...');
  await prisma.disputeEvidence.deleteMany();
  console.log('Deleting disputes...');
  await prisma.dispute.deleteMany();
  console.log('Deleting matchPlayers...');
  await prisma.matchPlayer.deleteMany();
  console.log('Deleting matches...');
  await prisma.match.deleteMany();
  console.log('Deleting teamElo...');
  await prisma.teamElo.deleteMany();
  console.log('Deleting teamMembers...');
  await prisma.teamMember.deleteMany();
  console.log('Deleting teams...');
  await prisma.team.deleteMany();
  console.log('Deleting userElo...');
  await prisma.userElo.deleteMany();
  console.log('Deleting userProfiles...');
  await prisma.userProfile.deleteMany();
  console.log('Deleting users...');
  await prisma.user.deleteMany();
  console.log('Deleting games...');
  await prisma.game.deleteMany();
  console.log('✅ Cleanup complete');

  // Seed Games
  console.log('🎮 Seeding games...');
  const games = [
    { id: 'fortnite', name: 'Fortnite', imageUrl: 'https://static.wikia.nocookie.net/fortnite/images/5/52/Battle_Royale_%28Full%29_-_Loading_Screen_-_Fortnite.png/revision/latest?cb=20220617125430' },
    { id: 'cs2', name: 'CS2', imageUrl: 'https://cdn.mos.cms.futurecdn.net/xz2HxeuCGUzmZKoWCdp8JV-650-80.jpg.webp' },
    { id: 'brawlhalla', name: 'Brawlhalla', imageUrl: 'https://gepig.com/game_cover_bg_1190w/4479.jpg' },
    { id: 'fc25', name: 'FC 25', imageUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/2731110/header.jpg?t=1721245086' },
    { id: 'nba2k26', name: 'NBA 2K26', imageUrl: 'https://cdn1.dotesports.com/wp-content/uploads/2024/07/nba-2k25-cover-athlete.png' },
    { id: 'cod', name: 'Call of Duty', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6efk.png' },
    { id: 'ufc5', name: 'UFC 5', imageUrl: 'https://media.contentapi.ea.com/content/dam/ea/ufc/ufc-5/common/ufc5-keyart-1x1.jpg.adapt.crop1x1.767p.jpg' },
    { id: 'valorant', name: 'Valorant', imageUrl: 'https://images.prismic.io/play-valorant/56d023f8-1372-4753-9366-1c881c1955b2_VALORANT_hero-banner_2023_16x9_E7-1_web.jpg?auto=compress,format' },
    { id: 'tekken8', name: 'Tekken 8', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c9/Tekken_8_cover_art.jpg' },
    { id: 'rocketleague', name: 'Rocket League', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Rocket_League_coverart.jpg/640px-Rocket_League_coverart.jpg' },
    { id: 'clashroyale', name: 'Clash Royale', imageUrl: 'https://supercell.com/images/181a1be5b4827059a4c82c61141a05c1/og_clashroyale.jpg' },
  ];

  for (const game of games) {
    await prisma.game.create({ data: game });
  }
  console.log(`✅ Created ${games.length} games`);

  // Seed Users
  console.log('👥 Seeding users...');

  // Create staff user
  const staffUser = await prisma.user.create({
    data: {
      id: 'admin-001',
      username: 'StaffMember',
      email: 'staff@betduel.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin-001',
      rating: 100,
      credits: 99999,
      role: 'STAFF',
      status: 'ONLINE',
      accountStatus: 'ACTIVE',
      goodSportRating: 10,
      totalMatchesRated: 10,
      isMatchmakingLocked: false,
      primaryGames: ['fortnite', 'cs2', 'brawlhalla'],
      platforms: ['PC'],
      hasCompletedOnboarding: true,
    },
  });

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      id: 'user-001',
      username: 'Ismet arifi',
      avatarUrl: 'https://i.pravatar.cc/150?u=ismet-arifi',
      rating: 100,
      credits: 1250.50,
      role: 'USER',
      status: 'ONLINE',
      accountStatus: 'ACTIVE',
      goodSportRating: 48,
      totalMatchesRated: 50,
      isMatchmakingLocked: true,
      primaryGames: ['fortnite', 'cs2'],
      platforms: ['PC', 'PLAYSTATION'],
      hasCompletedOnboarding: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user-002',
      username: 'Betim Shaqiri',
      avatarUrl: 'https://i.pravatar.cc/150?u=betim-shaqiri',
      rating: 100,
      credits: 2000,
      role: 'USER',
      status: 'ONLINE',
      accountStatus: 'ACTIVE',
      goodSportRating: 80,
      totalMatchesRated: 82,
      isMatchmakingLocked: true,
      primaryGames: ['cs2', 'brawlhalla'],
      platforms: ['XBOX', 'PLAYSTATION'],
      hasCompletedOnboarding: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'user-003',
      username: 'Shukri Haziri',
      avatarUrl: 'https://i.pravatar.cc/150?u=shukri-haziri',
      rating: 100,
      credits: 800,
      role: 'USER',
      status: 'AWAY',
      accountStatus: 'ACTIVE',
      goodSportRating: 60,
      totalMatchesRated: 65,
      isMatchmakingLocked: false,
      primaryGames: ['brawlhalla'],
      platforms: ['PC'],
      hasCompletedOnboarding: true,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      id: 'user-004',
      username: 'Bledi Bllaca',
      avatarUrl: 'https://i.pravatar.cc/150?u=bledi-bllaca',
      rating: 100,
      credits: 5000,
      role: 'USER',
      status: 'ONLINE',
      accountStatus: 'ACTIVE',
      goodSportRating: 110,
      totalMatchesRated: 112,
      isMatchmakingLocked: false,
      primaryGames: ['fortnite'],
      platforms: ['PC'],
      hasCompletedOnboarding: true,
    },
  });

  console.log('✅ Created 4 test users + 1 staff user');

  // Seed User Profiles
  console.log('📝 Seeding user profiles...');
  await prisma.userProfile.create({
    data: {
      userId: user1.id,
      discordId: 'Ismet#1234',
      fortniteId: 'IsmetFN',
    },
  });

  await prisma.userProfile.create({
    data: {
      userId: user2.id,
      discordId: 'Betim#5678',
    },
  });

  await prisma.userProfile.create({
    data: {
      userId: staffUser.id,
      discordId: 'Staff#0001',
    },
  });

  console.log('✅ Created user profiles');

  // Seed User Elo
  console.log('📊 Seeding user ELO ratings...');
  const eloData = [
    { userId: user1.id, gameId: 'fortnite', elo: 1850 },
    { userId: user1.id, gameId: 'cs2', elo: 1700 },
    { userId: user1.id, gameId: 'brawlhalla', elo: 1600 },
    { userId: user2.id, gameId: 'fortnite', elo: 1900 },
    { userId: user2.id, gameId: 'cs2', elo: 2050 },
    { userId: user2.id, gameId: 'brawlhalla', elo: 1800 },
    { userId: user3.id, gameId: 'fortnite', elo: 1750 },
    { userId: user3.id, gameId: 'cs2', elo: 1680 },
    { userId: user3.id, gameId: 'brawlhalla', elo: 1820 },
    { userId: user4.id, gameId: 'fortnite', elo: 2100 },
    { userId: user4.id, gameId: 'cs2', elo: 1950 },
    { userId: user4.id, gameId: 'brawlhalla', elo: 1900 },
    { userId: staffUser.id, gameId: 'fortnite', elo: 9999 },
    { userId: staffUser.id, gameId: 'cs2', elo: 9999 },
    { userId: staffUser.id, gameId: 'brawlhalla', elo: 9999 },
  ];

  for (const elo of eloData) {
    await prisma.userElo.create({ data: elo });
  }

  console.log(`✅ Created ${eloData.length} ELO entries`);

  // Seed Teams
  console.log('👥 Seeding teams...');
  const team1 = await prisma.team.create({
    data: {
      id: 'team-001',
      name: 'Shadow Syndicate',
      tag: 'SS',
      avatarUrl: 'https://api.dicebear.com/8.x/rings/svg?seed=Shadow-Syndicate',
      captainId: user1.id,
      wins: 12,
      losses: 3,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      id: 'team-002',
      name: 'Viper Protocol',
      tag: 'VPR',
      avatarUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=Viper-Protocol',
      captainId: user2.id,
      wins: 25,
      losses: 5,
    },
  });

  console.log('✅ Created 2 teams');

  // Seed Team Members
  console.log('👥 Seeding team members...');
  await prisma.teamMember.createMany({
    data: [
      { teamId: team1.id, userId: user1.id },
      { teamId: team1.id, userId: user4.id },
      { teamId: team2.id, userId: user2.id },
    ],
  });

  console.log('✅ Created team members');

  // Seed Team Elo
  console.log('📊 Seeding team ELO ratings...');
  const teamEloData = [
    { teamId: team1.id, gameId: 'fortnite', elo: 2050 },
    { teamId: team1.id, gameId: 'cs2', elo: 1900 },
    { teamId: team1.id, gameId: 'brawlhalla', elo: 1800 },
    { teamId: team2.id, gameId: 'fortnite', elo: 2100 },
    { teamId: team2.id, gameId: 'cs2', elo: 2300 },
    { teamId: team2.id, gameId: 'brawlhalla', elo: 2000 },
  ];

  for (const teamElo of teamEloData) {
    await prisma.teamElo.create({ data: teamElo });
  }

  console.log(`✅ Created ${teamEloData.length} team ELO entries`);

  // Seed Friendships
  console.log('🤝 Seeding friendships...');
  await prisma.friendship.createMany({
    data: [
      { userId: user1.id, friendId: user3.id },
      { userId: user3.id, friendId: user1.id },
      { userId: user1.id, friendId: user4.id },
      { userId: user4.id, friendId: user1.id },
      { userId: user1.id, friendId: user2.id },
      { userId: user2.id, friendId: user1.id },
    ],
  });

  console.log('✅ Created friendships');

  // Seed Friend Requests
  console.log('📩 Seeding friend requests...');
  await prisma.friendRequest.createMany({
    data: [
      { senderId: user3.id, receiverId: user1.id, status: 'pending' },
    ],
  });

  console.log('✅ Created friend requests');

  // Seed Matches
  console.log('🎯 Seeding matches...');
  const match1 = await prisma.match.create({
    data: {
      id: 'match-valorant-1',
      gameId: 'valorant',
      wager: 250,
      teamSize: 'TEAM',
      region: 'EU',
      status: 'IN_PROGRESS',
      elo: 2100,
      prizePool: 1000,
      platform: 'PC',
      privacy: 'public',
      teamAId: team1.id,
      teamBId: team2.id,
    },
  });

  const match2 = await prisma.match.create({
    data: {
      id: 'match-fc25-1',
      gameId: 'fc25',
      wager: 50,
      teamSize: 'SOLO',
      region: 'NA_WEST',
      status: 'COMPLETED',
      winnerTeam: 'A',
      elo: 1750,
      prizePool: 100,
      platform: 'PLAYSTATION',
      privacy: 'public',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
    },
  });

  const match3 = await prisma.match.create({
    data: {
      id: 'match-disputed-1',
      gameId: 'fortnite',
      wager: 100,
      teamSize: 'SOLO',
      region: 'NA_EAST',
      status: 'DISPUTED',
      elo: 1800,
      prizePool: 200,
      platform: 'PC',
      privacy: 'public',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  });

  console.log('✅ Created 3 sample matches');

  // Seed Match Players
  console.log('🎮 Seeding match players...');
  await prisma.matchPlayer.createMany({
    data: [
      { matchId: match1.id, userId: user1.id, team: 'A', isReady: true },
      { matchId: match1.id, userId: user4.id, team: 'A', isReady: true },
      { matchId: match1.id, userId: user2.id, team: 'B', isReady: true },
      { matchId: match2.id, userId: user3.id, team: 'A', isReady: true },
      { matchId: match3.id, userId: user1.id, team: 'A', isReady: true },
      { matchId: match3.id, userId: user2.id, team: 'B', isReady: true },
    ],
  });

  console.log('✅ Created match players');

  // Seed Dispute
  console.log('⚖️ Seeding disputes...');
  const dispute = await prisma.dispute.create({
    data: {
      matchId: match3.id,
      initiatorId: user1.id,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  console.log('✅ Created dispute');

  // Seed Transactions
  console.log('💰 Seeding transactions...');
  await prisma.transaction.createMany({
    data: [
      { userId: user1.id, type: 'DEPOSIT', status: 'COMPLETED', amount: 500.00, createdAt: new Date('2024-07-20') },
      { userId: user1.id, type: 'MATCH_WIN', status: 'COMPLETED', amount: 95.00, createdAt: new Date('2024-07-19') },
      { userId: user1.id, type: 'PLATFORM_FEE', status: 'COMPLETED', amount: -5.00, createdAt: new Date('2024-07-19') },
      { userId: user1.id, type: 'MATCH_LOSS', status: 'COMPLETED', amount: -20.00, createdAt: new Date('2024-07-18') },
      { userId: user1.id, type: 'WITHDRAWAL', status: 'PENDING', amount: -200.00, createdAt: new Date('2024-07-17') },
      { userId: user1.id, type: 'DEPOSIT', status: 'FAILED', amount: 100.00, createdAt: new Date('2024-07-16') },
    ],
  });

  console.log('✅ Created 6 transactions');

  // Seed Notifications
  console.log('🔔 Seeding notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        type: 'TEAM_INVITE',
        message: 'invited you to join Viper Protocol.',
        read: false,
        linkTo: '/team',
        senderId: user2.id,
        metadata: { teamId: team2.id, teamName: 'Viper Protocol' },
        createdAt: new Date(Date.now() - 1000 * 60 * 2),
      },
      {
        userId: user1.id,
        type: 'FRIEND_REQUEST',
        message: 'sent you a friend request.',
        read: false,
        senderId: user3.id,
        linkTo: '/users/Shukri Haziri',
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        userId: user1.id,
        type: 'MATCH_INVITE',
        message: 'invited you to a Fortnite match.',
        read: false,
        senderId: user3.id,
        linkTo: '/matches',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        userId: user1.id,
        type: 'DISPUTE_UPDATE',
        message: 'An admin has resolved your dispute for match #match-5.',
        read: false,
        linkTo: '/matches/match-5',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        userId: user1.id,
        type: 'GENERIC',
        message: 'Welcome to BetDuel! Complete your profile to get started.',
        read: true,
        linkTo: '/profile',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
    ],
  });

  console.log('✅ Created 5 notifications');

  // Seed Chat Channels
  console.log('💬 Seeding chat channels...');
  const channel1 = await prisma.chatChannel.create({
    data: {
      id: 'channel-user-003',
      type: 'DM',
      participants: {
        connect: [{ id: user1.id }, { id: user3.id }],
      },
    },
  });

  const channel2 = await prisma.chatChannel.create({
    data: {
      id: 'channel-user-004',
      type: 'DM',
      participants: {
        connect: [{ id: user1.id }, { id: user4.id }],
      },
    },
  });

  console.log('✅ Created 2 chat channels');

  // Seed Chat Messages
  console.log('💬 Seeding chat messages...');
  const msg1 = await prisma.chatMessage.create({
    data: {
      id: 'msg-1',
      channelId: channel1.id,
      senderId: user3.id,
      content: 'Hey, you ready for that match later?',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    },
  });

  const msg2 = await prisma.chatMessage.create({
    data: {
      id: 'msg-2',
      channelId: channel1.id,
      senderId: user1.id,
      content: 'Yeah, just warming up. You bringing your A-game?',
      createdAt: new Date(Date.now() - 1000 * 60 * 8),
    },
  });

  const msg3 = await prisma.chatMessage.create({
    data: {
      id: 'msg-3',
      channelId: channel1.id,
      senderId: user3.id,
      content: 'Always! Cya in 10.',
      createdAt: new Date(Date.now() - 1000 * 60 * 7),
    },
  });

  const msg4 = await prisma.chatMessage.create({
    data: {
      id: 'msg-4',
      channelId: channel2.id,
      senderId: user4.id,
      content: 'GGs last night.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  });

  console.log('✅ Created 4 chat messages');

  // Seed Message Reads
  console.log('✉️ Seeding message reads...');
  await prisma.messageRead.createMany({
    data: [
      { messageId: msg1.id, userId: user3.id },
      { messageId: msg2.id, userId: user1.id },
      { messageId: msg2.id, userId: user3.id },
      { messageId: msg3.id, userId: user3.id },
      { messageId: msg3.id, userId: user1.id },
      { messageId: msg4.id, userId: user4.id },
    ],
  });

  console.log('✅ Created message reads');

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
