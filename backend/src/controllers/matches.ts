import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  createMatchSchema,
  listMatchesSchema,
  joinMatchSchema,
  markReadySchema,
  reportResultSchema,
  createDisputeSchema,
  submitEvidenceSchema,
} from '../validators/match';
import { MatchStateRules, validateTransition } from '../services/matchStateMachine';
import {
  deductMatchWagers,
  distributeMatchWinnings,
  refundMatch,
} from '../services/transaction';
import { updateMatchElos } from '../services/elo';
import { notifyMatchLobby, notifyMatchResult, notifyDisputeUpdate } from '../services/notification';

/**
 * Match Controller
 * Handles all match-related operations
 */

/**
 * GET /matches
 * List all matches with optional filters
 */
export async function listMatches(req: Request, res: Response) {
  try {
    const filters = listMatchesSchema.parse(req.query);

    const where: any = {};

    if (filters.gameId) where.gameId = filters.gameId;
    if (filters.status) where.status = filters.status;
    if (filters.region) where.region = filters.region;
    if (filters.platform) where.platform = filters.platform;
    if (filters.teamSize) where.teamSize = filters.teamSize;

    // Wager range filter
    if (filters.minWager !== undefined || filters.maxWager !== undefined) {
      where.wager = {};
      if (filters.minWager !== undefined) where.wager.gte = filters.minWager;
      if (filters.maxWager !== undefined) where.wager.lte = filters.maxWager;
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          game: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          teamA: {
            select: {
              id: true,
              name: true,
              tag: true,
            },
          },
          teamB: {
            select: {
              id: true,
              name: true,
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.match.count({ where }),
    ]);

    res.json({
      matches,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + filters.limit < total,
      },
    });
  } catch (error) {
    console.error('Error listing matches:', error);
    res.status(400).json({ error: 'Invalid request parameters' });
  }
}

/**
 * GET /matches/:id
 * Get match details by ID
 */
export async function getMatch(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                credits: true,
              },
            },
          },
        },
        teamA: {
          select: {
            id: true,
            name: true,
            tag: true,
          },
        },
        teamB: {
          select: {
            id: true,
            name: true,
            tag: true,
          },
        },
        disputes: {
          include: {
            initiator: {
              select: {
                id: true,
                username: true,
              },
            },
            evidence: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
}

/**
 * POST /matches
 * Create a new match
 */
export async function createMatch(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const data = createMatchSchema.parse(req.body);

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        gameId: data.gameId,
        wager: data.wager,
        teamSize: data.teamSize,
        region: data.region,
        platform: data.platform,
        status: 'LOBBY',
        teamAId: data.teamAId,
        teamBId: data.teamBId,
      },
      include: {
        game: true,
      },
    });

    // Creator automatically joins team A
    await prisma.matchPlayer.create({
      data: {
        matchId: match.id,
        userId,
        team: 'A',
        isReady: false,
      },
    });

    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(400).json({ error: 'Failed to create match' });
  }
}

/**
 * PUT /matches/:id/join
 * Join a match
 */
export async function joinMatch(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: matchId } = req.params;
    const { team } = joinMatchSchema.parse(req.body);

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if match is joinable
    if (!MatchStateRules.canJoin(match.status)) {
      return res.status(400).json({ error: 'Match is not accepting new players' });
    }

    // Check if user is already in match
    const existingPlayer = match.players.find((p) => p.userId === userId);
    if (existingPlayer) {
      return res.status(400).json({ error: 'You are already in this match' });
    }

    // Check if team is full
    const teamPlayers = match.players.filter((p) => p.team === team);
    const maxPlayersPerTeam = getMaxPlayersForTeamSize(match.teamSize);

    if (teamPlayers.length >= maxPlayersPerTeam) {
      return res.status(400).json({ error: `Team ${team} is full` });
    }

    // Check if user has sufficient credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < match.wager) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // Join match
    await prisma.matchPlayer.create({
      data: {
        matchId,
        userId,
        team,
        isReady: false,
      },
    });

    // Update match status to OPEN if it was LOBBY
    if (match.status === 'LOBBY') {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'OPEN' },
      });
    }

    res.json({ message: 'Successfully joined match', team });
  } catch (error) {
    console.error('Error joining match:', error);
    res.status(400).json({ error: 'Failed to join match' });
  }
}

