import { z } from 'zod';
import { authConfig } from '../config/auth.js';

/**
 * Email validation schema
 */
const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation schema
 */
const passwordSchema = z
  .string()
  .min(authConfig.password.minLength, `Password must be at least ${authConfig.password.minLength} characters`)
  .refine(
    (password) => {
      if (authConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
        return false;
      }
      if (authConfig.password.requireLowercase && !/[a-z]/.test(password)) {
        return false;
      }
      if (authConfig.password.requireNumbers && !/\d/.test(password)) {
        return false;
      }
      if (authConfig.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return false;
      }
      return true;
    },
    {
      message: 'Password does not meet requirements',
    }
  );

/**
 * Username validation schema
 */
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

/**
 * Registration validation schema
 */
export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Email verification validation schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

/**
 * Type exports for TypeScript
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
