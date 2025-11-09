import { prisma } from '../lib/prisma';

/**
 * ELO Rating System Service
 * Implements a modified ELO rating system for competitive matches
 */

// Configuration constants
const DEFAULT_ELO = 1000;
const K_FACTOR = 32; // Standard K-factor for chess-like games
const K_FACTOR_NEW_PLAYER = 40; // Higher K-factor for players with < 30 games
const NEW_PLAYER_THRESHOLD = 30;

export interface EloUpdateResult {
  oldElo: number;
  newElo: number;
  change: number;
}

export interface TeamEloUpdateResult {
  teamId: string;
  oldElo: number;
  newElo: number;
  change: number;
}

/**
 * Calculate expected score using ELO formula
 * @param playerRating Player's current ELO rating
 * @param opponentRating Opponent's current ELO rating
 * @returns Expected score (0 to 1)
 */
export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate new ELO rating after a match
 * @param currentRating Player's current ELO rating
 * @param opponentRating Opponent's current ELO rating
 * @param actualScore Actual match outcome (1 = win, 0.5 = draw, 0 = loss)
 * @param gamesPlayed Number of games player has played (affects K-factor)
 * @returns New ELO rating
 */
export function calculateNewElo(
  currentRating: number,
  opponentRating: number,
  actualScore: number,
  gamesPlayed: number = 0
): number {
  const expectedScore = calculateExpectedScore(currentRating, opponentRating);
  const kFactor = gamesPlayed < NEW_PLAYER_THRESHOLD ? K_FACTOR_NEW_PLAYER : K_FACTOR;
  const newRating = currentRating + kFactor * (actualScore - expectedScore);

  // Round to nearest integer and ensure minimum of 100
  return Math.max(100, Math.round(newRating));
}

/**
 * Calculate average ELO for a team
 * @param teamElos Array of individual player ELOs
 * @returns Average team ELO
 */
export function calculateTeamAverageElo(teamElos: number[]): number {
  if (teamElos.length === 0) return DEFAULT_ELO;
  const sum = teamElos.reduce((acc, elo) => acc + elo, 0);
  return Math.round(sum / teamElos.length);
}

/**
 * Update individual player ELO after a match
 * @param userId User ID
 * @param gameId Game ID
 * @param opponentElo Opponent's ELO rating
 * @param won Whether the player won (true) or lost (false)
 * @returns ELO update result
 */
export async function updatePlayerElo(
  userId: string,
  gameId: string,
  opponentElo: number,
  won: boolean
): Promise<EloUpdateResult> {
  // Get or create user's ELO record for this game
  let userElo = await prisma.userElo.findUnique({
    where: {
      userId_gameId: { userId, gameId },
    },
  });

  // Initialize ELO if this is the first match
  if (!userElo) {
    userElo = await prisma.userElo.create({
      data: {
        userId,
        gameId,
        elo: DEFAULT_ELO,
      },
    });
  }

  const oldElo = userElo.elo;
  const actualScore = won ? 1 : 0;

  // Count total matches played by this user for this game
  const matchesPlayed = await prisma.matchPlayer.count({
    where: {
      userId,
      match: {
        gameId,
        status: 'COMPLETED',
      },
    },
  });

  // Calculate new ELO
  const newElo = calculateNewElo(oldElo, opponentElo, actualScore, matchesPlayed);

  // Update database
  await prisma.userElo.update({
    where: {
      userId_gameId: { userId, gameId },
    },
    data: {
      elo: newElo,
    },
  });

  return {
    oldElo,
    newElo,
    change: newElo - oldElo,
  };
}

/**
 * Update team ELO after a match
 * @param teamId Team ID
 * @param gameId Game ID
 * @param opponentElo Opponent team's ELO rating
 * @param won Whether the team won (true) or lost (false)
 * @returns ELO update result
 */
export async function updateTeamElo(
  teamId: string,
  gameId: string,
  opponentElo: number,
  won: boolean
): Promise<TeamEloUpdateResult> {
  // Get or create team's ELO record for this game
  let teamElo = await prisma.teamElo.findUnique({
    where: {
      teamId_gameId: { teamId, gameId },
    },
  });

  // Initialize ELO if this is the first match
  if (!teamElo) {
    teamElo = await prisma.teamElo.create({
      data: {
        teamId,
        gameId,
        elo: DEFAULT_ELO,
      },
    });
  }

  const oldElo = teamElo.elo;
  const actualScore = won ? 1 : 0;

  // Count total matches played by this team for this game
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { wins: true, losses: true },
  });

  const matchesPlayed = team ? team.wins + team.losses : 0;

  // Calculate new ELO
  const newElo = calculateNewElo(oldElo, opponentElo, actualScore, matchesPlayed);

  // Update database
  await prisma.teamElo.update({
    where: {
      teamId_gameId: { teamId, gameId },
    },
    data: {
      elo: newElo,
    },
  });

  return {
    teamId,
    oldElo,
    newElo,
    change: newElo - oldElo,
  };
}

