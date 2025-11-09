import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendFriendRequestSchema, getFriendsSchema } from '../validators/social';
import { notifyFriendRequest, notifyFriendRequestAccepted } from '../services/notification';

/**
 * Social Controller
 * Handles friend requests and friend management
 */

/**
 * POST /friends/request
 * Send a friend request
 */
export async function sendFriendRequest(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { friendId } = sendFriendRequestSchema.parse(req.body);

    // Cannot send friend request to yourself
    if (userId === friendId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: friendId },
      select: { id: true, username: true, accountStatus: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.accountStatus !== 'ACTIVE') {
      return res.status(400).json({ error: 'Cannot send friend request to this user' });
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'You are already friends with this user' });
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId, status: 'PENDING' },
          { senderId: friendId, receiverId: userId, status: 'PENDING' },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.senderId === userId) {
        return res.status(400).json({ error: 'Friend request already sent' });
      } else {
        return res.status(400).json({ error: 'This user has already sent you a friend request' });
      }
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: friendId,
        status: 'PENDING',
      },
    });

    // Send notification
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await notifyFriendRequest(friendId, userId, sender!.username);

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendRequest,
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(400).json({ error: 'Failed to send friend request' });
  }
}

/**
 * PUT /friends/accept/:userId
 * Accept a friend request
 */
export async function acceptFriendRequest(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { userId: senderId } = req.params;

    // Find pending friend request
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Accept request and create friendships in transaction
    await prisma.$transaction([
      // Update friend request status
      prisma.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: 'ACCEPTED' },
      }),
      // Create bidirectional friendship
      prisma.friendship.create({
        data: {
          userId,
          friendId: senderId,
        },
      }),
      prisma.friendship.create({
        data: {
          userId: senderId,
          friendId: userId,
        },
      }),
    ]);

    // Send notification to sender
    const accepter = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await notifyFriendRequestAccepted(senderId, userId, accepter!.username);

    res.json({
      message: 'Friend request accepted',
      friend: friendRequest.sender,
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(400).json({ error: 'Failed to accept friend request' });
  }
}

/**
 * PUT /friends/reject/:userId
 * Reject a friend request
 */
export async function rejectFriendRequest(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { userId: senderId } = req.params;

    // Find pending friend request
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId: userId,
        status: 'PENDING',
      },
    });

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Update friend request status
    await prisma.friendRequest.update({
      where: { id: friendRequest.id },
      data: { status: 'REJECTED' },
    });

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(400).json({ error: 'Failed to reject friend request' });
  }
}

/**
 * DELETE /friends/:friendId
 * Remove a friend
 */
export async function removeFriend(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { friendId } = req.params;

    // Check if friendship exists
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    // Delete bidirectional friendship
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(400).json({ error: 'Failed to remove friend' });
  }
}

/**
 * GET /friends
 * Get list of friends
 */
export async function getFriends(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { status, limit, offset } = getFriendsSchema.parse(req.query);

    // Build where clause
    const where: any = {
      userId,
    };

    if (status !== 'all') {
      where.friend = {
        status: status === 'online' ? { in: ['ONLINE', 'AWAY'] } : 'OFFLINE',
      };
    }

    // Get friends
    const [friendships, total] = await Promise.all([
      prisma.friendship.findMany({
        where,
        include: {
          friend: {
            select: {
              id: true,
              username: true,
              status: true,
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
                take: 3, // Top 3 games
              },
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.friendship.count({ where }),
    ]);

    const friends = friendships.map((f) => f.friend);

    res.json({
      friends,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(400).json({ error: 'Failed to fetch friends' });
  }
}

/**
 * GET /friends/requests
 * Get all pending friend requests (received)
 */
export async function getFriendRequests(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
}

/**
 * GET /friends/requests/sent
 * Get all sent friend requests
 */
export async function getSentFriendRequests(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const requests = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching sent friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch sent friend requests' });
  }
}

export default {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  getSentFriendRequests,
};
