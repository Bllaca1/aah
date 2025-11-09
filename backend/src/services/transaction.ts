import { prisma } from '../lib/prisma';
import { TransactionType, TransactionStatus } from '@prisma/client';

/**
 * Transaction Service
 * Handles all credit movements, wagers, winnings, and financial operations
 */

// Platform fee configuration (percentage)
const PLATFORM_FEE_PERCENTAGE = 0.1; // 10% platform fee

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  newBalance?: number;
  error?: string;
}

export interface WagerDeductionResult {
  success: boolean;
  transactions: string[];
  error?: string;
}

export interface WinningsDistributionResult {
  success: boolean;
  transactions: string[];
  totalDistributed: number;
  platformFee: number;
  error?: string;
}

/**
 * Check if user has sufficient credits
 */
export async function hasSufficientCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) return false;
  return user.credits >= amount;
}

/**
 * Get user's current credit balance
 */
export async function getUserBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  return user?.credits || 0;
}

/**
 * Create a transaction record
 */
async function createTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  status: TransactionStatus = 'COMPLETED',
  metadata?: any
): Promise<string> {
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type,
      amount,
      status,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  return transaction.id;
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: TransactionType,
  metadata?: any
): Promise<TransactionResult> {
  try {
    // Check if user has sufficient credits
    const hasFunds = await hasSufficientCredits(userId, amount);
    if (!hasFunds) {
      return {
        success: false,
        error: 'Insufficient credits',
      };
    }

    // Perform transaction in a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct credits from user
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: amount,
          },
        },
        select: { credits: true },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type,
          amount: -amount, // Negative for deduction
          status: 'COMPLETED',
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return {
        transactionId: transaction.id,
        newBalance: user.credits,
      };
    });

    return {
      success: true,
      transactionId: result.transactionId,
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return {
      success: false,
      error: 'Failed to deduct credits',
    };
  }
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: TransactionType,
  metadata?: any
): Promise<TransactionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Add credits to user
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: amount,
          },
        },
        select: { credits: true },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type,
          amount, // Positive for addition
          status: 'COMPLETED',
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return {
        transactionId: transaction.id,
        newBalance: user.credits,
      };
    });

    return {
      success: true,
      transactionId: result.transactionId,
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('Error adding credits:', error);
    return {
      success: false,
      error: 'Failed to add credits',
    };
  }
}

/**
 * Deduct wager from all players in a match
 */
export async function deductMatchWagers(
  matchId: string
): Promise<WagerDeductionResult> {
  try {
    // Get match and all players
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!match) {
      return {
        success: false,
        transactions: [],
        error: 'Match not found',
      };
    }

    // Check all players have sufficient credits
    for (const player of match.players) {
      const hasFunds = await hasSufficientCredits(player.userId, match.wager);
      if (!hasFunds) {
        return {
          success: false,
          transactions: [],
          error: `Player ${player.user.username} has insufficient credits`,
        };
      }
    }

    // Deduct wager from all players in a single database transaction
    const transactionIds = await prisma.$transaction(
      async (tx) => {
        const ids: string[] = [];

        for (const player of match.players) {
          // Deduct credits
          await tx.user.update({
            where: { id: player.userId },
            data: {
              credits: {
                decrement: match.wager,
              },
            },
          });

          // Create transaction record
          const transaction = await tx.transaction.create({
            data: {
              userId: player.userId,
              type: 'MATCH_LOSS',
              amount: -match.wager,
              status: 'COMPLETED',
              metadata: JSON.stringify({
                matchId,
                reason: 'Match wager deducted',
              }),
            },
          });

          ids.push(transaction.id);
        }

        return ids;
      }
    );

    return {
      success: true,
      transactions: transactionIds,
    };
  } catch (error) {
    console.error('Error deducting match wagers:', error);
    return {
      success: false,
      transactions: [],
      error: 'Failed to deduct wagers',
    };
  }
}

/**
 * Distribute winnings to winning team and collect platform fee
 */