/**
 * Update ELO for all players in a match
 * @param matchId Match ID
 * @param winningTeam 'A' or 'B'
 */
export async function updateMatchElos(
  matchId: string,
  winningTeam: 'A' | 'B'
): Promise<{
  teamAUpdates: EloUpdateResult[];
  teamBUpdates: EloUpdateResult[];
  teamAAvgChange: number;
  teamBAvgChange: number;
}> {
  // Get match details
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      players: {
        include: {
          user: {
            include: {
              elos: {
                where: {
                  gameId: '', // Will be filled with match.gameId
                },
              },
            },
          },
        },
      },
      game: true,
    },
  });

  if (!match) {
    throw new Error('Match not found');
  }

  // Get players for each team
  const teamAPlayers = match.players.filter((p) => p.team === 'A');
  const teamBPlayers = match.players.filter((p) => p.team === 'B');

  // Get current ELOs for each team
  const teamAElos = await Promise.all(
    teamAPlayers.map(async (p) => {
      const elo = await prisma.userElo.findUnique({
        where: {
          userId_gameId: { userId: p.userId, gameId: match.gameId },
        },
      });
      return elo?.elo || DEFAULT_ELO;
    })
  );

  const teamBElos = await Promise.all(
    teamBPlayers.map(async (p) => {
      const elo = await prisma.userElo.findUnique({
        where: {
          userId_gameId: { userId: p.userId, gameId: match.gameId },
        },
      });
      return elo?.elo || DEFAULT_ELO;
    })
  );

  const teamAAvgElo = calculateTeamAverageElo(teamAElos);
  const teamBAvgElo = calculateTeamAverageElo(teamBElos);

  // Update ELOs for all players
  const teamAUpdates = await Promise.all(
    teamAPlayers.map((p) =>
      updatePlayerElo(p.userId, match.gameId, teamBAvgElo, winningTeam === 'A')
    )
  );

  const teamBUpdates = await Promise.all(
    teamBPlayers.map((p) =>
      updatePlayerElo(p.userId, match.gameId, teamAAvgElo, winningTeam === 'B')
    )
  );

  // Update team ELOs if applicable
  if (match.teamAId && match.teamBId) {
    await updateTeamElo(match.teamAId, match.gameId, teamBAvgElo, winningTeam === 'A');
    await updateTeamElo(match.teamBId, match.gameId, teamAAvgElo, winningTeam === 'B');

    // Update team win/loss records
    if (winningTeam === 'A') {
      await prisma.team.update({
        where: { id: match.teamAId },
        data: { wins: { increment: 1 } },
      });
      await prisma.team.update({
        where: { id: match.teamBId },
        data: { losses: { increment: 1 } },
      });
    } else {
      await prisma.team.update({
        where: { id: match.teamBId },
        data: { wins: { increment: 1 } },
      });
      await prisma.team.update({
        where: { id: match.teamAId },
        data: { losses: { increment: 1 } },
      });
    }
  }

  // Calculate average ELO changes
  const teamAAvgChange =
    teamAUpdates.reduce((sum, u) => sum + u.change, 0) / teamAUpdates.length;
  const teamBAvgChange =
    teamBUpdates.reduce((sum, u) => sum + u.change, 0) / teamBUpdates.length;

  return {
    teamAUpdates,
    teamBUpdates,
    teamAAvgChange,
    teamBAvgChange,
  };
}

/**
 * Get leaderboard for a specific game
 * @param gameId Game ID
 * @param limit Number of top players to return
 * @returns Array of top players with their ELO ratings
 */
export async function getLeaderboard(gameId: string, limit: number = 100) {
  return await prisma.userElo.findMany({
    where: { gameId },
    orderBy: { elo: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get team leaderboard for a specific game
 * @param gameId Game ID
 * @param limit Number of top teams to return
 * @returns Array of top teams with their ELO ratings
 */
export async function getTeamLeaderboard(gameId: string, limit: number = 100) {
  return await prisma.teamElo.findMany({
    where: { gameId },
    orderBy: { elo: 'desc' },
    take: limit,
    include: {
      team: {
        select: {
          id: true,
          name: true,
          tag: true,
          wins: true,
          losses: true,
        },
      },
    },
  });
}

export default {
  calculateExpectedScore,
  calculateNewElo,
  calculateTeamAverageElo,
  updatePlayerElo,
  updateTeamElo,
  updateMatchElos,
  getLeaderboard,
  getTeamLeaderboard,
  DEFAULT_ELO,
};
