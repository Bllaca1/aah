import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTeam,
  getTeam,
  updateTeam,
  inviteUser,
  acceptInvite,
  removeTeamMember,
  disbandTeam,
  getMyTeamInvites,
  CreateTeamData,
  UpdateTeamData,
  InviteUserData,
} from '../api/teams';
import { useToast } from '../components/ui/Toast';
import { userKeys } from './useAuthQuery';

/**
 * Query keys for teams
 */
export const teamKeys = {
  all: ['teams'] as const,
  detail: (id: string) => [...teamKeys.all, 'detail', id] as const,
  myInvites: () => [...teamKeys.all, 'myInvites'] as const,
};

/**
 * Hook to get team details
 */
export const useTeam = (teamId: string | null | undefined) => {
  return useQuery({
    queryKey: teamKeys.detail(teamId || ''),
    queryFn: () => getTeam(teamId!),
    enabled: !!teamId,
  });
};

/**
 * Hook to get my team invites
 */
export const useMyTeamInvites = () => {
  return useQuery({
    queryKey: teamKeys.myInvites(),
    queryFn: getMyTeamInvites,
  });
};

/**
 * Hook to create a team
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateTeamData) => createTeam(data),
    onSuccess: (newTeam) => {
      // Add to cache
      queryClient.setQueryData(teamKeys.detail(newTeam.id), newTeam);

      // Invalidate current user to update teamId
      queryClient.invalidateQueries({ queryKey: userKeys.current });

      toast.success('Team created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create team.';
      toast.error(message);
    },
  });
};

/**
 * Hook to update team
 */
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: UpdateTeamData }) =>
      updateTeam(teamId, data),
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData(teamKeys.detail(updatedTeam.id), updatedTeam);

      toast.success('Team updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update team.';
      toast.error(message);
    },
  });
};

/**
 * Hook to invite user to team
 */
export const useInviteToTeam = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: InviteUserData }) =>
      inviteUser(teamId, data),
    onSuccess: () => {
      toast.success('Team invitation sent!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send invitation.';
      toast.error(message);
    },
  });
};

/**
 * Hook to accept team invite
 */
export const useAcceptTeamInvite = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (teamId: string) => acceptInvite(teamId),
    onSuccess: (team) => {
      // Update team in cache
      queryClient.setQueryData(teamKeys.detail(team.id), team);

      // Invalidate invites
      queryClient.invalidateQueries({ queryKey: teamKeys.myInvites() });

      // Invalidate current user
      queryClient.invalidateQueries({ queryKey: userKeys.current });

      toast.success('Joined team successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to join team.';
      toast.error(message);
    },
  });
};

/**
 * Hook to remove team member
 */
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(teamId, userId),
    onSuccess: (_, variables) => {
      // Invalidate team to refetch
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });

      toast.success('Member removed from team');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove member.';
      toast.error(message);
    },
  });
};

/**
 * Hook to disband team
 */
export const useDisbandTeam = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (teamId: string) => disbandTeam(teamId),
    onSuccess: (_, teamId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: teamKeys.detail(teamId) });

      // Invalidate current user
      queryClient.invalidateQueries({ queryKey: userKeys.current });

      toast.success('Team disbanded');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to disband team.';
      toast.error(message);
    },
  });
};
