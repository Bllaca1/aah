import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyToken,
  generateRandomToken,
  calculateTokenExpiry,
} from '../services/auth.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../services/email.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { authConfig } from '../config/auth.js';

/**
 * Register a new user
 * POST /auth/register
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        res.status(400).json({
          success: false,
          error: 'Email already registered',
        });
        return;
      } else {
        res.status(400).json({
          success: false,
          error: 'Username already taken',
        });
        return;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Generate email verification token
    const verificationToken = generateRandomToken();
    const verificationExpiry = calculateTokenExpiry(authConfig.jwt.emailVerificationExpiry);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpiry,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${validatedData.username}`,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(validatedData.email, validatedData.username, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user is created
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
}

/**
 * Login user
 * POST /auth/login
 */
export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Check if account is banned
    if (user.accountStatus === 'BANNED') {
      res.status(403).json({
        success: false,
        error: 'Account is banned',
        banReason: user.banReason,
      });
      return;
    }

    if (user.accountStatus === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        error: 'Account is suspended',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user.password, validatedData.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email!, user.role);

    // Update user status to ONLINE
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ONLINE' },
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          credits: user.credits,
          rating: user.rating,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
}

/**
 * Refresh access token
 * POST /auth/refresh
 */
export async function refreshToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const decoded = verifyToken(validatedData.refreshToken, 'refresh');

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email!, user.role);

    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error('Refresh token error:', error);

    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(401).json({
          success: false,
          error: 'Refresh token expired',
          code: 'TOKEN_EXPIRED',
        });
        return;
      }
    }

    res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
    });
  }
}

/**
 * Logout user
 * POST /auth/logout
 */
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user) {
      // Update user status to OFFLINE
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { status: 'OFFLINE' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);

    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
}

/**
 * Verify email
 * POST /auth/verify-email
 */
export async function verifyEmail(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = verifyEmailSchema.parse(req.body);

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: validatedData.token,
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid verification token',
      });
      return;
    }

    // Check if token is expired
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      res.status(400).json({
        success: false,
        error: 'Verification token expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    // Check if already verified
    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        error: 'Email already verified',
      });
      return;
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email!, user.username);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);

    res.status(500).json({
      success: false,
      error: 'Email verification failed',
    });
  }
}

/**
 * Request password reset
 * POST /auth/forgot-password
 */
export async function forgotPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = forgotPasswordSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.',
      });
      return;
    }

    // Generate password reset token
    const resetToken = generateRandomToken();
    const resetExpiry = calculateTokenExpiry(authConfig.jwt.passwordResetExpiry);

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpiry,
      },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email!, user.username, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      success: false,
      error: 'Password reset request failed',
    });
  }
}

/**
 * Reset password
 * POST /auth/reset-password
 */
export async function resetPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Validate request body
    const validatedData = resetPasswordSchema.parse(req.body);

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: validatedData.token,
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid reset token',
      });
      return;
    }

    // Check if token is expired
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      res.status(400).json({
        success: false,
        error: 'Reset token expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Password reset failed',
    });
  }
}
