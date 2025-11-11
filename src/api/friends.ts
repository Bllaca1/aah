import apiClient from './client';
import type { User } from '../types';

export interface SendFriendRequestData {
  recipientId: string;
}

export interface FriendRequest {
  id: string;
  sender: User;
  recipient: User;
  createdAt: string;
}

/**
 * Send friend request
 * POST /friends/request
 */
export const sendFriendRequest = async (data: SendFriendRequestData): Promise<{ message: string }> => {
  const response = await apiClient.post('/friends/request', data);
  return response.data;
};

/**
 * Accept friend request
 * PUT /friends/accept/:userId
 */
export const acceptFriendRequest = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient.put(`/friends/accept/${userId}`);
  return response.data;
};

/**
 * Reject friend request
 * PUT /friends/reject/:userId
 */
export const rejectFriendRequest = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient.put(`/friends/reject/${userId}`);
  return response.data;
};

/**
 * Remove friend
 * DELETE /friends/:friendId
 */
export const removeFriend = async (friendId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/friends/${friendId}`);
  return response.data;
};

/**
 * Get friends list
 * GET /friends
 */
export const getFriends = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/friends');
  return response.data;
};

/**
 * Get received friend requests
 * GET /friends/requests
 */
export const getFriendRequests = async (): Promise<FriendRequest[]> => {
  const response = await apiClient.get<FriendRequest[]>('/friends/requests');
  return response.data;
};

/**
 * Get sent friend requests
 * GET /friends/requests/sent
 */
export const getSentFriendRequests = async (): Promise<FriendRequest[]> => {
  const response = await apiClient.get<FriendRequest[]>('/friends/requests/sent');
  return response.data;
};
