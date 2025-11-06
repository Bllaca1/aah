import type { User, Game, Match, Transaction, Notification, ChatMessage, ChatChannel, Team } from './types';
import { MatchStatus, MatchTeamSize, ServerRegion, TransactionType, TransactionStatus, UserRole, NotificationType, UserStatus, ChannelType } from './types';
import { Axe, Bomb, Hammer } from 'lucide-react';

export const GAMES: Game[] = [
  { id: 'fortnite', name: 'Fortnite', imageUrl: 'https://static.wikia.nocookie.net/fortnite/images/5/52/Battle_Royale_%28Full%29_-_Loading_Screen_-_Fortnite.png/revision/latest?cb=20220617125430', icon: Axe },
  { id: 'cs2', name: 'CS2', imageUrl: 'https://cdn.mos.cms.futurecdn.net/xz2HxeuCGUzmZKoWCdp8JV-650-80.jpg.webp', icon: Bomb },
  { id: 'brawlhalla', name: 'Brawlhalla', imageUrl: 'https://gepig.com/game_cover_bg_1190w/4479.jpg', icon: Hammer },
];

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-001',
    name: 'Shadow Syndicate',
    tag: 'SS',
    avatarUrl: `https://api.dicebear.com/8.x/rings/svg?seed=Shadow-Syndicate`,
    captainId: 'user-001',
    members: ['user-001', 'user-004'],
    elo: { fortnite: 2050, cs2: 1900, brawlhalla: 1800 },
    wins: 12,
    losses: 3,
  },
  {
    id: 'team-002',
    name: 'Viper Protocol',
    tag: 'VPR',
    avatarUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=Viper-Protocol`,
    captainId: 'user-002',
    members: ['user-002', 'user-006'],
    elo: { fortnite: 2100, cs2: 2300, brawlhalla: 2000 },
    wins: 25,
    losses: 5,
  }
];

export const MOCK_USER: User = {
  id: 'user-001',
  username: 'Ismet arifi',
  avatarUrl: 'https://i.pravatar.cc/150?u=ismet-arifi',
  elo: { fortnite: 1850, cs2: 1700, brawlhalla: 1600 },
  rating: 100,
  credits: 1250.50,
  role: UserRole.USER,
  status: UserStatus.ONLINE,
  accountStatus: 'active',
  ban_reason: null,
  ban_expires_at: null,
  friends: ['user-003', 'user-004', 'user-002'],
  friendRequests: {
    sent: ['user-006'], // Sent to Olvi Miriam
    received: ['user-005'], // Received from Ardi Bllaca
  },
  linkedAccounts: {
    discord: 'Ismet#1234',
    fortnite: 'IsmetFN',
  },
  teamId: 'team-001',
  teamInvites: ['team-002'],
  goodSportRating: 48,
  totalMatchesRated: 50,
  isMatchmakingLocked: true,
  primaryGames: ['fortnite', 'cs2'],
  hasCompletedOnboarding: true,
};

export const MOCK_STAFF_USER: User = {
  id: 'admin-001',
  username: 'StaffMember',
  avatarUrl: 'https://i.pravatar.cc/150?u=admin-001',
  elo: { fortnite: 9999, cs2: 9999, brawlhalla: 9999 },
  rating: 100,
  credits: 99999,
  role: UserRole.STAFF,
  status: UserStatus.ONLINE,
  accountStatus: 'active',
  ban_reason: null,
  ban_expires_at: null,
  email: 'staff@betduel.com',
  friends: [],
  friendRequests: { sent: [], received: [] },
  linkedAccounts: {
    discord: 'Staff#0001',
  },
  teamId: null,
  teamInvites: [],
  goodSportRating: 10,
  totalMatchesRated: 10,
  isMatchmakingLocked: false,
  primaryGames: ['fortnite', 'cs2', 'brawlhalla'],
  hasCompletedOnboarding: true,
};

const MOCK_PLAYERS_DATA: Omit<User, 'email'>[] = [
  { ...MOCK_USER },
  { id: 'user-002', username: 'Betim Shaqiri', avatarUrl: 'https://i.pravatar.cc/150?u=betim-shaqiri', elo: { fortnite: 1900, cs2: 2050, brawlhalla: 1800 }, rating: 100, credits: 2000, status: UserStatus.ONLINE, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: ['user-001'], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Betim#5678' }, teamId: 'team-002', teamInvites: [], goodSportRating: 80, totalMatchesRated: 82, isMatchmakingLocked: true, primaryGames: ['cs2', 'brawlhalla'], hasCompletedOnboarding: true, role: UserRole.USER },
  { id: 'user-003', username: 'Shukri Haziri', avatarUrl: 'https://i.pravatar.cc/150?u=shukri-haziri', elo: { fortnite: 1750, cs2: 1680, brawlhalla: 1820 }, rating: 100, credits: 800, status: UserStatus.AWAY, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: ['user-001'], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Shukri#9012' }, teamId: null, teamInvites: [], goodSportRating: 60, totalMatchesRated: 65, isMatchmakingLocked: false, primaryGames: ['brawlhalla'], hasCompletedOnboarding: true, role: UserRole.USER },
  { id: 'user-004', username: 'Bledi Bllaca', avatarUrl: 'https://i.pravatar.cc/150?u=bledi-bllaca', elo: { fortnite: 2100, cs2: 1950, brawlhalla: 1900 }, rating: 100, credits: 5000, status: UserStatus.ONLINE, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: ['user-001'], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Bledi#3456' }, teamId: 'team-001', teamInvites: [], goodSportRating: 110, totalMatchesRated: 112, isMatchmakingLocked: false, primaryGames: ['fortnite'], hasCompletedOnboarding: true, role: UserRole.USER },
  { id: 'user-005', username: 'Ardi Bllaca', avatarUrl: 'https://i.pravatar.cc/150?u=ardi-bllaca', elo: { fortnite: 1650, cs2: 1720, brawlhalla: 1600 }, rating: 100, credits: 1500, status: UserStatus.OFFLINE, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: [], friendRequests: { sent: ['user-001'], received: [] }, linkedAccounts: { discord: 'Ardi#1111' }, teamId: null, teamInvites: [], goodSportRating: 45, totalMatchesRated: 50, isMatchmakingLocked: false, primaryGames: ['cs2'], hasCompletedOnboarding: true, role: UserRole.USER },
  { id: 'user-006', username: 'Olvi Miriam', avatarUrl: 'https://i.pravatar.cc/150?u=olvi-miriam', elo: { fortnite: 2250, cs2: 2400, brawlhalla: 2100 }, rating: 100, credits: 7500, status: UserStatus.ONLINE, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: [], friendRequests: { sent: [], received: ['user-001'] }, linkedAccounts: { discord: 'Olvi#2222' }, teamId: 'team-002', teamInvites: [], goodSportRating: 95, totalMatchesRated: 100, isMatchmakingLocked: false, primaryGames: ['fortnite', 'cs2', 'brawlhalla'], hasCompletedOnboarding: true, role: UserRole.USER },
  { id: 'user-007', username: 'ZeroCool', avatarUrl: 'https://i.pravatar.cc/150?u=user-007', elo: { fortnite: 1950, cs2: 1850, brawlhalla: 2000 }, rating: 100, credits: 3000, status: UserStatus.OFFLINE, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: [], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Zero#3333' }, teamId: null, teamInvites: [], goodSportRating: 88, totalMatchesRated: 90, isMatchmakingLocked: false, primaryGames: ['fortnite', 'brawlhalla'], hasCompletedOnboarding: true, role: UserRole.USER },
  { id: 'user-008', username: 'Blitz', avatarUrl: 'https://i.pravatar.cc/150?u=user-008', elo: { fortnite: 1800, cs2: 1750, brawlhalla: 1850 }, rating: 100, credits: 1200, status: UserStatus.AWAY, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: [], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Blitz#4444' }, teamId: null, teamInvites: [], goodSportRating: 72, totalMatchesRated: 75, isMatchmakingLocked: false, primaryGames: ['cs2'], hasCompletedOnboarding: true, role: UserRole.USER },
  { id: 'user-009', username: 'GhostRecon', avatarUrl: 'https://i.pravatar.cc/150?u=user-009', elo: { fortnite: 2050, cs2: 2100, brawlhalla: 1980 }, rating: 100, credits: 4000, status: UserStatus.ONLINE, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: [], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Ghost#7777' }, teamId: null, teamInvites: [], goodSportRating: 101, totalMatchesRated: 105, isMatchmakingLocked: false, primaryGames: ['fortnite', 'cs2'], hasCompletedOnboarding: true, role: UserRole.USER },
  { id: 'user-010', username: 'Nightshade', avatarUrl: 'https://i.pravatar.cc/150?u=user-010', elo: { fortnite: 1980, cs2: 1990, brawlhalla: 1950 }, rating: 100, credits: 2500, status: UserStatus.ONLINE, accountStatus: 'active', ban_reason: null, ban_expires_at: null, friends: [], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Night#8888' }, teamId: null, teamInvites: [], goodSportRating: 90, totalMatchesRated: 93, isMatchmakingLocked: false, primaryGames: ['cs2', 'brawlhalla'], hasCompletedOnboarding: true, role: UserRole.USER },
];

export const ALL_MOCK_USERS: User[] = Array.from(new Map([...MOCK_PLAYERS_DATA, MOCK_STAFF_USER].map(user => [user.id, user as User])).values());


export const MOCK_MATCHES: Match[] = [
   { 
    id: 'match-disputed-1', 
    game: GAMES[0],
    wager: 100, 
    teamSize: MatchTeamSize.SOLO, 
    region: ServerRegion.NA_EAST, 
    status: MatchStatus.DISPUTED, 
    elo: 1800, 
    teamA: ['user-001'], 
    teamB: ['user-002'],
    prizePool: 200,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
    goodSportRatingsGiven: {},
    privacy: 'public',
    readyPlayers: ['user-001', 'user-002'],
    disputeDetails: {
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours from now
        playerEvidence: {}
    }
  },
  { 
    id: 'match-8', 
    game: GAMES[1],
    wager: 100, 
    teamSize: MatchTeamSize.TEAM, 
    region: ServerRegion.NA_EAST, 
    status: MatchStatus.OPEN, 
    elo: 2200, 
    teamA: ['user-002', 'user-006'], 
    teamB: [],
    prizePool: 200,
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), 
    goodSportRatingsGiven: {},
    teamAId: 'team-002',
    privacy: 'public',
    readyPlayers: [],
  },
  { 
    id: 'match-7', 
    game: GAMES[0],
    wager: 75, 
    teamSize: MatchTeamSize.TEAM, 
    region: ServerRegion.NA_EAST, 
    status: MatchStatus.OPEN, 
    elo: 2000, 
    teamA: ['user-001', 'user-004', 'user-008', 'user-010'], 
    teamB: ['user-003', 'user-005', 'user-007', 'user-009'], 
    prizePool: 600,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), 
    goodSportRatingsGiven: {},
    teamAId: 'team-001',
    privacy: 'public',
    readyPlayers: [],
  },
  { id: 'match-1', game: GAMES[0], wager: 100, teamSize: MatchTeamSize.SOLO, region: ServerRegion.NA_EAST, status: MatchStatus.OPEN, elo: 1800, teamA: ['user-002'], teamB: [], prizePool: 100, createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), goodSportRatingsGiven: {}, privacy: 'public', readyPlayers: [] },
  { id: 'match-2', game: GAMES[1], wager: 50, teamSize: MatchTeamSize.TEAM, region: ServerRegion.EU, status: MatchStatus.OPEN, elo: 1950, teamA: ['user-004', 'user-008', 'user-002'], teamB: ['user-007', 'user-005'], prizePool: 250, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), goodSportRatingsGiven: {}, privacy: 'public', readyPlayers: [] },
  { id: 'match-3', game: GAMES[0], wager: 250, teamSize: MatchTeamSize.SOLO, region: ServerRegion.NA_WEST, status: MatchStatus.COMPLETED, winnerTeam: 'B', elo: 2000, teamA: ['user-001'], teamB: ['user-004'], prizePool: 500, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), goodSportRatingsGiven: {}, privacy: 'public', readyPlayers: ['user-001', 'user-004'] },
  { id: 'match-4', game: GAMES[2], wager: 20, teamSize: MatchTeamSize.SOLO, region: ServerRegion.EU, status: MatchStatus.OPEN, elo: 1700, teamA: ['user-003'], teamB: [], prizePool: 20, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), goodSportRatingsGiven: {}, privacy: 'public', readyPlayers: [] },
  { id: 'match-5', game: GAMES[1], wager: 1000, teamSize: MatchTeamSize.TEAM, region: ServerRegion.NA_EAST, status: MatchStatus.COMPLETED, winnerTeam: 'A', elo: 2200, teamA: ['user-001', 'user-002'], teamB: ['user-003', 'user-004'], prizePool: 4000, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), goodSportRatingsGiven: {}, privacy: 'public', readyPlayers: ['user-001', 'user-002', 'user-003', 'user-004'] },
  { id: 'match-6', game: GAMES[0], wager: 50, teamSize: MatchTeamSize.SOLO, region: ServerRegion.ASIA, status: MatchStatus.COMPLETED, elo: 1600, teamA: ['user-001'], teamB: ['user-003'], prizePool: 100, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), goodSportRatingsGiven: { 'user-001': true }, winnerTeam: 'B', privacy: 'public', readyPlayers: ['user-001', 'user-003'] },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'txn-1', type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED, amount: 500.00, date: '2024-07-20' },
    { id: 'txn-2', type: TransactionType.MATCH_WIN, status: TransactionStatus.COMPLETED, amount: 95.00, date: '2024-07-19' },
    { id: 'txn-3', type: TransactionType.PLATFORM_FEE, status: TransactionStatus.COMPLETED, amount: -5.00, date: '2024-07-19' },
    { id: 'txn-4', type: TransactionType.MATCH_LOSS, status: TransactionStatus.COMPLETED, amount: -20.00, date: '2024-07-18' },
    { id: 'txn-5', type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING, amount: -200.00, date: '2024-07-17' },
    { id: 'txn-6', type: TransactionType.DEPOSIT, status: TransactionStatus.FAILED, amount: 100.00, date: '2024-07-16' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-team-invite-team-002',
        type: NotificationType.TEAM_INVITE,
        message: `invited you to join Viper Protocol.`,
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
        read: false,
        sender: ALL_MOCK_USERS.find(u => u.id === 'user-002'),
        linkTo: '/team',
        meta: {
            teamId: 'team-002',
            teamName: 'Viper Protocol',
        }
    },
    {
        id: 'notif-1',
        type: NotificationType.FRIEND_REQUEST,
        message: 'sent you a friend request.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        read: false,
        sender: ALL_MOCK_USERS.find(u => u.id === 'user-005'),
        linkTo: `/users/Ardi Bllaca`
    },
    {
        id: 'notif-2',
        type: NotificationType.MATCH_INVITE,
        message: 'invited you to a Fortnite match.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false,
        sender: ALL_MOCK_USERS.find(u => u.id === 'user-003'),
        linkTo: '/matches'
    },
    {
        id: 'notif-accepted',
        type: NotificationType.FRIEND_REQUEST_ACCEPTED,
        message: 'accepted your friend request.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        read: true,
        sender: ALL_MOCK_USERS.find(u => u.id === 'user-007'),
        linkTo: '/users/ZeroCool'
    },
    {
        id: 'notif-3',
        type: NotificationType.DISPUTE_UPDATE,
        message: 'An admin has resolved your dispute for match #match-5.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        linkTo: '/matches/match-5'
    },
    {
        id: 'notif-4',
        type: NotificationType.BLOCKED_INTERACTION,
        message: 'A blocked user attempted to contact you.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
    },
     {
        id: 'notif-5',
        type: NotificationType.GENERIC,
        message: 'Welcome to BetDuel! Complete your profile to get started.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        read: true,
        linkTo: '/profile'
    },
];

export const MOCK_MESSAGES: ChatMessage[] = [
    { id: 'msg-1', channelId: 'user-003', senderId: 'user-003', content: 'Hey, you ready for that match later?', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), readBy: ['user-003'] },
    { id: 'msg-2', channelId: 'user-003', senderId: 'user-001', content: 'Yeah, just warming up. You bringing your A-game?', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), readBy: ['user-001', 'user-003'] },
    { id: 'msg-3', channelId: 'user-003', senderId: 'user-003', content: 'Always! Cya in 10.', timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(), readBy: ['user-003', 'user-001'] },
    { id: 'msg-4', channelId: 'user-004', senderId: 'user-004', content: 'GGs last night.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), readBy: ['user-004'] },
];

export const MOCK_CHANNELS: ChatChannel[] = [
    { id: 'user-003', type: ChannelType.DM, participantIds: ['user-001', 'user-003'], lastMessage: MOCK_MESSAGES[2] },
    { id: 'user-004', type: ChannelType.DM, participantIds: ['user-001', 'user-004'], lastMessage: MOCK_MESSAGES[3] },
];