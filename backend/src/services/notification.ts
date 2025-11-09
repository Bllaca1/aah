import { prisma } from '../lib/prisma';
import { NotificationType } from '@prisma/client';
import { EventEmitter } from 'events';

/**
 * Notification Service
 * Handles both real-time (WebSocket) and persistent (database) notifications
 */

// Event emitter for real-time notifications
export const notificationEmitter = new EventEmitter();

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: Record<string, any>;
}

export interface BulkNotificationPayload {
  userIds: string[];
  type: NotificationType;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification for a user and emit real-time event
 */
export async function createNotification(
  payload: NotificationPayload
): Promise<string> {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        message: payload.message,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
        read: false,
      },
    });

    // Emit real-time event for WebSocket listeners
    notificationEmitter.emit('notification', {
      userId: payload.userId,
      notification: {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        metadata: payload.metadata,
        createdAt: notification.createdAt,
        read: false,
      },
    });

    return notification.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

/**
 * Create notifications for multiple users (bulk operation)
 */
export async function createBulkNotifications(
  payload: BulkNotificationPayload
): Promise<string[]> {
  try {
    const notifications = await prisma.$transaction(
      payload.userIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            type: payload.type,
            message: payload.message,
            metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
            read: false,
          },
        })
      )
    );

    // Emit real-time events for all users
    notifications.forEach((notification) => {
      notificationEmitter.emit('notification', {
        userId: notification.userId,
        notification: {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          metadata: payload.metadata,
          createdAt: notification.createdAt,
          read: false,
        },
      });
    });

    return notifications.map((n) => n.id);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw new Error('Failed to create bulk notifications');
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  unreadOnly: boolean = false
) {
  return await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { read: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  });

  return result.count;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await prisma.notification.delete({
    where: { id: notificationId },
  });
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(userId: string): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: { userId },
  });

  return result.count;
}

/**
 * Get count of unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

// Notification helper functions for common scenarios

/**
 * Send friend request notification
 */
export async function notifyFriendRequest(
  recipientId: string,
  senderId: string,
  senderUsername: string
): Promise<void> {
  await createNotification({
    userId: recipientId,
    type: 'FRIEND_REQUEST',
    message: `${senderUsername} sent you a friend request`,
    metadata: {
      senderId,
      senderUsername,
    },
  });
}

/**
 * Send friend request accepted notification
 */
export async function notifyFriendRequestAccepted(
  recipientId: string,
  accepterId: string,
  accepterUsername: string
): Promise<void> {
  await createNotification({
    userId: recipientId,
    type: 'FRIEND_REQUEST_ACCEPTED',
    message: `${accepterUsername} accepted your friend request`,
    metadata: {
      accepterId,
      accepterUsername,
    },
  });
}

/**
 * Send team invite notification
 */
export async function notifyTeamInvite(
  recipientId: string,
  teamId: string,
  teamName: string,
  senderUsername: string
): Promise<void> {
  await createNotification({
    userId: recipientId,
    type: 'TEAM_INVITE',
    message: `${senderUsername} invited you to join team ${teamName}`,
    metadata: {
      teamId,
      teamName,
      senderUsername,
    },
  });
}

/**
 * Send team invite accepted notification
 */
export async function notifyTeamInviteAccepted(
  recipientId: string,
  teamId: string,
  teamName: string,
  accepterUsername: string
): Promise<void> {
  await createNotification({
    userId: recipientId,
    type: 'TEAM_INVITE_ACCEPTED',
    message: `${accepterUsername} joined your team ${teamName}`,
    metadata: {
      teamId,
      teamName,
      accepterUsername,
    },
  });
}

/**
 * Send match invite notification
 */
export async function notifyMatchInvite(
  recipientId: string,
  matchId: string,
  gameName: string,
  senderUsername: string
): Promise<void> {
  await createNotification({
    userId: recipientId,
    type: 'MATCH_INVITE',
    message: `${senderUsername} invited you to a ${gameName} match`,
    metadata: {
      matchId,
      gameName,
      senderUsername,
    },
  });
}

/**
 * Send match lobby invite notification to all team members
 */
export async function notifyMatchLobby(
  userIds: string[],
  matchId: string,
  gameName: string
): Promise<void> {
  await createBulkNotifications({
    userIds,
    type: 'MATCH_LOBBY_INVITE',
    message: `A ${gameName} match is starting soon`,
    metadata: {
      matchId,
      gameName,
    },
  });
}

/**
 * Send dispute update notification
 */
export async function notifyDisputeUpdate(
  recipientId: string,
  matchId: string,
  status: string,
  message: string
): Promise<void> {
  await createNotification({
    userId: recipientId,
    type: 'DISPUTE_UPDATE',
    message,
    metadata: {
      matchId,
      disputeStatus: status,
    },
  });
}

/**
 * Send match result notification to all players
 */
export async function notifyMatchResult(
  userIds: string[],
  matchId: string,
  winningTeam: 'A' | 'B',
  gameName: string
): Promise<void> {
  await createBulkNotifications({
    userIds,
    type: 'GENERIC',
    message: `Match completed! Team ${winningTeam} won the ${gameName} match`,
    metadata: {
      matchId,
      winningTeam,
      gameName,
    },
  });
}

/**
 * Send blocked interaction notification
 */
export async function notifyBlockedInteraction(
  recipientId: string,
  action: string
): Promise<void> {
  await createNotification({
    userId: recipientId,
    type: 'BLOCKED_INTERACTION',
    message: `Action blocked: ${action}`,
    metadata: {
      action,
    },
  });
}

/**
 * Clean up old read notifications (housekeeping)
 * Can be run periodically via cron job
 */
export async function cleanupOldNotifications(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      read: true,
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

export default {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  notifyFriendRequest,
  notifyFriendRequestAccepted,
  notifyTeamInvite,
  notifyTeamInviteAccepted,
  notifyMatchInvite,
  notifyMatchLobby,
  notifyDisputeUpdate,
  notifyMatchResult,
  notifyBlockedInteraction,
  cleanupOldNotifications,
  notificationEmitter,
};
