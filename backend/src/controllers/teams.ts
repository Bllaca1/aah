import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  createTeamSchema,
  updateTeamSchema,
  inviteUserSchema,
  removeTeamMemberSchema,
} from '../validators/team';
import { notifyTeamInvite, notifyTeamInviteAccepted } from '../services/notification';

/**
 * Team Controller
 * Handles all team-related operations
 */

/**
 * POST /teams
 * Create a new team
 */
export async function createTeam(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { name, tag } = createTeamSchema.parse(req.body);

    // Check if team name already exists
    const existingName = await prisma.team.findFirst({
      where: { name },
    });

    if (existingName) {
      return res.status(400).json({ error: 'Team name already exists' });
    }

    // Check if team tag already exists
    const existingTag = await prisma.team.findFirst({
      where: { tag },
    });

    if (existingTag) {
      return res.status(400).json({ error: 'Team tag already exists' });
    }

    // Create team with user as captain
    const team = await prisma.team.create({
      data: {
        name,
        tag,
        captainId: userId,
        wins: 0,
        losses: 0,
      },
    });

    // Add creator as first team member
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
      },
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(400).json({ error: 'Failed to create team' });
  }
}

/**
 * GET /teams/:id
 * Get team details by ID
 */
export async function getTeam(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        captain: {
          select: {
            id: true,
            username: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                status: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
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
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
}

/**
 * PUT /teams/:id
 * Update team details (captain only)
 */
export async function updateTeam(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updates = updateTeamSchema.parse(req.body);

    // Get team
    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is captain
    if (team.captainId !== userId) {
      return res.status(403).json({ error: 'Only the team captain can update team details' });
    }

    // Check if new name already exists
    if (updates.name && updates.name !== team.name) {
      const existingName = await prisma.team.findFirst({
        where: { name: updates.name },
      });

      if (existingName) {
        return res.status(400).json({ error: 'Team name already exists' });
      }
    }

    // Check if new tag already exists
    if (updates.tag && updates.tag !== team.tag) {
      const existingTag = await prisma.team.findFirst({
        where: { tag: updates.tag },
      });

      if (existingTag) {
        return res.status(400).json({ error: 'Team tag already exists' });
      }
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updates,
    });

    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(400).json({ error: 'Failed to update team' });
  }
}

/**
 * POST /teams/:id/invite
 * Invite a user to join the team (captain only)
 */
export async function inviteUser(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: teamId } = req.params;
    const { userId: inviteeId } = inviteUserSchema.parse(req.body);

    // Get team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is captain
    if (team.captainId !== userId) {
      return res.status(403).json({ error: 'Only the team captain can invite members' });
    }

    // Check if invitee exists
    const invitee = await prisma.user.findUnique({
      where: { id: inviteeId },
      select: { id: true, username: true },
    });

    if (!invitee) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const isMember = team.members.some((m) => m.userId === inviteeId);
    if (isMember) {
      return res.status(400).json({ error: 'User is already a team member' });
    }

    // Check if invite already exists
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        teamId,
        receiverId: inviteeId,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      return res.status(400).json({ error: 'An invite has already been sent to this user' });
    }

    // Create invite
    const invite = await prisma.teamInvite.create({
      data: {
        teamId,
        senderId: userId,
        receiverId: inviteeId,
        status: 'PENDING',
      },
    });

    // Send notification
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await notifyTeamInvite(inviteeId, teamId, team.name, sender!.username);

    res.status(201).json({
      message: 'Team invite sent successfully',
      invite,
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(400).json({ error: 'Failed to send team invite' });
  }
}

/**
 * PUT /teams/:id/accept-invite
 * Accept a team invite
 */
export async function acceptInvite(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: teamId } = req.params;

    // Find pending invite
    const invite = await prisma.teamInvite.findFirst({
      where: {
        teamId,
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        team: true,
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!invite) {
      return res.status(404).json({ error: 'No pending invite found' });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Accept invite and add member in transaction
    await prisma.$transaction([
      // Update invite status
      prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      }),
      // Add team member
      prisma.teamMember.create({
        data: {
          teamId,
          userId,
        },
      }),
    ]);

    // Notify team captain
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await notifyTeamInviteAccepted(
      invite.senderId,
      teamId,
      invite.team.name,
      user!.username
    );

    res.json({
      message: 'Successfully joined team',
      team: invite.team,
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(400).json({ error: 'Failed to accept invite' });
  }
}

/**
 * DELETE /teams/:id/members/:userId
 * Remove a team member (captain only, or self)
 */
export async function removeTeamMember(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: teamId, userId: memberId } = req.params;

    // Get team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is captain or removing themselves
    const isCaptain = team.captainId === userId;
    const isSelf = userId === memberId;

    if (!isCaptain && !isSelf) {
      return res.status(403).json({ error: 'You do not have permission to remove this member' });
    }

    // Cannot remove captain
    if (memberId === team.captainId) {
      return res.status(400).json({ error: 'Cannot remove team captain. Disband team or transfer captaincy first.' });
    }

    // Check if member exists
    const member = team.members.find((m) => m.userId === memberId);
    if (!member) {
      return res.status(404).json({ error: 'User is not a member of this team' });
    }

    // Remove member
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: memberId,
        },
      },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(400).json({ error: 'Failed to remove team member' });
  }
}

/**
 * DELETE /teams/:id
 * Disband team (captain only)
 */
export async function disbandTeam(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: teamId } = req.params;

    // Get team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is captain
    if (team.captainId !== userId) {
      return res.status(403).json({ error: 'Only the team captain can disband the team' });
    }

    // Delete team (cascade will handle members, invites, etc.)
    await prisma.team.delete({
      where: { id: teamId },
    });

    res.json({ message: 'Team disbanded successfully' });
  } catch (error) {
    console.error('Error disbanding team:', error);
    res.status(400).json({ error: 'Failed to disband team' });
  }
}

/**
 * GET /teams/:id/invites
 * Get all pending invites for a team (captain only)
 */
export async function getTeamInvites(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id: teamId } = req.params;

    // Get team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is captain
    if (team.captainId !== userId) {
      return res.status(403).json({ error: 'Only the team captain can view invites' });
    }

    // Get pending invites
    const invites = await prisma.teamInvite.findMany({
      where: {
        teamId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(invites);
  } catch (error) {
    console.error('Error fetching team invites:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
}

/**
 * GET /users/me/team-invites
 * Get all team invites for current user
 */
export async function getMyTeamInvites(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const invites = await prisma.teamInvite.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        team: true,
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(invites);
  } catch (error) {
    console.error('Error fetching user team invites:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
}

export default {
  createTeam,
  getTeam,
  updateTeam,
  inviteUser,
  acceptInvite,
  removeTeamMember,
  disbandTeam,
  getTeamInvites,
  getMyTeamInvites,
};
