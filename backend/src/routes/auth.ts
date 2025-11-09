import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.js';
import {
  requireAuth,
  authRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/auth.js';

const router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', authRateLimiter, register);

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', authRateLimiter, login);

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', refreshToken);

/**
 * POST /auth/logout
 * Logout user (requires authentication)
 */
router.post('/logout', requireAuth, logout);

/**
 * POST /auth/verify-email
 * Verify email address
 */
router.post('/verify-email', verifyEmail);

/**
 * POST /auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);

/**
 * POST /auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', passwordResetRateLimiter, resetPassword);

export default router;
