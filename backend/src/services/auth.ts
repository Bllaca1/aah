import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authConfig } from '../config/auth.js';

/**
 * Hash a password using Argon2
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id, // Use Argon2id (hybrid of Argon2i and Argon2d)
      memoryCost: 2 ** 16,   // 64 MB
      timeCost: 3,           // 3 iterations
      parallelism: 1,        // 1 thread
    });
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
}

/**
 * Generate JWT access and refresh tokens
 */
export function generateTokens(userId: string, email: string, role: string): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = jwt.sign(
    {
      userId,
      email,
      role,
      type: 'access',
    },
    authConfig.jwt.accessTokenSecret,
    {
      expiresIn: authConfig.jwt.accessTokenExpiry,
    } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    authConfig.jwt.refreshTokenSecret,
    {
      expiresIn: authConfig.jwt.refreshTokenExpiry,
    } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(
  token: string,
  type: 'access' | 'refresh' = 'access'
): any {
  try {
    const secret =
      type === 'access'
        ? authConfig.jwt.accessTokenSecret
        : authConfig.jwt.refreshTokenSecret;

    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Generate a random token for email verification or password reset
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate token expiry date
 */
export function calculateTokenExpiry(duration: string): Date {
  const now = new Date();

  // Parse duration string (e.g., '24h', '1h', '7d')
  const match = duration.match(/^(\d+)([hdm])$/);
  if (!match) {
    throw new Error('Invalid duration format');
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  switch (unit) {
    case 'h':
      now.setHours(now.getHours() + numValue);
      break;
    case 'd':
      now.setDate(now.getDate() + numValue);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + numValue);
      break;
    default:
      throw new Error('Invalid duration unit');
  }

  return now;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } =
    authConfig.password;

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