/**
 * PUT /matches/:id/ready
 * Mark player as ready/not ready
 */
export async function markReady(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: matchId } = req.params;
    const { ready } = markReadySchema.parse(req.body);

    // Get match and player
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if match allows ready status changes
    if (!MatchStateRules.canReady(match.status)) {
      return res.status(400).json({ error: 'Cannot change ready status in current match state' });
    }

    // Check if user is in match
    const player = match.players.find((p) => p.userId === userId);
    if (!player) {
      return res.status(404).json({ error: 'You are not in this match' });
    }

    // Update ready status
    await prisma.matchPlayer.update({
      where: {
        matchId_userId: {
          matchId,
          userId,
        },
      },
      data: { isReady: ready },
    });

    // Check if all players are ready
    const updatedMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
        game: true,
      },
    });

    const allReady = updatedMatch!.players.every((p) => p.isReady);
    const bothTeamsFull = checkBothTeamsFull(updatedMatch!);

    // Start match if all players ready and both teams full
    if (allReady && bothTeamsFull) {
      // Deduct wagers from all players
      const wagerResult = await deductMatchWagers(matchId);

      if (!wagerResult.success) {
        return res.status(400).json({ error: wagerResult.error });
      }

      // Update match status to IN_PROGRESS
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'IN_PROGRESS' },
      });

      // Notify all players
      const playerIds = updatedMatch!.players.map((p) => p.userId);
      await notifyMatchLobby(playerIds, matchId, updatedMatch!.game.name);

      return res.json({ message: 'Match started!', status: 'IN_PROGRESS' });
    }

    res.json({ message: `Marked as ${ready ? 'ready' : 'not ready'}` });
  } catch (error) {
    console.error('Error marking ready:', error);
    res.status(400).json({ error: 'Failed to update ready status' });
  }
}

/**
 * PUT /matches/:id/report-result
 * Report match result
 */
export async function reportResult(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: matchId } = req.params;
    const { winningTeam, teamAScore, teamBScore } = reportResultSchema.parse(req.body);

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
        game: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if result can be reported
    if (!MatchStateRules.canReportResult(match.status)) {
      return res.status(400).json({ error: 'Cannot report result in current match state' });
    }

    // Check if user is in match
    const player = match.players.find((p) => p.userId === userId);
    if (!player) {
      return res.status(404).json({ error: 'You are not in this match' });
    }

    // Distribute winnings BEFORE marking match as completed
    const distributionResult = await distributeMatchWinnings(matchId, winningTeam);

    if (!distributionResult.success) {
      console.error('Failed to distribute winnings:', distributionResult.error);
      return res.status(500).json({
        error: 'Failed to distribute winnings',
        details: distributionResult.error
      });
    }

    // Update ELO ratings (non-critical, log errors but don't fail)
    try {
      await updateMatchElos(matchId, winningTeam);
    } catch (error) {
      console.error('Failed to update ELO ratings:', error);
      // ELO update failure is logged but doesn't prevent match completion
    }

    // Update match with result (only after winnings successfully distributed)
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'COMPLETED',
        winningTeam,
        teamAScore,
        teamBScore,
      },
    });

    // Notify all players
    const playerIds = match.players.map((p) => p.userId);
    await notifyMatchResult(playerIds, matchId, winningTeam, match.game.name);

    res.json({
      message: 'Match result reported successfully',
      winningTeam,
      winnings: distributionResult.totalDistributed,
    });
  } catch (error) {
    console.error('Error reporting result:', error);
    res.status(400).json({ error: 'Failed to report result' });
  }
}

/**
 * POST /matches/:id/dispute
 * Create a dispute for a match
 */
