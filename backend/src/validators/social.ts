import { z } from 'zod';

/**
 * Validation schemas for social/friend-related operations
 */

// Send friend request
export const sendFriendRequestSchema = z.object({
  friendId: z.string().uuid('Invalid user ID'),
});

// Accept friend request
export const acceptFriendRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Remove friend
export const removeFriendSchema = z.object({
  friendId: z.string().uuid('Invalid user ID'),
});

// Get friends list (optional filters)
export const getFriendsSchema = z.object({
  status: z.enum(['online', 'offline', 'all']).default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type AcceptFriendRequestInput = z.infer<typeof acceptFriendRequestSchema>;
export type RemoveFriendInput = z.infer<typeof removeFriendSchema>;
export type GetFriendsInput = z.infer<typeof getFriendsSchema>;
