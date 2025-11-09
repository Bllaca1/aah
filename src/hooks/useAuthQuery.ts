import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  login,
  register,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  LoginData,
  RegisterData,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
} from '../api';
import { getMyProfile } from '../api/users';
import { getAuthToken } from '../api/client';
import { useToast } from '../components/ui/Toast';

/**
 * Query key for current user
 */
export const userKeys = {
  current: ['user', 'current'] as const,
  profile: (username: string) => ['user', 'profile', username] as const,
};

/**
 * Hook to get current authenticated user
 */
export const useCurrentUser = () => {
  const hasToken = !!getAuthToken();

  return useQuery({
    queryKey: userKeys.current,
    queryFn: getMyProfile,
    enabled: hasToken, // Only fetch if we have a token
    retry: false,
  });
};

/**
 * Hook to login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: (data) => {
      // Set current user in cache
      queryClient.setQueryData(userKeys.current, data.user);
      toast.success('Successfully logged in!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    },
  });
};

/**
 * Hook to register
 */
export const useRegister = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: (data) => {
      // Set current user in cache
      queryClient.setQueryData(userKeys.current, data.user);
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    },
  });
};

/**
 * Hook to logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Still clear queries even if API call fails
      queryClient.clear();
    },
  });
};

/**
 * Hook to verify email
 */
export const useVerifyEmail = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (data: VerifyEmailData) => verifyEmail(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Email verification failed.';
      toast.error(message);
    },
  });
};

/**
 * Hook to request password reset
 */
export const useForgotPassword = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (data: ForgotPasswordData) => forgotPassword(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset email.';
      toast.error(message);
    },
  });
};

/**
 * Hook to reset password
 */
export const useResetPassword = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (data: ResetPasswordData) => resetPassword(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Password reset failed.';
      toast.error(message);
    },
  });
};
