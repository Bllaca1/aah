import { z } from 'zod';
import { UserStatus } from '@prisma/client';

/**
 * Validation schemas for user-related operations
 */

// Update user profile
export const updateProfileSchema = z.object({
  status: z.nativeEnum(UserStatus).optional(),
  discordId: z.string().min(1).max(50).optional(),
  fortniteId: z.string().min(1).max(50).optional(),
  cs2Id: z.string().min(1).max(50).optional(),
  brawlhallaId: z.string().min(1).max(50).optional(),
});

// Search users
export const searchUsersSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(50),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Get user by username
export const getUserByUsernameSchema = z.object({
  username: z.string().min(3).max(20),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type GetUserByUsernameInput = z.infer<typeof getUserByUsernameSchema>;
