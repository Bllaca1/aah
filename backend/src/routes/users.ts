import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  searchUsers,
  getUserByUsername,
  getMyStats,
} from '../controllers/users';
import { getMyTeamInvites } from '../controllers/teams';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * User Routes
 */

// All user routes require authentication
router.get('/me', requireAuth, getMyProfile); // GET /users/me - Get current user profile
router.put('/me', requireAuth, updateMyProfile); // PUT /users/me - Update current user profile
router.get('/me/stats', requireAuth, getMyStats); // GET /users/me/stats - Get detailed stats
router.get('/me/team-invites', requireAuth, getMyTeamInvites); // GET /users/me/team-invites - Get team invites
router.get('/search', requireAuth, searchUsers); // GET /users/search - Search users
router.get('/:username', requireAuth, getUserByUsername); // GET /users/:username - Get user by username

export default router;
