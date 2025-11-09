import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '../services/auth.js';
import { authConfig } from '../config/auth.js';

/**
 * Extended Request interface with user information
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token, 'access');

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
        return;
      } else if (error.message === 'Invalid token') {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
        return;
      }
    }

    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Middleware to require specific role
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: authConfig.rateLimit.auth.windowMs,
  max: authConfig.rateLimit.auth.max,
  message: authConfig.rateLimit.auth.message,
  standardHeaders: authConfig.rateLimit.auth.standardHeaders,
  legacyHeaders: authConfig.rateLimit.auth.legacyHeaders,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: authConfig.rateLimit.auth.message,
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * Rate limiter for password reset endpoints
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: authConfig.rateLimit.passwordReset.windowMs,
  max: authConfig.rateLimit.passwordReset.max,
  message: authConfig.rateLimit.passwordReset.message,
  standardHeaders: authConfig.rateLimit.passwordReset.standardHeaders,
  legacyHeaders: authConfig.rateLimit.passwordReset.legacyHeaders,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: authConfig.rateLimit.passwordReset.message,
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * General API rate limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: authConfig.rateLimit.api.windowMs,
  max: authConfig.rateLimit.api.max,
  message: authConfig.rateLimit.api.message,
  standardHeaders: authConfig.rateLimit.api.standardHeaders,
  legacyHeaders: authConfig.rateLimit.api.legacyHeaders,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: authConfig.rateLimit.api.message,
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token, 'access');

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
}
