import { Router } from 'express';
import {
  listMatches,
  getMatch,
  createMatch,
  joinMatch,
  markReady,
  reportResult,
  createDispute,
  submitEvidence,
} from '../controllers/matches';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Match Routes
 */

// Public routes (with optional auth)
router.get('/', listMatches); // GET /matches - List all matches with filters

// Protected routes (require authentication)
router.get('/:id', requireAuth, getMatch); // GET /matches/:id - Get match details
router.post('/', requireAuth, createMatch); // POST /matches - Create new match
router.put('/:id/join', requireAuth, joinMatch); // PUT /matches/:id/join - Join a match
router.put('/:id/ready', requireAuth, markReady); // PUT /matches/:id/ready - Mark ready/not ready
router.put('/:id/report-result', requireAuth, reportResult); // PUT /matches/:id/report-result - Report match result
router.post('/:id/dispute', requireAuth, createDispute); // POST /matches/:id/dispute - Create dispute
router.post('/:id/evidence', requireAuth, submitEvidence); // POST /matches/:id/evidence - Submit evidence

export default router;
