import { Router } from 'express';
import {
  createTeam,
  getTeam,
  updateTeam,
  inviteUser,
  acceptInvite,
  removeTeamMember,
  disbandTeam,
  getTeamInvites,
  getMyTeamInvites,
} from '../controllers/teams';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Team Routes
 */

// All team routes require authentication
router.post('/', requireAuth, createTeam); // POST /teams - Create new team
router.get('/:id', requireAuth, getTeam); // GET /teams/:id - Get team details
router.put('/:id', requireAuth, updateTeam); // PUT /teams/:id - Update team (captain only)
router.post('/:id/invite', requireAuth, inviteUser); // POST /teams/:id/invite - Invite user to team
router.put('/:id/accept-invite', requireAuth, acceptInvite); // PUT /teams/:id/accept-invite - Accept team invite
router.delete('/:id/members/:userId', requireAuth, removeTeamMember); // DELETE /teams/:id/members/:userId - Remove member
router.delete('/:id', requireAuth, disbandTeam); // DELETE /teams/:id - Disband team
router.get('/:id/invites', requireAuth, getTeamInvites); // GET /teams/:id/invites - Get team invites (captain only)

export default router;
