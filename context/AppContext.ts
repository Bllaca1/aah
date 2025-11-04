import { createContext } from 'react';
import type { User, Match, Notification, ChatChannel, ChatMessage, Team } from '../types';

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
  createTeam: (teamData: { name: string; tag: string; avatarUrl?: string }) => void;
  inviteToTeam: (teamId: string, friendIds: string[]) => void;
  acceptTeamInvite: (teamId: string) => void;
  rejectTeamInvite: (teamId: string) => void;
  rateOpponents: (matchId: string) => void;
  createMatch: (newMatchData: Partial<Match>) => void;
  kickMember: (teamId: string, memberId: string) => void;
  leaveTeam: (teamId: string) => void;
  disbandTeam: (teamId: string) => void;
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
  createTeam: () => {},
  inviteToTeam: () => {},
  acceptTeamInvite: () => {},
  rejectTeamInvite: () => {},
  rateOpponents: () => {},
  createMatch: () => {},
  kickMember: () => {},
  leaveTeam: () => {},
  disbandTeam: () => {},
});