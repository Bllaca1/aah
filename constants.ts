import type { User, Game, Match, Transaction, Notification, ChatMessage, ChatChannel, Team } from './types';
import { MatchStatus, MatchTeamSize, ServerRegion, TransactionType, TransactionStatus, UserRole, NotificationType, UserStatus, ChannelType } from './types';
import { Axe, Bomb, Hammer } from 'lucide-react';

export const GAMES: Game[] = [
  { id: 'fortnite', name: 'Fortnite', imageUrl: 'https://wallpapers.com/images/high/fortnite-2560x1440-trucks-battle-iq0dov5td428g5jb.webp', icon: Axe },
  { id: 'cs2', name: 'CS2', imageUrl: 'https://picsum.photos/seed/cs2/200/300', icon: Bomb },
  { id: 'brawlhalla', name: 'Brawlhalla', imageUrl: 'https://picsum.photos/seed/brawlhalla/200/300', icon: Hammer },
];

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-001',
    name: 'Shadow Syndicate',
    tag: 'SS',
    avatarUrl: `https://api.dicebear.com/8.x/rings/svg?seed=Shadow-Syndicate`,
    captainId: 'user-001',
    members: ['user-001', 'user-004'],
    elo: 2050,
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
    elo: 2300,
    wins: 25,
    losses: 5,
  }
];

export const MOCK_USER: User = {
  id: 'user-001',
  username: 'xX_ShadowGamer_Xx',
  avatarUrl: 'https://i.pravatar.cc/150?u=user-001',
  elo: 1850,
  rating: 100,
  credits: 1250.50,
  role: UserRole.USER,
  status: UserStatus.ONLINE,
  friends: ['user-003', 'user-004', 'user-002'],
  friendRequests: {
    sent: ['user-006'], // Sent to RogueWave
    received: ['user-005'], // Received from LunaTic
  },
  linkedAccounts: {
    discord: 'ShadowGamer#1234',
    fortnite: 'ShadowGamerFN',
  },
  teamId: 'team-001',
  teamInvites: ['team-002'],
  goodSportRating: 48,
  totalMatchesRated: 50,
};

export const MOCK_ADMIN_USER: User = {
  id: 'admin-001',
  username: 'Admin',
  avatarUrl: 'https://i.pravatar.cc/150?u=admin-001',
  elo: 9999,
  rating: 100,
  credits: 99999,
  role: UserRole.ADMIN,
  status: UserStatus.ONLINE,
  email: 'admin@betduel.com',
  friends: [],
  friendRequests: { sent: [], received: [] },
  linkedAccounts: {
    discord: 'Admin#0001',
  },
  teamId: null,
  teamInvites: [],
  goodSportRating: 10,
  totalMatchesRated: 10,
};