export async function distributeMatchWinnings(
  matchId: string,
  winningTeam: 'A' | 'B'
): Promise<WinningsDistributionResult> {
  try {
    // Get match and all players
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
      },
    });

    if (!match) {
      return {
        success: false,
        transactions: [],
        totalDistributed: 0,
        platformFee: 0,
        error: 'Match not found',
      };
    }

    // Calculate total pot and platform fee
    const totalWager = match.wager * match.players.length;
    const platformFee = Math.round(totalWager * PLATFORM_FEE_PERCENTAGE);
    const totalWinnings = totalWager - platformFee;

    // Get winning team players
    const winningPlayers = match.players.filter((p) => p.team === winningTeam);
    const winningsPerPlayer = Math.floor(totalWinnings / winningPlayers.length);

    // Distribute winnings in a single database transaction
    const transactionIds = await prisma.$transaction(
      async (tx) => {
        const ids: string[] = [];

        for (const player of winningPlayers) {
          // Add credits to winner
          await tx.user.update({
            where: { id: player.userId },
            data: {
              credits: {
                increment: winningsPerPlayer,
              },
            },
          });

          // Create transaction record
          const transaction = await tx.transaction.create({
            data: {
              userId: player.userId,
              type: 'MATCH_WIN',
              amount: winningsPerPlayer,
              status: 'COMPLETED',
              metadata: JSON.stringify({
                matchId,
                winningTeam,
                platformFee,
                totalPot: totalWager,
              }),
            },
          });

          ids.push(transaction.id);
        }

        // Record platform fee (use first player or system account)
        const platformFeeTransaction = await tx.transaction.create({
          data: {
            userId: winningPlayers[0].userId, // Could be a system account
            type: 'PLATFORM_FEE',
            amount: platformFee,
            status: 'COMPLETED',
            metadata: JSON.stringify({
              matchId,
              feePercentage: PLATFORM_FEE_PERCENTAGE * 100,
            }),
          },
        });

        ids.push(platformFeeTransaction.id);

        return ids;
      }
    );

    return {
      success: true,
      transactions: transactionIds,
      totalDistributed: winningsPerPlayer * winningPlayers.length,
      platformFee,
    };
  } catch (error) {
    console.error('Error distributing match winnings:', error);
    return {
      success: false,
      transactions: [],
      totalDistributed: 0,
      platformFee: 0,
      error: 'Failed to distribute winnings',
    };
  }
}

/**
 * Refund all players in a match
 */
export async function refundMatch(matchId: string): Promise<WagerDeductionResult> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        players: true,
      },
    });

    if (!match) {
      return {
        success: false,
        transactions: [],
        error: 'Match not found',
      };
    }

    // Refund all players in a single database transaction
    const transactionIds = await prisma.$transaction(
      async (tx) => {
        const ids: string[] = [];

        for (const player of match.players) {
          // Add credits back to player
          await tx.user.update({
            where: { id: player.userId },
            data: {
              credits: {
                increment: match.wager,
              },
            },
          });

          // Create transaction record
          const transaction = await tx.transaction.create({
            data: {
              userId: player.userId,
              type: 'MATCH_WIN', // Use MATCH_WIN for refunds (positive amount)
              amount: match.wager,
              status: 'COMPLETED',
              metadata: JSON.stringify({
                matchId,
                reason: 'Match refunded',
              }),
            },
          });

          ids.push(transaction.id);
        }

        return ids;
      }
    );

    return {
      success: true,
      transactions: transactionIds,
    };
  } catch (error) {
    console.error('Error refunding match:', error);
    return {
      success: false,
      transactions: [],
      error: 'Failed to refund match',
    };
  }
}

/**
 * Get transaction history for a user
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  return await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Get transaction statistics for a user
 */
export async function getUserTransactionStats(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
  });

  const stats = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalWinnings: 0,
    totalLosses: 0,
    platformFeePaid: 0,
    netProfit: 0,
  };

  transactions.forEach((t) => {
    switch (t.type) {
      case 'DEPOSIT':
        stats.totalDeposits += t.amount;
        break;
      case 'WITHDRAWAL':
        stats.totalWithdrawals += Math.abs(t.amount);
        break;
      case 'MATCH_WIN':
        stats.totalWinnings += t.amount;
        break;
      case 'MATCH_LOSS':
        stats.totalLosses += Math.abs(t.amount);
        break;
      case 'PLATFORM_FEE':
        stats.platformFeePaid += t.amount;
        break;
    }
  });

  stats.netProfit = stats.totalWinnings - stats.totalLosses;

  return stats;
}

export default {
  hasSufficientCredits,
  getUserBalance,
  deductCredits,
  addCredits,
  deductMatchWagers,
  distributeMatchWinnings,
  refundMatch,
  getUserTransactions,
  getUserTransactionStats,
  PLATFORM_FEE_PERCENTAGE,
};
