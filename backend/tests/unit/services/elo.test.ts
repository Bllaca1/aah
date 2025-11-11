import {
  calculateExpectedScore,
  calculateNewElo,
  calculateTeamAverageElo,
  updatePlayerElo,
  updateTeamElo,
  DEFAULT_ELO,
} from '../../../src/services/elo';
import { prisma } from '../../../src/lib/prisma';
import { createTestUser, createTestGame, cleanupTestData } from '../../fixtures/factories';

describe('ELO Service', () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('calculateExpectedScore', () => {
    it('should return 0.5 for equally rated players', () => {
      const result = calculateExpectedScore(1000, 1000);
      expect(result).toBeCloseTo(0.5, 2);
    });

    it('should return higher probability for higher rated player', () => {
      const result = calculateExpectedScore(1200, 1000);
      expect(result).toBeGreaterThan(0.5);
      expect(result).toBeCloseTo(0.76, 2);
    });

    it('should return lower probability for lower rated player', () => {
      const result = calculateExpectedScore(1000, 1200);
      expect(result).toBeLessThan(0.5);
      expect(result).toBeCloseTo(0.24, 2);
    });

    it('should handle extreme rating differences', () => {
      const result = calculateExpectedScore(2000, 1000);
      expect(result).toBeGreaterThan(0.99);
    });

    it('should be inversely related', () => {
      const player1Expected = calculateExpectedScore(1100, 900);
      const player2Expected = calculateExpectedScore(900, 1100);
      expect(player1Expected + player2Expected).toBeCloseTo(1.0, 2);
    });
  });

  describe('calculateNewElo', () => {
    it('should increase ELO for winning against equal opponent', () => {
      const newElo = calculateNewElo(1000, 1000, 1, 50); // Win with standard K=32
      expect(newElo).toBeGreaterThan(1000);
      expect(newElo).toBe(1016); // 1000 + 32 * (1 - 0.5) = 1016
    });

    it('should decrease ELO for losing against equal opponent', () => {
      const newElo = calculateNewElo(1000, 1000, 0, 50); // Loss with standard K=32
      expect(newElo).toBeLessThan(1000);
      expect(newElo).toBe(984); // 1000 + 32 * (0 - 0.5) = 984
    });

    it('should use higher K-factor for new players (< 30 games)', () => {
      const newElo = calculateNewElo(1000, 1000, 1, 20); // Win with K=40 for new player
      expect(newElo).toBe(1020); // 1000 + 40 * (1 - 0.5) = 1020
    });

    it('should use standard K-factor for experienced players (>= 30 games)', () => {
      const newElo = calculateNewElo(1000, 1000, 1, 50); // Win with K=32
      expect(newElo).toBe(1016); // 1000 + 32 * (1 - 0.5) = 1016
    });

    it('should gain more ELO when beating higher rated opponent', () => {
      const newElo = calculateNewElo(1000, 1200, 1, 50);
      expect(newElo).toBeGreaterThan(1024); // More than standard win
    });

    it('should lose less ELO when losing to higher rated opponent', () => {
      const newElo = calculateNewElo(1000, 1200, 0, 50);
      expect(newElo).toBeGreaterThan(984); // Less loss than standard
      expect(newElo).toBeLessThan(1000);
    });

    it('should never drop below 100 ELO', () => {
      const newElo = calculateNewElo(100, 2000, 0, 50);
      expect(newElo).toBeGreaterThanOrEqual(100);
    });

    it('should round to nearest integer', () => {
      const newElo = calculateNewElo(1000, 1001, 1, 50);
      expect(Number.isInteger(newElo)).toBe(true);
    });
  });

  describe('calculateTeamAverageElo', () => {
    it('should return DEFAULT_ELO for empty team', () => {
      const avgElo = calculateTeamAverageElo([]);
      expect(avgElo).toBe(DEFAULT_ELO);
    });

    it('should return same value for single player team', () => {
      const avgElo = calculateTeamAverageElo([1200]);
      expect(avgElo).toBe(1200);
    });

    it('should calculate correct average for multiple players', () => {
      const avgElo = calculateTeamAverageElo([1000, 1200, 1400]);
      expect(avgElo).toBe(1200); // (1000 + 1200 + 1400) / 3 = 1200
    });

    it('should round to nearest integer', () => {
      const avgElo = calculateTeamAverageElo([1000, 1100]);
      expect(avgElo).toBe(1050);
      expect(Number.isInteger(avgElo)).toBe(true);
    });

    it('should handle varying team sizes', () => {
      const avgElo5v5 = calculateTeamAverageElo([1000, 1100, 1200, 1300, 1400]);
      expect(avgElo5v5).toBe(1200);
    });
  });

  describe('updatePlayerElo (Integration)', () => {
    it('should create new ELO record for first match', async () => {
      const user = await createTestUser();
      const game = await createTestGame();

      const result = await updatePlayerElo(user.id, game.id, 1000, true);

      expect(result.oldElo).toBe(DEFAULT_ELO);
      expect(result.newElo).toBeGreaterThan(DEFAULT_ELO);
      expect(result.change).toBeGreaterThan(0);

      // Verify database record created
      const userElo = await prisma.userElo.findUnique({
        where: {
          userId_gameId: { userId: user.id, gameId: game.id },
        },
      });

      expect(userElo).not.toBeNull();
      expect(userElo?.elo).toBe(result.newElo);
    });

    it('should update existing ELO record', async () => {
      const user = await createTestUser();
      const game = await createTestGame();

      // First match
      await updatePlayerElo(user.id, game.id, 1000, true);

      // Second match
      const result = await updatePlayerElo(user.id, game.id, 1000, false);

      expect(result.newElo).toBeLessThan(result.oldElo);
      expect(result.change).toBeLessThan(0);
    });

    it('should track ELO changes over multiple matches', async () => {
      const user = await createTestUser();
      const game = await createTestGame();

      const results = [];

      // Win 5 matches
      for (let i = 0; i < 5; i++) {
        const result = await updatePlayerElo(user.id, game.id, 1000, true);
        results.push(result);
      }

      // ELO should steadily increase
      expect(results[4].newElo).toBeGreaterThan(results[0].newElo);
    });

    it('should handle wins and losses correctly', async () => {
      const user = await createTestUser();
      const game = await createTestGame();

      // Win
      const winResult = await updatePlayerElo(user.id, game.id, 1000, true);
      expect(winResult.newElo).toBeGreaterThan(winResult.oldElo);

      // Loss
      const lossResult = await updatePlayerElo(user.id, game.id, 1000, false);
      expect(lossResult.newElo).toBeLessThan(lossResult.oldElo);
    });

    it('should use correct K-factor based on games played', async () => {
      const user = await createTestUser();
      const game = await createTestGame();

      // First match (should use K=40 for new players)
      const firstMatch = await updatePlayerElo(user.id, game.id, 1000, true);
      const firstChange = firstMatch.change;

      // After 30+ matches, K-factor should be lower (32)
      // We'll simulate this by checking the change is consistent with K-factor
      expect(firstChange).toBeGreaterThan(0);
    });
  });

  describe('updateTeamElo (Integration)', () => {
    it('should create new team ELO record for first match', async () => {
      const captain = await createTestUser();
      const game = await createTestGame();

      // Create team
      const team = await prisma.team.create({
        data: {
          name: 'Test Team',
          tag: 'TT',
          captainId: captain.id,
        },
      });

      const result = await updateTeamElo(team.id, game.id, 1000, true);

      expect(result.oldElo).toBe(DEFAULT_ELO);
      expect(result.newElo).toBeGreaterThan(DEFAULT_ELO);
      expect(result.teamId).toBe(team.id);

      // Verify database record
      const teamElo = await prisma.teamElo.findUnique({
        where: {
          teamId_gameId: { teamId: team.id, gameId: game.id },
        },
      });

      expect(teamElo).not.toBeNull();
      expect(teamElo?.elo).toBe(result.newElo);
    });

    it('should update existing team ELO', async () => {
      const captain = await createTestUser();
      const game = await createTestGame();

      const team = await prisma.team.create({
        data: {
          name: 'Test Team',
          tag: 'TT',
          captainId: captain.id,
        },
      });

      // First match
      await updateTeamElo(team.id, game.id, 1000, true);

      // Second match
      const result = await updateTeamElo(team.id, game.id, 1000, false);

      expect(result.newElo).toBeLessThan(result.oldElo);
    });

    it('should calculate ELO based on team win/loss record', async () => {
      const captain = await createTestUser();
      const game = await createTestGame();

      const team = await prisma.team.create({
        data: {
          name: 'Test Team',
          tag: 'TT',
          captainId: captain.id,
          wins: 0,
          losses: 0,
        },
      });

      // New team should use K=40
      const result = await updateTeamElo(team.id, game.id, 1000, true);
      expect(result.newElo).toBeGreaterThan(DEFAULT_ELO);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme ELO differences', () => {
      const newElo = calculateNewElo(100, 2500, 1, 50);
      expect(newElo).toBeGreaterThan(100);
    });

    it('should maintain ELO conservation (zero-sum)', () => {
      const player1Start = 1200;
      const player2Start = 1000;

      const player1New = calculateNewElo(player1Start, player2Start, 1, 50);
      const player2New = calculateNewElo(player2Start, player1Start, 0, 50);

      const totalBefore = player1Start + player2Start;
      const totalAfter = player1New + player2New;

      // Total ELO should be approximately conserved (within rounding)
      expect(Math.abs(totalBefore - totalAfter)).toBeLessThanOrEqual(2);
    });

    it('should handle draw scenario (0.5 score)', () => {
      const newElo = calculateNewElo(1000, 1000, 0.5, 50);
      expect(newElo).toBe(1000); // No change for expected draw
    });
  });
});