const MOCK_PLAYERS_DATA: Omit<User, 'role' | 'email'>[] = [
  { ...MOCK_USER },
  { id: 'user-002', username: 'ViperStrike', avatarUrl: 'https://i.pravatar.cc/150?u=user-002', elo: 1900, rating: 100, credits: 2000, status: UserStatus.ONLINE, friends: ['user-001'], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Viper#5678' }, teamId: 'team-002', teamInvites: [], goodSportRating: 80, totalMatchesRated: 82 },
  { id: 'user-003', username: 'Phoenix_R1s1ng', avatarUrl: 'https://i.pravatar.cc/150?u=user-003', elo: 1750, rating: 100, credits: 800, status: UserStatus.AWAY, friends: ['user-001'], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Phoenix#9012' }, teamId: null, teamInvites: [], goodSportRating: 60, totalMatchesRated: 65 },
  { id: 'user-004', username: 'CyberGladiator', avatarUrl: 'https://i.pravatar.cc/150?u=user-004', elo: 2100, rating: 100, credits: 5000, status: UserStatus.ONLINE, friends: ['user-001'], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'CyberG#3456' }, teamId: 'team-001', teamInvites: [], goodSportRating: 110, totalMatchesRated: 112 },
  { id: 'user-005', username: 'LunaTic', avatarUrl: 'https://i.pravatar.cc/150?u=user-005', elo: 1650, rating: 100, credits: 1500, status: UserStatus.OFFLINE, friends: [], friendRequests: { sent: ['user-001'], received: [] }, linkedAccounts: { discord: 'Luna#1111' }, teamId: null, teamInvites: [], goodSportRating: 45, totalMatchesRated: 50 },
  { id: 'user-006', username: 'RogueWave', avatarUrl: 'https://i.pravatar.cc/150?u=user-006', elo: 2250, rating: 100, credits: 7500, status: UserStatus.ONLINE, friends: [], friendRequests: { sent: [], received: ['user-001'] }, linkedAccounts: { discord: 'Rogue#2222' }, teamId: 'team-002', teamInvites: [], goodSportRating: 95, totalMatchesRated: 100 },
  { id: 'user-007', username: 'ZeroCool', avatarUrl: 'https://i.pravatar.cc/150?u=user-007', elo: 1950, rating: 100, credits: 3000, status: UserStatus.OFFLINE, friends: [], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Zero#3333' }, teamId: null, teamInvites: [], goodSportRating: 88, totalMatchesRated: 90 },
  { id: 'user-008', username: 'Blitz', avatarUrl: 'https://i.pravatar.cc/150?u=user-008', elo: 1800, rating: 100, credits: 1200, status: UserStatus.AWAY, friends: [], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Blitz#4444' }, teamId: null, teamInvites: [], goodSportRating: 72, totalMatchesRated: 75 },
  { id: 'user-009', username: 'GhostRecon', avatarUrl: 'https://i.pravatar.cc/150?u=user-009', elo: 2050, rating: 100, credits: 4000, status: UserStatus.ONLINE, friends: [], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Ghost#7777' }, teamId: null, teamInvites: [], goodSportRating: 101, totalMatchesRated: 105 },
  { id: 'user-010', username: 'Nightshade', avatarUrl: 'https://i.pravatar.cc/150?u=user-010', elo: 1980, rating: 100, credits: 2500, status: UserStatus.ONLINE, friends: [], friendRequests: { sent: [], received: [] }, linkedAccounts: { discord: 'Night#8888' }, teamId: null, teamInvites: [], goodSportRating: 90, totalMatchesRated: 93 },
];

export const ALL_MOCK_USERS: User[] = Array.from(new Map([...MOCK_PLAYERS_DATA, MOCK_ADMIN_USER].map(user => [user.id, user as User])).values());


export const MOCK_MATCHES: Match[] = [
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
    teamAId: 'team-002'
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
  },
  { id: 'match-1', game: GAMES[0], wager: 100, teamSize: MatchTeamSize.SOLO, region: ServerRegion.NA_EAST, status: MatchStatus.OPEN, elo: 1800, teamA: ['user-002'], teamB: [], prizePool: 100, createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), goodSportRatingsGiven: {} },
  { id: 'match-2', game: GAMES[1], wager: 50, teamSize: MatchTeamSize.TEAM, region: ServerRegion.EU, status: MatchStatus.OPEN, elo: 1950, teamA: ['user-004', 'user-008', 'user-002'], teamB: ['user-007', 'user-005'], prizePool: 250, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), goodSportRatingsGiven: {} },
  { id: 'match-3', game: GAMES[0], wager: 250, teamSize: MatchTeamSize.SOLO, region: ServerRegion.NA_WEST, status: MatchStatus.IN_PROGRESS, elo: 2000, teamA: ['user-001'], teamB: ['user-004'], prizePool: 500, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), goodSportRatingsGiven: {} },
  { id: 'match-4', game: GAMES[2], wager: 20, teamSize: MatchTeamSize.SOLO, region: ServerRegion.EU, status: MatchStatus.OPEN, elo: 1700, teamA: ['user-003'], teamB: [], prizePool: 20, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), goodSportRatingsGiven: {} },
  { id: 'match-5', game: GAMES[1], wager: 1000, teamSize: MatchTeamSize.TEAM, region: ServerRegion.NA_EAST, status: MatchStatus.DISPUTED, elo: 2200, teamA: ['user-001', 'user-002'], teamB: ['user-003', 'user-004'], prizePool: 4000, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), goodSportRatingsGiven: {} },
  { id: 'match-6', game: GAMES[0], wager: 50, teamSize: MatchTeamSize.SOLO, region: ServerRegion.ASIA, status: MatchStatus.COMPLETED, elo: 1600, teamA: ['user-001'], teamB: ['user-003'], prizePool: 100, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), goodSportRatingsGiven: { 'user-001': true }, winnerTeam: 'B' },
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
        linkTo: `/users/LunaTic`
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
    { id: 'msg-5', channelId: 'match-3', senderId: 'user-004', content: 'Good luck everyone!', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), readBy: ['user-004', 'user-001'] },
    { id: 'msg-6', channelId: 'match-3', senderId: 'user-001', content: 'You too! Let\'s have a clean game.', timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(), readBy: ['user-001', 'user-004'] },
];

export const MOCK_CHANNELS: ChatChannel[] = [
    { id: 'user-003', type: ChannelType.DM, participantIds: ['user-001', 'user-003'], lastMessage: MOCK_MESSAGES[2] },
    { id: 'user-004', type: ChannelType.DM, participantIds: ['user-001', 'user-004'], lastMessage: MOCK_MESSAGES[3] },
    { id: 'match-3', type: ChannelType.MATCH, participantIds: ['user-001', 'user-004'], lastMessage: MOCK_MESSAGES[5] },
];