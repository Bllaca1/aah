import { z } from 'zod';

/**
 * Validation schemas for team-related operations
 */

// Create team schema
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name must be at most 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Team name can only contain letters, numbers, spaces, hyphens, and underscores'),
  tag: z
    .string()
    .min(2, 'Team tag must be at least 2 characters')
    .max(6, 'Team tag must be at most 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Team tag can only contain uppercase letters and numbers'),
});

// Get team by ID
export const getTeamSchema = z.object({
  id: z.string().uuid('Invalid team ID'),
});

// Update team
export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name must be at most 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Team name can only contain letters, numbers, spaces, hyphens, and underscores')
    .optional(),
  tag: z
    .string()
    .min(2, 'Team tag must be at least 2 characters')
    .max(6, 'Team tag must be at most 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Team tag can only contain uppercase letters and numbers')
    .optional(),
});

// Invite user to team
export const inviteUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Accept/reject invite
export const respondToInviteSchema = z.object({
  inviteId: z.string().uuid('Invalid invite ID'),
  accept: z.boolean(),
});

// Remove team member
export const removeTeamMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Disband team
export const disbandTeamSchema = z.object({
  confirmDisbandment: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm team disbandment' }),
  }),
});

// Get team members
export const getTeamMembersSchema = z.object({
  teamId: z.string().uuid('Invalid team ID'),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type GetTeamInput = z.infer<typeof getTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type RespondToInviteInput = z.infer<typeof respondToInviteSchema>;
export type RemoveTeamMemberInput = z.infer<typeof removeTeamMemberSchema>;
export type DisbandTeamInput = z.infer<typeof disbandTeamSchema>;
export type GetTeamMembersInput = z.infer<typeof getTeamMembersSchema>;
