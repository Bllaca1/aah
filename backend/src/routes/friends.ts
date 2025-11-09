import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  getSentFriendRequests,
} from '../controllers/social';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Friend/Social Routes
 */

// All friend routes require authentication
router.post('/request', requireAuth, sendFriendRequest); // POST /friends/request - Send friend request
router.put('/accept/:userId', requireAuth, acceptFriendRequest); // PUT /friends/accept/:userId - Accept friend request
router.put('/reject/:userId', requireAuth, rejectFriendRequest); // PUT /friends/reject/:userId - Reject friend request
router.delete('/:friendId', requireAuth, removeFriend); // DELETE /friends/:friendId - Remove friend
router.get('/', requireAuth, getFriends); // GET /friends - Get friends list
router.get('/requests', requireAuth, getFriendRequests); // GET /friends/requests - Get received friend requests
router.get('/requests/sent', requireAuth, getSentFriendRequests); // GET /friends/requests/sent - Get sent friend requests

export default router;
