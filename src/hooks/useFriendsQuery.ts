import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  getSentFriendRequests,
  SendFriendRequestData,
} from '../api/friends';
import { useToast } from '../components/ui/Toast';
import { userKeys } from './useAuthQuery';

/**
 * Query keys for friends
 */
export const friendKeys = {
  all: ['friends'] as const,
  list: () => [...friendKeys.all, 'list'] as const,
  requests: () => [...friendKeys.all, 'requests'] as const,
  requestsSent: () => [...friendKeys.all, 'requests', 'sent'] as const,
};

/**
 * Hook to get friends list
 */
export const useFriends = () => {
  return useQuery({
    queryKey: friendKeys.list(),
    queryFn: getFriends,
  });
};

/**
 * Hook to get friend requests
 */
export const useFriendRequests = () => {
  return useQuery({
    queryKey: friendKeys.requests(),
    queryFn: getFriendRequests,
  });
};

/**
 * Hook to get sent friend requests
 */
export const useSentFriendRequests = () => {
  return useQuery({
    queryKey: friendKeys.requestsSent(),
    queryFn: getSentFriendRequests,
  });
};

/**
 * Hook to send friend request
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: SendFriendRequestData) => sendFriendRequest(data),
    onSuccess: () => {
      // Invalidate sent requests
      queryClient.invalidateQueries({ queryKey: friendKeys.requestsSent() });

      toast.success('Friend request sent!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send friend request.';
      toast.error(message);
    },
  });
};

/**
 * Hook to accept friend request
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (userId: string) => acceptFriendRequest(userId),
    onSuccess: () => {
      // Invalidate friends list and requests
      queryClient.invalidateQueries({ queryKey: friendKeys.list() });
      queryClient.invalidateQueries({ queryKey: friendKeys.requests() });

      // Invalidate current user to update friends array
      queryClient.invalidateQueries({ queryKey: userKeys.current });

      toast.success('Friend request accepted!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to accept friend request.';
      toast.error(message);
    },
  });
};

/**
 * Hook to reject friend request
 */
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (userId: string) => rejectFriendRequest(userId),
    onSuccess: () => {
      // Invalidate requests
      queryClient.invalidateQueries({ queryKey: friendKeys.requests() });

      toast.info('Friend request rejected');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reject friend request.';
      toast.error(message);
    },
  });
};

/**
 * Hook to remove friend
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (friendId: string) => removeFriend(friendId),
    onSuccess: () => {
      // Invalidate friends list
      queryClient.invalidateQueries({ queryKey: friendKeys.list() });

      // Invalidate current user
      queryClient.invalidateQueries({ queryKey: userKeys.current });

      toast.success('Friend removed');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove friend.';
      toast.error(message);
    },
  });
};
