import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { updateProfileSchema, searchUsersSchema } from '../validators/user';

/**
 * User Controller
 * Handles user profile and search operations
 */

/**
 * GET /users/me
 * Get current user's profile
 */
export async function getMyProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        credits: true,
        role: true,
        status: true,
        accountStatus: true,
        createdAt: true,
        profile: true,
        elos: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            friends: true,
            matchesPlayed: true,
            teamsIn: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get win/loss statistics
    const matches = await prisma.matchPlayer.findMany({
      where: {
        userId,
        match: {
          status: 'COMPLETED',
        },
      },
      include: {
        match: {
          select: {
            winningTeam: true,
          },
        },
      },
    });

    const wins = matches.filter((m) => m.team === m.match.winningTeam).length;
    const losses = matches.length - wins;

    res.json({
      ...user,
      stats: {
        wins,
        losses,
        winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * PUT /users/me
 * Update current user's profile
 */
export async function updateMyProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const updates = updateProfileSchema.parse(req.body);

    // Separate user updates from profile updates
    const userUpdates: any = {};
    const profileUpdates: any = {};

    if (updates.status !== undefined) {
      userUpdates.status = updates.status;
    }

    if (updates.discordId !== undefined) {
      profileUpdates.discordId = updates.discordId;
    }
    if (updates.fortniteId !== undefined) {
      profileUpdates.fortniteId = updates.fortniteId;
    }
    if (updates.cs2Id !== undefined) {
      profileUpdates.cs2Id = updates.cs2Id;
    }
    if (updates.brawlhallaId !== undefined) {
      profileUpdates.brawlhallaId = updates.brawlhallaId;
    }

    // Update user and profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...userUpdates,
        profile: {
          upsert: {
            create: profileUpdates,
            update: profileUpdates,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ error: 'Failed to update profile' });
  }
}

/**
 * GET /users/search
 * Search for users by username
 */
export async function searchUsers(req: Request, res: Response) {
  try {
    const { query, limit, offset } = searchUsersSchema.parse(req.query);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          username: {
            contains: query,
            mode: 'insensitive',
          },
          accountStatus: 'ACTIVE', // Only show active accounts
        },
        select: {
          id: true,
          username: true,
          status: true,
          createdAt: true,
          elos: {
            include: {
              game: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          username: 'asc',
        },
      }),
      prisma.user.count({
        where: {
          username: {
            contains: query,
            mode: 'insensitive',
          },
          accountStatus: 'ACTIVE',
        },
      }),
    ]);

    res.json({
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(400).json({ error: 'Failed to search users' });
  }
}

/**
 * GET /users/:username
 * Get user profile by username
 */
export async function getUserByUsername(req: Request, res: Response) {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        status: true,
        createdAt: true,
        profile: true,
        elos: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            elo: 'desc',
          },
        },
        teamsIn: {
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
        },
        _count: {
          select: {
            friends: true,
            matchesPlayed: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't show banned/suspended users publicly
    const fullUser = await prisma.user.findUnique({
      where: { username },
      select: { accountStatus: true },
    });

    if (fullUser?.accountStatus !== 'ACTIVE') {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get win/loss statistics
    const matches = await prisma.matchPlayer.findMany({
      where: {
        userId: user.id,
        match: {
          status: 'COMPLETED',
        },
      },
      include: {
        match: {
          select: {
            winningTeam: true,
          },
        },
      },
    });

    const wins = matches.filter((m) => m.team === m.match.winningTeam).length;
    const losses = matches.length - wins;

    res.json({
      ...user,
      stats: {
        wins,
        losses,
        winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

/**
 * GET /users/me/stats
 * Get detailed statistics for current user
 */
export async function getMyStats(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    // Get all completed matches
    const matches = await prisma.matchPlayer.findMany({
      where: {
        userId,
        match: {
          status: 'COMPLETED',
        },
      },
      include: {
        match: {
          select: {
            winningTeam: true,
            wager: true,
            gameId: true,
            createdAt: true,
          },
        },
      },
    });

    const wins = matches.filter((m) => m.team === m.match.winningTeam).length;
    const losses = matches.length - wins;

    // Get ELO by game
    const elos = await prisma.userElo.findMany({
      where: { userId },
      include: {
        game: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        elo: 'desc',
      },
    });

    // Calculate total winnings/losses
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: {
          in: ['MATCH_WIN', 'MATCH_LOSS'],
        },
        status: 'COMPLETED',
      },
    });

    const totalWinnings = transactions
      .filter((t) => t.type === 'MATCH_WIN')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalLosses = Math.abs(
      transactions
        .filter((t) => t.type === 'MATCH_LOSS')
        .reduce((sum, t) => sum + t.amount, 0)
    );

    const netProfit = totalWinnings - totalLosses;

    // Get good sport rating average
    const goodSportRatings = matches
      .filter((m) => m.goodSportRating !== null)
      .map((m) => m.goodSportRating!);

    const avgGoodSportRating =
      goodSportRatings.length > 0
        ? goodSportRatings.reduce((sum, r) => sum + r, 0) / goodSportRatings.length
        : null;

    res.json({
      matchStats: {
        totalMatches: matches.length,
        wins,
        losses,
        winRate: matches.length > 0 ? (wins / matches.length) * 100 : 0,
      },
      financialStats: {
        totalWinnings,
        totalLosses,
        netProfit,
      },
      elos,
      goodSportRating: avgGoodSportRating,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

export default {
  getMyProfile,
  updateMyProfile,
  searchUsers,
  getUserByUsername,
  getMyStats,
};
