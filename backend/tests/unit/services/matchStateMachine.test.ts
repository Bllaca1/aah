import {
  isValidTransition,
  getValidNextStates,
  validateTransition,
  MatchStateRules,
  getStatusDescription,
  VALID_TRANSITIONS,
} from '../../../src/services/matchStateMachine';
import { MatchStatus } from '@prisma/client';

describe('Match State Machine', () => {
  describe('isValidTransition', () => {
    describe('Valid transitions', () => {
      it('should allow LOBBY -> OPEN', () => {
        expect(isValidTransition('LOBBY' as MatchStatus, 'OPEN' as MatchStatus)).toBe(true);
      });

      it('should allow OPEN -> IN_PROGRESS', () => {
        expect(isValidTransition('OPEN' as MatchStatus, 'IN_PROGRESS' as MatchStatus)).toBe(true);
      });

      it('should allow OPEN -> LOBBY', () => {
        expect(isValidTransition('OPEN' as MatchStatus, 'LOBBY' as MatchStatus)).toBe(true);
      });

      it('should allow IN_PROGRESS -> COMPLETED', () => {
        expect(isValidTransition('IN_PROGRESS' as MatchStatus, 'COMPLETED' as MatchStatus)).toBe(true);
      });

      it('should allow IN_PROGRESS -> DISPUTED', () => {
        expect(isValidTransition('IN_PROGRESS' as MatchStatus, 'DISPUTED' as MatchStatus)).toBe(true);
      });

      it('should allow DISPUTED -> AWAITING_OPPONENT_EVIDENCE', () => {
        expect(isValidTransition('DISPUTED' as MatchStatus, 'AWAITING_OPPONENT_EVIDENCE' as MatchStatus)).toBe(true);
      });

      it('should allow AWAITING_OPPONENT_EVIDENCE -> AWAITING_ADMIN_REVIEW', () => {
        expect(isValidTransition('AWAITING_OPPONENT_EVIDENCE' as MatchStatus, 'AWAITING_ADMIN_REVIEW' as MatchStatus)).toBe(true);
      });

      it('should allow DISPUTED -> AWAITING_ADMIN_REVIEW', () => {
        expect(isValidTransition('DISPUTED' as MatchStatus, 'AWAITING_ADMIN_REVIEW' as MatchStatus)).toBe(true);
      });

      it('should allow AWAITING_ADMIN_REVIEW -> COMPLETED', () => {
        expect(isValidTransition('AWAITING_ADMIN_REVIEW' as MatchStatus, 'COMPLETED' as MatchStatus)).toBe(true);
      });

      it('should allow AWAITING_ADMIN_REVIEW -> REFUNDED', () => {
        expect(isValidTransition('AWAITING_ADMIN_REVIEW' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(true);
      });
    });

    describe('Admin refund transitions', () => {
      it('should allow LOBBY -> REFUNDED', () => {
        expect(isValidTransition('LOBBY' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(true);
      });

      it('should allow OPEN -> REFUNDED', () => {
        expect(isValidTransition('OPEN' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(true);
      });

      it('should allow IN_PROGRESS -> REFUNDED', () => {
        expect(isValidTransition('IN_PROGRESS' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(true);
      });

      it('should allow DISPUTED -> REFUNDED', () => {
        expect(isValidTransition('DISPUTED' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(true);
      });
    });

    describe('Invalid transitions', () => {
      it('should reject LOBBY -> IN_PROGRESS (must go through OPEN)', () => {
        expect(isValidTransition('LOBBY' as MatchStatus, 'IN_PROGRESS' as MatchStatus)).toBe(false);
      });

      it('should reject LOBBY -> COMPLETED', () => {
        expect(isValidTransition('LOBBY' as MatchStatus, 'COMPLETED' as MatchStatus)).toBe(false);
      });

      it('should reject OPEN -> COMPLETED', () => {
        expect(isValidTransition('OPEN' as MatchStatus, 'COMPLETED' as MatchStatus)).toBe(false);
      });

      it('should reject COMPLETED -> DISPUTED (cannot dispute after completion)', () => {
        expect(isValidTransition('COMPLETED' as MatchStatus, 'DISPUTED' as MatchStatus)).toBe(false);
      });

      it('should reject COMPLETED -> REFUNDED (final state)', () => {
        expect(isValidTransition('COMPLETED' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(false);
      });

      it('should reject REFUNDED -> any state (final state)', () => {
        expect(isValidTransition('REFUNDED' as MatchStatus, 'COMPLETED' as MatchStatus)).toBe(false);
        expect(isValidTransition('REFUNDED' as MatchStatus, 'DISPUTED' as MatchStatus)).toBe(false);
        expect(isValidTransition('REFUNDED' as MatchStatus, 'LOBBY' as MatchStatus)).toBe(false);
      });

      it('should reject backwards transitions (except OPEN -> LOBBY)', () => {
        expect(isValidTransition('IN_PROGRESS' as MatchStatus, 'OPEN' as MatchStatus)).toBe(false);
        expect(isValidTransition('COMPLETED' as MatchStatus, 'IN_PROGRESS' as MatchStatus)).toBe(false);
      });

      it('should reject same state transition', () => {
        expect(isValidTransition('LOBBY' as MatchStatus, 'LOBBY' as MatchStatus)).toBe(false);
        expect(isValidTransition('OPEN' as MatchStatus, 'OPEN' as MatchStatus)).toBe(false);
      });
    });
  });

  describe('getValidNextStates', () => {
    it('should return valid next states for LOBBY', () => {
      const nextStates = getValidNextStates('LOBBY' as MatchStatus);
      expect(nextStates).toContain('OPEN' as MatchStatus);
      expect(nextStates).toContain('REFUNDED' as MatchStatus);
      expect(nextStates).not.toContain('COMPLETED' as MatchStatus);
    });

    it('should return valid next states for OPEN', () => {
      const nextStates = getValidNextStates('OPEN' as MatchStatus);
      expect(nextStates).toContain('IN_PROGRESS' as MatchStatus);
      expect(nextStates).toContain('LOBBY' as MatchStatus);
      expect(nextStates).toContain('REFUNDED' as MatchStatus);
    });

    it('should return valid next states for IN_PROGRESS', () => {
      const nextStates = getValidNextStates('IN_PROGRESS' as MatchStatus);
      expect(nextStates).toContain('COMPLETED' as MatchStatus);
      expect(nextStates).toContain('DISPUTED' as MatchStatus);
      expect(nextStates).toContain('REFUNDED' as MatchStatus);
    });

    it('should return valid next states for DISPUTED', () => {
      const nextStates = getValidNextStates('DISPUTED' as MatchStatus);
      expect(nextStates).toContain('AWAITING_OPPONENT_EVIDENCE' as MatchStatus);
      expect(nextStates).toContain('AWAITING_ADMIN_REVIEW' as MatchStatus);
      expect(nextStates).toContain('REFUNDED' as MatchStatus);
    });

    it('should return empty array for COMPLETED (final state)', () => {
      const nextStates = getValidNextStates('COMPLETED' as MatchStatus);
      expect(nextStates).toHaveLength(0);
    });

    it('should return empty array for REFUNDED (final state)', () => {
      const nextStates = getValidNextStates('REFUNDED' as MatchStatus);
      expect(nextStates).toHaveLength(0);
    });

    it('should return valid next states for AWAITING_ADMIN_REVIEW', () => {
      const nextStates = getValidNextStates('AWAITING_ADMIN_REVIEW' as MatchStatus);
      expect(nextStates).toContain('COMPLETED' as MatchStatus);
      expect(nextStates).toContain('REFUNDED' as MatchStatus);
    });
  });

  describe('validateTransition', () => {
    it('should return valid for allowed transition', () => {
      const result = validateTransition('LOBBY' as MatchStatus, 'OPEN' as MatchStatus);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid with error message for disallowed transition', () => {
      const result = validateTransition('LOBBY' as MatchStatus, 'COMPLETED' as MatchStatus);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid state transition');
      expect(result.error).toContain('LOBBY');
      expect(result.error).toContain('COMPLETED');
    });

    it('should include valid transitions in error message', () => {
      const result = validateTransition('LOBBY' as MatchStatus, 'COMPLETED' as MatchStatus);
      expect(result.error).toContain('Valid transitions');
      expect(result.error).toContain('OPEN');
    });
  });

  describe('MatchStateRules.canJoin', () => {
    it('should allow joining in LOBBY state', () => {
      expect(MatchStateRules.canJoin('LOBBY' as MatchStatus)).toBe(true);
    });

    it('should allow joining in OPEN state', () => {
      expect(MatchStateRules.canJoin('OPEN' as MatchStatus)).toBe(true);
    });

    it('should not allow joining in IN_PROGRESS state', () => {
      expect(MatchStateRules.canJoin('IN_PROGRESS' as MatchStatus)).toBe(false);
    });

    it('should not allow joining in COMPLETED state', () => {
      expect(MatchStateRules.canJoin('COMPLETED' as MatchStatus)).toBe(false);
    });

    it('should not allow joining in DISPUTED state', () => {
      expect(MatchStateRules.canJoin('DISPUTED' as MatchStatus)).toBe(false);
    });
  });

  describe('MatchStateRules.canReady', () => {
    it('should only allow ready in OPEN state', () => {
      expect(MatchStateRules.canReady('OPEN' as MatchStatus)).toBe(true);
      expect(MatchStateRules.canReady('LOBBY' as MatchStatus)).toBe(false);
      expect(MatchStateRules.canReady('IN_PROGRESS' as MatchStatus)).toBe(false);
    });
  });

  describe('MatchStateRules.canReportResult', () => {
    it('should only allow result reporting in IN_PROGRESS state', () => {
      expect(MatchStateRules.canReportResult('IN_PROGRESS' as MatchStatus)).toBe(true);
      expect(MatchStateRules.canReportResult('OPEN' as MatchStatus)).toBe(false);
      expect(MatchStateRules.canReportResult('COMPLETED' as MatchStatus)).toBe(false);
    });
  });

  describe('MatchStateRules.canDispute', () => {
    it('should allow dispute in IN_PROGRESS state', () => {
      expect(MatchStateRules.canDispute('IN_PROGRESS' as MatchStatus)).toBe(true);
    });

    it('should allow dispute in COMPLETED state', () => {
      expect(MatchStateRules.canDispute('COMPLETED' as MatchStatus)).toBe(true);
    });

    it('should not allow dispute in other states', () => {
      expect(MatchStateRules.canDispute('LOBBY' as MatchStatus)).toBe(false);
      expect(MatchStateRules.canDispute('OPEN' as MatchStatus)).toBe(false);
      expect(MatchStateRules.canDispute('REFUNDED' as MatchStatus)).toBe(false);
    });
  });

  describe('MatchStateRules.canSubmitEvidence', () => {
    it('should allow evidence in DISPUTED state', () => {
      expect(MatchStateRules.canSubmitEvidence('DISPUTED' as MatchStatus)).toBe(true);
    });

    it('should allow evidence in AWAITING_OPPONENT_EVIDENCE state', () => {
      expect(MatchStateRules.canSubmitEvidence('AWAITING_OPPONENT_EVIDENCE' as MatchStatus)).toBe(true);
    });

    it('should allow evidence in AWAITING_ADMIN_REVIEW state', () => {
      expect(MatchStateRules.canSubmitEvidence('AWAITING_ADMIN_REVIEW' as MatchStatus)).toBe(true);
    });

    it('should not allow evidence in other states', () => {
      expect(MatchStateRules.canSubmitEvidence('LOBBY' as MatchStatus)).toBe(false);
      expect(MatchStateRules.canSubmitEvidence('OPEN' as MatchStatus)).toBe(false);
      expect(MatchStateRules.canSubmitEvidence('IN_PROGRESS' as MatchStatus)).toBe(false);
      expect(MatchStateRules.canSubmitEvidence('COMPLETED' as MatchStatus)).toBe(false);
    });
  });

  describe('MatchStateRules.isFinalState', () => {
    it('should identify COMPLETED as final state', () => {
      expect(MatchStateRules.isFinalState('COMPLETED' as MatchStatus)).toBe(true);
    });

    it('should identify REFUNDED as final state', () => {
      expect(MatchStateRules.isFinalState('REFUNDED' as MatchStatus)).toBe(true);
    });

    it('should not identify other states as final', () => {
      expect(MatchStateRules.isFinalState('LOBBY' as MatchStatus)).toBe(false);
      expect(MatchStateRules.isFinalState('OPEN' as MatchStatus)).toBe(false);
      expect(MatchStateRules.isFinalState('IN_PROGRESS' as MatchStatus)).toBe(false);
      expect(MatchStateRules.isFinalState('DISPUTED' as MatchStatus)).toBe(false);
    });
  });

  describe('MatchStateRules.canRefund', () => {
    it('should allow refund for non-final states', () => {
      expect(MatchStateRules.canRefund('LOBBY' as MatchStatus)).toBe(true);
      expect(MatchStateRules.canRefund('OPEN' as MatchStatus)).toBe(true);
      expect(MatchStateRules.canRefund('IN_PROGRESS' as MatchStatus)).toBe(true);
      expect(MatchStateRules.canRefund('DISPUTED' as MatchStatus)).toBe(true);
    });

    it('should not allow refund for final states', () => {
      expect(MatchStateRules.canRefund('COMPLETED' as MatchStatus)).toBe(false);
      expect(MatchStateRules.canRefund('REFUNDED' as MatchStatus)).toBe(false);
    });
  });

  describe('MatchStateRules.requiresAdminAction', () => {
    it('should require admin action for AWAITING_ADMIN_REVIEW', () => {
      expect(MatchStateRules.requiresAdminAction('AWAITING_ADMIN_REVIEW' as MatchStatus)).toBe(true);
    });

    it('should not require admin action for other states', () => {
      expect(MatchStateRules.requiresAdminAction('LOBBY' as MatchStatus)).toBe(false);
      expect(MatchStateRules.requiresAdminAction('OPEN' as MatchStatus)).toBe(false);
      expect(MatchStateRules.requiresAdminAction('IN_PROGRESS' as MatchStatus)).toBe(false);
      expect(MatchStateRules.requiresAdminAction('DISPUTED' as MatchStatus)).toBe(false);
    });
  });

  describe('getStatusDescription', () => {
    it('should return description for all match statuses', () => {
      const statuses: MatchStatus[] = [
        'LOBBY',
        'OPEN',
        'IN_PROGRESS',
        'COMPLETED',
        'DISPUTED',
        'REFUNDED',
        'AWAITING_ADMIN_REVIEW',
        'AWAITING_OPPONENT_EVIDENCE',
      ];

      for (const status of statuses) {
        const description = getStatusDescription(status);
        expect(description).toBeDefined();
        expect(description.length).toBeGreaterThan(0);
        expect(description).not.toBe('Unknown status');
      }
    });

    it('should return specific descriptions', () => {
      expect(getStatusDescription('LOBBY' as MatchStatus)).toContain('set up');
      expect(getStatusDescription('OPEN' as MatchStatus)).toContain('open');
      expect(getStatusDescription('IN_PROGRESS' as MatchStatus)).toContain('played');
      expect(getStatusDescription('COMPLETED' as MatchStatus)).toContain('completed');
      expect(getStatusDescription('DISPUTED' as MatchStatus)).toContain('disputed');
      expect(getStatusDescription('REFUNDED' as MatchStatus)).toContain('refunded');
    });
  });

  describe('State Machine Integrity', () => {
    it('should have no duplicate transitions', () => {
      const seen = new Set<string>();

      for (const transition of VALID_TRANSITIONS) {
        const key = `${transition.from}->${transition.to}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    });

    it('should have at least one path to COMPLETED', () => {
      // Starting from LOBBY, verify we can reach COMPLETED
      expect(isValidTransition('LOBBY' as MatchStatus, 'OPEN' as MatchStatus)).toBe(true);
      expect(isValidTransition('OPEN' as MatchStatus, 'IN_PROGRESS' as MatchStatus)).toBe(true);
      expect(isValidTransition('IN_PROGRESS' as MatchStatus, 'COMPLETED' as MatchStatus)).toBe(true);
    });

    it('should have at least one path to REFUNDED from each non-final state', () => {
      const nonFinalStates: MatchStatus[] = [
        'LOBBY',
        'OPEN',
        'IN_PROGRESS',
        'DISPUTED',
        'AWAITING_OPPONENT_EVIDENCE',
        'AWAITING_ADMIN_REVIEW',
      ];

      for (const state of nonFinalStates) {
        const nextStates = getValidNextStates(state);
        const canReachRefund = nextStates.includes('REFUNDED' as MatchStatus) ||
          nextStates.some(next => getValidNextStates(next).includes('REFUNDED' as MatchStatus));

        expect(canReachRefund).toBe(true);
      }
    });

    it('should prevent transitions from final states', () => {
      const finalStates: MatchStatus[] = ['COMPLETED', 'REFUNDED'];

      for (const finalState of finalStates) {
        const nextStates = getValidNextStates(finalState);
        expect(nextStates).toHaveLength(0);
      }
    });
  });

  describe('Dispute Flow', () => {
    it('should support full dispute resolution flow', () => {
      // IN_PROGRESS -> DISPUTED
      expect(isValidTransition('IN_PROGRESS' as MatchStatus, 'DISPUTED' as MatchStatus)).toBe(true);

      // DISPUTED -> AWAITING_OPPONENT_EVIDENCE
      expect(isValidTransition('DISPUTED' as MatchStatus, 'AWAITING_OPPONENT_EVIDENCE' as MatchStatus)).toBe(true);

      // AWAITING_OPPONENT_EVIDENCE -> AWAITING_ADMIN_REVIEW
      expect(isValidTransition('AWAITING_OPPONENT_EVIDENCE' as MatchStatus, 'AWAITING_ADMIN_REVIEW' as MatchStatus)).toBe(true);

      // AWAITING_ADMIN_REVIEW -> COMPLETED
      expect(isValidTransition('AWAITING_ADMIN_REVIEW' as MatchStatus, 'COMPLETED' as MatchStatus)).toBe(true);
    });

    it('should support expedited dispute flow (skip opponent evidence)', () => {
      // IN_PROGRESS -> DISPUTED
      expect(isValidTransition('IN_PROGRESS' as MatchStatus, 'DISPUTED' as MatchStatus)).toBe(true);

      // DISPUTED -> AWAITING_ADMIN_REVIEW (skip opponent evidence)
      expect(isValidTransition('DISPUTED' as MatchStatus, 'AWAITING_ADMIN_REVIEW' as MatchStatus)).toBe(true);

      // AWAITING_ADMIN_REVIEW -> COMPLETED
      expect(isValidTransition('AWAITING_ADMIN_REVIEW' as MatchStatus, 'COMPLETED' as MatchStatus)).toBe(true);
    });

    it('should allow admin to refund at any dispute stage', () => {
      expect(isValidTransition('DISPUTED' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(true);
      expect(isValidTransition('AWAITING_OPPONENT_EVIDENCE' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(false); // Not in valid transitions
      expect(isValidTransition('AWAITING_ADMIN_REVIEW' as MatchStatus, 'REFUNDED' as MatchStatus)).toBe(true);
    });
  });
});
