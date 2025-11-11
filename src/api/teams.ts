import apiClient from './client';
import type { Team, User } from '../types';

export interface CreateTeamData {
  name: string;
  tag: string;
  avatarUrl?: string;
}

export interface UpdateTeamData {
  name?: string;
  tag?: string;
  avatarUrl?: string;
}

export interface InviteUserData {
  userId: string;
}

export interface TeamInvite {
  id: string;
  team: Team;
  invitedUser: User;
  invitedBy: User;
  createdAt: string;
}

/**
 * Create a new team
 * POST /teams
 */
export const createTeam = async (data: CreateTeamData): Promise<Team> => {
  const response = await apiClient.post<Team>('/teams', data);
  return response.data;
};

/**
 * Get team details
 * GET /teams/:id
 */
export const getTeam = async (teamId: string): Promise<Team> => {
  const response = await apiClient.get<Team>(`/teams/${teamId}`);
  return response.data;
};

/**
 * Update team (captain only)
 * PUT /teams/:id
 */
export const updateTeam = async (teamId: string, data: UpdateTeamData): Promise<Team> => {
  const response = await apiClient.put<Team>(`/teams/${teamId}`, data);
  return response.data;
};

/**
 * Invite user to team
 * POST /teams/:id/invite
 */
export const inviteUser = async (teamId: string, data: InviteUserData): Promise<{ message: string }> => {
  const response = await apiClient.post(`/teams/${teamId}/invite`, data);
  return response.data;
};

/**
 * Accept team invite
 * PUT /teams/:id/accept-invite
 */
export const acceptInvite = async (teamId: string): Promise<Team> => {
  const response = await apiClient.put<Team>(`/teams/${teamId}/accept-invite`);
  return response.data;
};

/**
 * Remove team member
 * DELETE /teams/:id/members/:userId
 */
export const removeTeamMember = async (teamId: string, userId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  return response.data;
};

/**
 * Disband team
 * DELETE /teams/:id
 */
export const disbandTeam = async (teamId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/teams/${teamId}`);
  return response.data;
};

/**
 * Get team invites (captain only)
 * GET /teams/:id/invites
 */
export const getTeamInvites = async (teamId: string): Promise<TeamInvite[]> => {
  const response = await apiClient.get<TeamInvite[]>(`/teams/${teamId}/invites`);
  return response.data;
};

/**
 * Get my team invites
 * GET /users/me/team-invites
 */
export const getMyTeamInvites = async (): Promise<TeamInvite[]> => {
  const response = await apiClient.get<TeamInvite[]>('/users/me/team-invites');
  return response.data;
};
