import apiClient from './client';
import type { Match, MatchStatus, MatchTeamSize, Platform, ServerRegion, DisputeEvidence } from '../types';

export interface CreateMatchData {
  gameId: string;
  wager: number;
  teamSize: MatchTeamSize;
  region: ServerRegion;
  platform: Platform;
  privacy?: 'public' | 'private';
  inviteCode?: string;
  elo?: number;
}

export interface JoinMatchData {
  team: 'A' | 'B';
}

export interface MarkReadyData {
  ready: boolean;
}

export interface ReportResultData {
  winningTeam: 'A' | 'B';
}

export interface CreateDisputeData {
  reason: string;
}

export interface SubmitEvidenceData {
  youtubeLink: string;
  message: string;
}

export interface ListMatchesParams {
  status?: MatchStatus;
  gameId?: string;
  region?: ServerRegion;
  platform?: Platform;
  minWager?: number;
  maxWager?: number;
  teamSize?: MatchTeamSize;
  limit?: number;
  offset?: number;
}

/**
 * List all matches with optional filters
 * GET /matches
 */
export const listMatches = async (params?: ListMatchesParams): Promise<Match[]> => {
  const response = await apiClient.get<Match[]>('/matches', { params });
  return response.data;
};

/**
 * Get match details
 * GET /matches/:id
 */
export const getMatch = async (matchId: string): Promise<Match> => {
  const response = await apiClient.get<Match>(`/matches/${matchId}`);
  return response.data;
};

/**
 * Create a new match
 * POST /matches
 */
export const createMatch = async (data: CreateMatchData): Promise<Match> => {
  const response = await apiClient.post<Match>('/matches', data);
  return response.data;
};

/**
 * Join a match
 * PUT /matches/:id/join
 */
export const joinMatch = async (matchId: string, data: JoinMatchData): Promise<Match> => {
  const response = await apiClient.put<Match>(`/matches/${matchId}/join`, data);
  return response.data;
};

/**
 * Mark player as ready/not ready
 * PUT /matches/:id/ready
 */
export const markReady = async (matchId: string, data: MarkReadyData): Promise<Match> => {
  const response = await apiClient.put<Match>(`/matches/${matchId}/ready`, data);
  return response.data;
};

/**
 * Report match result
 * PUT /matches/:id/report-result
 */
export const reportResult = async (matchId: string, data: ReportResultData): Promise<Match> => {
  const response = await apiClient.put<Match>(`/matches/${matchId}/report-result`, data);
  return response.data;
};

/**
 * Create a dispute for a match
 * POST /matches/:id/dispute
 */
export const createDispute = async (matchId: string, data: CreateDisputeData): Promise<Match> => {
  const response = await apiClient.post<Match>(`/matches/${matchId}/dispute`, data);
  return response.data;
};

/**
 * Submit evidence for a dispute
 * POST /matches/:id/evidence
 */
export const submitEvidence = async (matchId: string, data: SubmitEvidenceData): Promise<Match> => {
  const response = await apiClient.post<Match>(`/matches/${matchId}/evidence`, data);
  return response.data;
};
