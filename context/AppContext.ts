import { createContext } from 'react';
import type { User, Match, Notification, ChatChannel, ChatMessage, Team, DisputeEvidence } from '../types';

interface AppContextType {
  user: User | null;
  allUsers: User[];
  matches: Match[];
  notifications: Notification[];
  teams: Team[];
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  updateUser: (updates: Partial<User>) => void;
  updateUserById: (userId: string, updates: Partial<User>) => void;
  login: (user: User) => void;
  logout: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  sendFriendRequest: (toUserId: string) => void;
  acceptFriendRequest: (requesterId: string) => void;
  rejectFriendRequest: (requesterId: string) => void;
  removeFriend: (friendId: string) => void;
  joinTeam: (matchId: string, team: 'A' | 'B') => void;
  channels: ChatChannel[];
  messages: ChatMessage[];
  sendMessage: (channelId: string, content: string) => void;
  markMessagesAsRead: (channelId: string) => void;
  reportMatchResult: (matchId: string, winningTeam: 'A' | 'B') => void;
  disputeMatch: (matchId: string) => void;
  submitDisputeEvidence: (matchId: string, evidence: Omit<DisputeEvidence, 'submittedAt'>) => void;
  createTeam: () => void;
  inviteToTeam: (teamId: string, friendIds: string[]) => void;
  acceptTeamInvite: (teamId: string) => void;
  rejectTeamInvite: (teamId: string) => void;
  rateOpponents: (matchId: string) => void;
  createMatch: (newMatchData: Partial<Match>) => Match | null;
  kickMember: (teamId: string, memberId: string) => void;
  leaveTeam: (teamId: string) => void;
  disbandTeam: (teamId: string) => void;
  isInteractionLocked: boolean;
  joinWithCode: (inviteCode: string) => Match | null;
  inviteToLobby: (matchId: string, inviteeId: string) => void;
  readyUp: (matchId: string) => void;
  startPrivateMatch: (matchId: string) => void;
  resolveMatchAndUnlockPlayers: (matchId: string, updates: Partial<Match>) => void;
  banUser: (userId: string, reason: string, duration: '24_hours' | '7_days' | '30_days' | 'permanent') => void;
}

export const AppContext = createContext<AppContextType>({ 
  user: null, 
  allUsers: [],
  matches: [],
  notifications: [],
  teams: [],
  updateMatch: () => {},
  updateUser: () => {},
  updateUserById: () => {},
  login: () => {},
  logout: () => {},
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
  sendFriendRequest: () => {},
  acceptFriendRequest: () => {},
  rejectFriendRequest: () => {},
  removeFriend: () => {},
  joinTeam: () => {},
  channels: [],
  messages: [],
  sendMessage: () => {},
  markMessagesAsRead: () => {},
  reportMatchResult: () => {},
  disputeMatch: () => {},
  submitDisputeEvidence: () => {},
  createTeam: () => {},
  inviteToTeam: () => {},
  acceptTeamInvite: () => {},
  rejectTeamInvite: () => {},
  rateOpponents: () => {},
  createMatch: () => null,
  kickMember: () => {},
  leaveTeam: () => {},
  disbandTeam: () => {},
  isInteractionLocked: false,
  joinWithCode: () => null,
  inviteToLobby: () => {},
  readyUp: () => {},
  startPrivateMatch: () => {},
  resolveMatchAndUnlockPlayers: () => {},
  banUser: () => {},
});