export async function createDispute(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: matchId } = req.params;
    const { reason, youtubeLink } = createDisputeSchema.parse(req.body);

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
        disputes: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if dispute can be filed
    if (!MatchStateRules.canDispute(match.status)) {
      return res.status(400).json({ error: 'Cannot dispute match in current state' });
    }

    // Check if user is in match
    const player = match.players.find((p) => p.userId === userId);
    if (!player) {
      return res.status(404).json({ error: 'You are not in this match' });
    }

    // Check if dispute already exists
    if (match.disputes.length > 0) {
      return res.status(400).json({ error: 'A dispute already exists for this match' });
    }

    // Create dispute with 48-hour deadline
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);

    const dispute = await prisma.dispute.create({
      data: {
        matchId,
        initiatorId: userId,
        deadline,
      },
    });

    // Create initial evidence if provided
    if (youtubeLink) {
      await prisma.disputeEvidence.create({
        data: {
          disputeId: dispute.id,
          userId,
          youtubeLink,
          message: reason,
        },
      });
    }

    // Update match status
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'DISPUTED' },
    });

    // Notify all players
    const playerIds = match.players.map((p) => p.userId);
    for (const playerId of playerIds) {
      await notifyDisputeUpdate(
        playerId,
        matchId,
        'DISPUTED',
        'A dispute has been filed for this match'
      );
    }

    res.status(201).json({
      message: 'Dispute created successfully',
      dispute,
    });
  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(400).json({ error: 'Failed to create dispute' });
  }
}

/**
 * POST /matches/:id/evidence
 * Submit evidence for a dispute
 */
export async function submitEvidence(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: matchId } = req.params;
    const { youtubeLink, message } = submitEvidenceSchema.parse(req.body);

    // Get match and dispute
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
        disputes: {
          include: {
            evidence: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if evidence can be submitted
    if (!MatchStateRules.canSubmitEvidence(match.status)) {
      return res.status(400).json({ error: 'Cannot submit evidence in current match state' });
    }

    // Check if user is in match
    const player = match.players.find((p) => p.userId === userId);
    if (!player) {
      return res.status(404).json({ error: 'You are not in this match' });
    }

    // Get dispute
    const dispute = match.disputes[0];
    if (!dispute) {
      return res.status(404).json({ error: 'No dispute found for this match' });
    }

    // Create evidence
    await prisma.disputeEvidence.create({
      data: {
        disputeId: dispute.id,
        userId,
        youtubeLink,
        message,
      },
    });

    // Update match status if this is opponent's evidence
    if (match.status === 'AWAITING_OPPONENT_EVIDENCE') {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'AWAITING_ADMIN_REVIEW' },
      });

      // Notify all players
      const playerIds = match.players.map((p) => p.userId);
      for (const playerId of playerIds) {
        await notifyDisputeUpdate(
          playerId,
          matchId,
          'AWAITING_ADMIN_REVIEW',
          'Both parties have submitted evidence. Admin review pending.'
        );
      }
    }

    res.status(201).json({
      message: 'Evidence submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting evidence:', error);
    res.status(400).json({ error: 'Failed to submit evidence' });
  }
}

// Helper functions

function getMaxPlayersForTeamSize(teamSize: string): number {
  const sizeMap: Record<string, number> = {
    SOLO: 1,
    DUO: 2,
    TRIO: 3,
    SQUAD: 4,
    TEAM: 5,
  };
  return sizeMap[teamSize] || 1;
}

function checkBothTeamsFull(match: any): boolean {
  const maxPerTeam = getMaxPlayersForTeamSize(match.teamSize);
  const teamACount = match.players.filter((p: any) => p.team === 'A').length;
  const teamBCount = match.players.filter((p: any) => p.team === 'B').length;
  return teamACount === maxPerTeam && teamBCount === maxPerTeam;
}

export default {
  listMatches,
  getMatch,
  createMatch,
  joinMatch,
  markReady,
  reportResult,
  createDispute,
  submitEvidence,
};
