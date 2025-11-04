import type { ComponentType } from 'react';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    AWAY = 'away',
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  elo: number;
  rating: number;
  credits: number;
  email?: string;
  role?: UserRole;
  status: UserStatus;
  friends: string[];
  friendRequests: {
    sent: string[];
    received: string[];
  };
  linkedAccounts: {
    discord: string;
    fortnite?: string;
    cs2?: string;
    brawlhalla?: string;
  };
  teamId?: string | null;
  teamInvites: string[]; // Team IDs
  goodSportRating: number; // Count of 'good sport' ratings received
  totalMatchesRated: number; // Total number of matches where opponents could rate them
}

export interface Team {
  id:string;
  name: string;
  tag: string; // e.g., 'SS' for 'Shadow Syndicate'
  avatarUrl: string;
  captainId: string;
  members: string[]; // User IDs
  elo: number;
  wins: number;
  losses: number;
}


export interface Game {
  id: string;
  name: string;
  imageUrl: string;
  icon?: ComponentType<{ className?: string }>;
}

export enum MatchStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DISPUTED = 'Disputed',
  REFUNDED = 'Refunded',
}

export enum MatchTeamSize {
    SOLO = '1v1',
    TEAM = '5v5',
}

export enum ServerRegion {
    NA_EAST = 'NA East',
    NA_WEST = 'NA West',
    EU = 'Europe',
    ASIA = 'Asia',
}

export interface Match {
  id: string;
  game: Game;
  wager: number;
  teamSize: MatchTeamSize;
  region: ServerRegion;
  status: MatchStatus;
  elo: number;
  teamA: string[]; // User IDs
  teamB: string[]; // User IDs
  prizePool: number;
  createdAt: string; // ISO 8601 timestamp
  goodSportRatingsGiven?: { [raterId: string]: boolean }; // Tracks who has given a rating for this match
  winnerTeam?: 'A' | 'B' | null; // null for draw/refund
  teamAId?: string;
  teamBId?: string;
}

export enum TransactionType {
    DEPOSIT = 'Deposit',
    WITHDRAWAL = 'Withdrawal',
    MATCH_WIN = 'Match Win',
    MATCH_LOSS = 'Match Loss',
    PLATFORM_FEE = 'Platform Fee',
}

export enum TransactionStatus {
    COMPLETED = 'Completed',
    PENDING = 'Pending',
    FAILED = 'Failed',
}

export interface Transaction {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    date: string;
}

export enum NotificationType {
    FRIEND_REQUEST = 'FRIEND_REQUEST',
    FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
    MATCH_INVITE = 'MATCH_INVITE',
    DISPUTE_UPDATE = 'DISPUTE_UPDATE',
    BLOCKED_INTERACTION = 'BLOCKED_INTERACTION',
    GENERIC = 'GENERIC',
    TEAM_INVITE = 'TEAM_INVITE',
    TEAM_INVITE_ACCEPTED = 'TEAM_INVITE_ACCEPTED',
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    read: boolean;
    linkTo?: string;
    sender?: User;
    meta?: {
        teamName?: string;
        teamId?: string;
    }
}

export enum ChannelType {
    DM = 'DM',
    MATCH = 'MATCH',
}

export interface ChatMessage {
    id: string;
    channelId: string;
    senderId: string;
    content: string;
    timestamp: string;
    readBy: string[];
}

export interface ChatChannel {
    id: string; // friend's userId for DM, matchId for MATCH
    type: ChannelType;
    participantIds: string[];
    lastMessage?: ChatMessage;
}