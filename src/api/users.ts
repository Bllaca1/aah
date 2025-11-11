import apiClient from './client';
import type { User, Platform } from '../types';

export interface UpdateProfileData {
  username?: string;
  email?: string;
  avatarUrl?: string;
  linkedAccounts?: {
    discord?: string;
    fortnite?: string;
    cs2?: string;
    brawlhalla?: string;
  };
  primaryGames?: string[];
  platforms?: Platform[];
}

export interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWagered: number;
  totalEarnings: number;
  goodSportRating: number;
  eloByGame: Record<string, number>;
}

export interface SearchUsersParams {
  query: string;
  limit?: number;
  offset?: number;
}

/**
 * Get current user profile
 * GET /users/me
 */
export const getMyProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
};

/**
 * Update current user profile
 * PUT /users/me
 */
export const updateMyProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await apiClient.put<User>('/users/me', data);
  return response.data;
};

/**
 * Get current user detailed stats
 * GET /users/me/stats
 */
export const getMyStats = async (): Promise<UserStats> => {
  const response = await apiClient.get<UserStats>('/users/me/stats');
  return response.data;
};

/**
 * Search users
 * GET /users/search
 */
export const searchUsers = async (params: SearchUsersParams): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users/search', { params });
  return response.data;
};

/**
 * Get user by username
 * GET /users/:username
 */
export const getUserByUsername = async (username: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${username}`);
  return response.data;
};
