export const authConfig = {
  jwt: {
    // JWT Secrets - In production, these should be environment variables
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-change-in-production',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production',

    // Token expiry times
    accessTokenExpiry: '15m',  // 15 minutes
    refreshTokenExpiry: '7d',  // 7 days
    emailVerificationExpiry: '24h', // 24 hours
    passwordResetExpiry: '1h', // 1 hour
  },

  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    name: 'betduel.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax' as const,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },

  rateLimit: {
    // Authentication endpoints rate limiting
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many authentication attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    },

    // General API rate limiting
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
      message: 'Too many requests, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    },

    // Password reset rate limiting (stricter)
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 attempts per hour
      message: 'Too many password reset attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    },
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },

  // Email configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@betduel.com',
    fromName: process.env.EMAIL_FROM_NAME || 'BetDuel',
  },
};
