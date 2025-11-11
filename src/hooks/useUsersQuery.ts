import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  updateMyProfile,
  getMyStats,
  searchUsers,
  getUserByUsername,
  UpdateProfileData,
  SearchUsersParams,
} from '../api/users';
import { useToast } from '../components/ui/Toast';
import { userKeys } from './useAuthQuery';

/**
 * Hook to get user stats
 */
export const useMyStats = () => {
  return useQuery({
    queryKey: [...userKeys.current, 'stats'],
    queryFn: getMyStats,
  });
};

/**
 * Hook to update profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateMyProfile(data),
    onSuccess: (updatedUser) => {
      // Update current user in cache
      queryClient.setQueryData(userKeys.current, updatedUser);

      // Also update in profile cache if exists
      queryClient.setQueryData(userKeys.profile(updatedUser.username), updatedUser);

      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile.';
      toast.error(message);
    },
  });
};

/**
 * Hook to search users
 */
export const useSearchUsers = (params: SearchUsersParams) => {
  return useQuery({
    queryKey: ['users', 'search', params],
    queryFn: () => searchUsers(params),
    enabled: !!params.query && params.query.length > 0,
  });
};

/**
 * Hook to get user by username
 */
export const useUserByUsername = (username: string) => {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  });
};
