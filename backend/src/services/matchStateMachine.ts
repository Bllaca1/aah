import { MatchStatus } from '@prisma/client';

/**
 * Match Status State Machine
 * Defines valid state transitions for matches to ensure data integrity
 */

export interface StateTransition {
  from: MatchStatus;
  to: MatchStatus;
  condition?: string;
}

// Valid state transitions for matches
export const VALID_TRANSITIONS: StateTransition[] = [
  // Initial state: LOBBY -> OPEN (when match is created and ready for players)
  { from: 'LOBBY' as MatchStatus, to: 'OPEN' as MatchStatus },

  // OPEN -> IN_PROGRESS (when both teams are ready)
  { from: 'OPEN' as MatchStatus, to: 'IN_PROGRESS' as MatchStatus, condition: 'Both teams ready' },

  // OPEN -> LOBBY (if a player leaves before match starts)
  { from: 'OPEN' as MatchStatus, to: 'LOBBY' as MatchStatus },

  // IN_PROGRESS -> COMPLETED (when result is reported and both teams agree)
  { from: 'IN_PROGRESS' as MatchStatus, to: 'COMPLETED' as MatchStatus, condition: 'Result confirmed' },

  // IN_PROGRESS -> DISPUTED (when result is contested)
  { from: 'IN_PROGRESS' as MatchStatus, to: 'DISPUTED' as MatchStatus, condition: 'Result disputed' },

  // DISPUTED -> AWAITING_OPPONENT_EVIDENCE (when initial evidence is submitted)
  { from: 'DISPUTED' as MatchStatus, to: 'AWAITING_OPPONENT_EVIDENCE' as MatchStatus },

  // AWAITING_OPPONENT_EVIDENCE -> AWAITING_ADMIN_REVIEW (when opponent submits evidence or deadline passes)
  { from: 'AWAITING_OPPONENT_EVIDENCE' as MatchStatus, to: 'AWAITING_ADMIN_REVIEW' as MatchStatus },

  // DISPUTED -> AWAITING_ADMIN_REVIEW (can skip opponent evidence in some cases)
  { from: 'DISPUTED' as MatchStatus, to: 'AWAITING_ADMIN_REVIEW' as MatchStatus },

  // AWAITING_ADMIN_REVIEW -> COMPLETED (admin resolves in favor of winner)
  { from: 'AWAITING_ADMIN_REVIEW' as MatchStatus, to: 'COMPLETED' as MatchStatus, condition: 'Admin approved' },

  // AWAITING_ADMIN_REVIEW -> REFUNDED (admin decides to refund both teams)
  { from: 'AWAITING_ADMIN_REVIEW' as MatchStatus, to: 'REFUNDED' as MatchStatus, condition: 'Admin refunded' },

  // Any non-completed match can be refunded by admin
  { from: 'LOBBY' as MatchStatus, to: 'REFUNDED' as MatchStatus, condition: 'Admin action' },
  { from: 'OPEN' as MatchStatus, to: 'REFUNDED' as MatchStatus, condition: 'Admin action' },
  { from: 'IN_PROGRESS' as MatchStatus, to: 'REFUNDED' as MatchStatus, condition: 'Admin action' },
  { from: 'DISPUTED' as MatchStatus, to: 'REFUNDED' as MatchStatus, condition: 'Admin action' },
];

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: MatchStatus, to: MatchStatus): boolean {
  return VALID_TRANSITIONS.some(
    (transition) => transition.from === from && transition.to === to
  );
}

/**
 * Get all valid next states from current state
 */
export function getValidNextStates(currentState: MatchStatus): MatchStatus[] {
  return VALID_TRANSITIONS
    .filter((transition) => transition.from === currentState)
    .map((transition) => transition.to);
}

/**
 * Validate and return transition or throw error
 */
export function validateTransition(
  from: MatchStatus,
  to: MatchStatus
): { valid: boolean; error?: string } {
  if (!isValidTransition(from, to)) {
    const validStates = getValidNextStates(from);
    return {
      valid: false,
      error: `Invalid state transition from ${from} to ${to}. Valid transitions: ${validStates.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * State machine rules for specific match operations
 */
export const MatchStateRules = {
  /**
   * Can a player join this match?
   */
  canJoin(status: MatchStatus): boolean {
    return status === 'LOBBY' || status === 'OPEN';
  },

  /**
   * Can a player mark themselves as ready?
   */
  canReady(status: MatchStatus): boolean {
    return status === 'OPEN';
  },

  /**
   * Can a result be reported?
   */
  canReportResult(status: MatchStatus): boolean {
    return status === 'IN_PROGRESS';
  },

  /**
   * Can a dispute be filed?
   */
  canDispute(status: MatchStatus): boolean {
    return status === 'IN_PROGRESS' || status === 'COMPLETED';
  },

  /**
   * Can evidence be submitted?
   */
  canSubmitEvidence(status: MatchStatus): boolean {
    return (
      status === 'DISPUTED' ||
      status === 'AWAITING_OPPONENT_EVIDENCE' ||
      status === 'AWAITING_ADMIN_REVIEW'
    );
  },

  /**
   * Is the match in a final state (no more changes allowed)?
   */
  isFinalState(status: MatchStatus): boolean {
    return status === 'COMPLETED' || status === 'REFUNDED';
  },

  /**
   * Can the match be cancelled/refunded?
   */
  canRefund(status: MatchStatus): boolean {
    return !this.isFinalState(status);
  },

  /**
   * Does this match require admin intervention?
   */
  requiresAdminAction(status: MatchStatus): boolean {
    return status === 'AWAITING_ADMIN_REVIEW';
  },
};

/**
 * Get human-readable description of match status
 */
export function getStatusDescription(status: MatchStatus): string {
  const descriptions: Record<MatchStatus, string> = {
    LOBBY: 'Match is being set up',
    OPEN: 'Match is open and accepting players',
    IN_PROGRESS: 'Match is currently being played',
    COMPLETED: 'Match has been completed',
    DISPUTED: 'Match result is being disputed',
    REFUNDED: 'Match has been refunded to all participants',
    AWAITING_ADMIN_REVIEW: 'Waiting for admin to review dispute',
    AWAITING_OPPONENT_EVIDENCE: 'Waiting for opposing team to submit evidence',
  };

  return descriptions[status] || 'Unknown status';
}

export default {
  isValidTransition,
  getValidNextStates,
  validateTransition,
  MatchStateRules,
  getStatusDescription,
};
