import apiClient, { setAuthToken, setRefreshToken, clearAuthTokens } from './client';
import type { User } from '../types';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

/**
 * Register a new user
 * POST /auth/register
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);

  // Store tokens
  setAuthToken(response.data.accessToken);
  setRefreshToken(response.data.refreshToken);

  return response.data;
};

/**
 * Login user
 * POST /auth/login
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);

  // Store tokens
  setAuthToken(response.data.accessToken);
  setRefreshToken(response.data.refreshToken);

  return response.data;
};

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    // Clear tokens even if request fails
    clearAuthTokens();
  }
};

/**
 * Refresh access token
 * POST /auth/refresh
 */
export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh', {
    refreshToken,
  });

  // Update tokens
  setAuthToken(response.data.accessToken);
  if (response.data.refreshToken) {
    setRefreshToken(response.data.refreshToken);
  }

  return response.data;
};

/**
 * Verify email address
 * POST /auth/verify-email
 */
export const verifyEmail = async (data: VerifyEmailData): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/verify-email', data);
  return response.data;
};

/**
 * Request password reset
 * POST /auth/forgot-password
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/forgot-password', data);
  return response.data;
};

/**
 * Reset password with token
 * POST /auth/reset-password
 */
export const resetPassword = async (data: ResetPasswordData): Promise<{ message: string }> => {
  const response = await apiClient.post('/auth/reset-password', data);
  return response.data;
};
