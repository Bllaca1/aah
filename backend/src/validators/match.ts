import { z } from 'zod';
import { MatchStatus, MatchTeamSize, Platform, ServerRegion } from '@prisma/client';

/**
 * Validation schemas for match-related operations
 */

// Create match schema
export const createMatchSchema = z.object({
  gameId: z.string().uuid('Invalid game ID'),
  wager: z.number().int().min(0, 'Wager must be non-negative'),
  teamSize: z.nativeEnum(MatchTeamSize, {
    errorMap: () => ({ message: 'Invalid team size' }),
  }),
  region: z.nativeEnum(ServerRegion, {
    errorMap: () => ({ message: 'Invalid region' }),
  }),
  platform: z.nativeEnum(Platform, {
    errorMap: () => ({ message: 'Invalid platform' }),
  }),
  teamAId: z.string().uuid('Invalid team A ID').optional(),
  teamBId: z.string().uuid('Invalid team B ID').optional(),
});

// List matches with filters
export const listMatchesSchema = z.object({
  gameId: z.string().uuid('Invalid game ID').optional(),
  status: z.nativeEnum(MatchStatus).optional(),
  region: z.nativeEnum(ServerRegion).optional(),
  platform: z.nativeEnum(Platform).optional(),
  minWager: z.coerce.number().int().min(0).optional(),
  maxWager: z.coerce.number().int().min(0).optional(),
  teamSize: z.nativeEnum(MatchTeamSize).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Get match by ID
export const getMatchSchema = z.object({
  id: z.string().uuid('Invalid match ID'),
});

// Join match
export const joinMatchSchema = z.object({
  team: z.enum(['A', 'B'], {
    errorMap: () => ({ message: 'Team must be A or B' }),
  }),
});

// Mark ready
export const markReadySchema = z.object({
  ready: z.boolean(),
});

// Report result
export const reportResultSchema = z.object({
  winningTeam: z.enum(['A', 'B'], {
    errorMap: () => ({ message: 'Winning team must be A or B' }),
  }),
  teamAScore: z.number().int().min(0).optional(),
  teamBScore: z.number().int().min(0).optional(),
});

// Create dispute
export const createDisputeSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
  youtubeLink: z.string().url('Invalid YouTube URL').optional(),
});

// Submit evidence
export const submitEvidenceSchema = z.object({
  youtubeLink: z.string().url('YouTube link is required'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type ListMatchesInput = z.infer<typeof listMatchesSchema>;
export type GetMatchInput = z.infer<typeof getMatchSchema>;
export type JoinMatchInput = z.infer<typeof joinMatchSchema>;
export type MarkReadyInput = z.infer<typeof markReadySchema>;
export type ReportResultInput = z.infer<typeof reportResultSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type SubmitEvidenceInput = z.infer<typeof submitEvidenceSchema>;
