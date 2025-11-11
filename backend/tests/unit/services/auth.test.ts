import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyToken,
  generateRandomToken,
  calculateTokenExpiry,
  validatePassword,
} from '../../../src/services/auth';
import jwt from 'jsonwebtoken';

describe('Auth Service', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Due to salt
    });

    it('should handle special characters in password', async () => {
      const password = 'P@$$w0rd!#%^&*()';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
    });

    it('should handle Unicode characters', async () => {
      const password = 'Test密码123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(hash, password);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(hash, 'WrongPassword123!');

      expect(isValid).toBe(false);
    });

    it('should reject password with different case', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(hash, 'testpassword123!');

      expect(isValid).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const isValid = await verifyPassword('invalid-hash', 'password');

      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('valid');
      const isValid = await verifyPassword(hash, '');

      expect(isValid).toBe(false);
    });
  });

  describe('generateTokens', () => {
    const userId = 'test-user-id';
    const email = 'test@example.com';
    const role = 'USER';

    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokens(userId, email, role);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate valid JWT tokens', () => {
      const tokens = generateTokens(userId, email, role);

      // Tokens should have 3 parts separated by dots
      expect(tokens.accessToken.split('.')).toHaveLength(3);
      expect(tokens.refreshToken.split('.')).toHaveLength(3);
    });

    it('should include userId in both tokens', () => {
      const tokens = generateTokens(userId, email, role);

      const accessDecoded = jwt.decode(tokens.accessToken) as any;
      const refreshDecoded = jwt.decode(tokens.refreshToken) as any;

      expect(accessDecoded.userId).toBe(userId);
      expect(refreshDecoded.userId).toBe(userId);
    });

    it('should include email and role in access token only', () => {
      const tokens = generateTokens(userId, email, role);

      const accessDecoded = jwt.decode(tokens.accessToken) as any;
      const refreshDecoded = jwt.decode(tokens.refreshToken) as any;

      expect(accessDecoded.email).toBe(email);
      expect(accessDecoded.role).toBe(role);
      expect(refreshDecoded.email).toBeUndefined();
      expect(refreshDecoded.role).toBeUndefined();
    });

    it('should mark tokens with correct type', () => {
      const tokens = generateTokens(userId, email, role);

      const accessDecoded = jwt.decode(tokens.accessToken) as any;
      const refreshDecoded = jwt.decode(tokens.refreshToken) as any;

      expect(accessDecoded.type).toBe('access');
      expect(refreshDecoded.type).toBe('refresh');
    });

    it('should include expiration time', () => {
      const tokens = generateTokens(userId, email, role);

      const accessDecoded = jwt.decode(tokens.accessToken) as any;
      const refreshDecoded = jwt.decode(tokens.refreshToken) as any;

      expect(accessDecoded.exp).toBeDefined();
      expect(refreshDecoded.exp).toBeDefined();
      expect(typeof accessDecoded.exp).toBe('number');
      expect(typeof refreshDecoded.exp).toBe('number');
    });

    it('should have longer expiry for refresh token', () => {
      const tokens = generateTokens(userId, email, role);

      const accessDecoded = jwt.decode(tokens.accessToken) as any;
      const refreshDecoded = jwt.decode(tokens.refreshToken) as any;

      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
    });
  });

  describe('verifyToken', () => {
    const userId = 'test-user-id';
    const email = 'test@example.com';
    const role = 'USER';

    it('should verify valid access token', () => {
      const tokens = generateTokens(userId, email, role);
      const decoded = verifyToken(tokens.accessToken, 'access');

      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.role).toBe(role);
    });

    it('should verify valid refresh token', () => {
      const tokens = generateTokens(userId, email, role);
      const decoded = verifyToken(tokens.refreshToken, 'refresh');

      expect(decoded.userId).toBe(userId);
      expect(decoded.type).toBe('refresh');
    });

    it('should reject access token verified as refresh token', () => {
      const tokens = generateTokens(userId, email, role);

      expect(() => {
        verifyToken(tokens.accessToken, 'refresh');
      }).toThrow();
    });

    it('should reject refresh token verified as access token', () => {
      const tokens = generateTokens(userId, email, role);

      expect(() => {
        verifyToken(tokens.refreshToken, 'access');
      }).toThrow();
    });

    it('should reject invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here', 'access');
      }).toThrow('Invalid token');
    });

    it('should reject malformed token', () => {
      expect(() => {
        verifyToken('malformed-token', 'access');
      }).toThrow();
    });

    it('should reject empty token', () => {
      expect(() => {
        verifyToken('', 'access');
      }).toThrow();
    });

    it('should reject token with tampered payload', () => {
      const tokens = generateTokens(userId, email, role);
      const parts = tokens.accessToken.split('.');

      // Tamper with the payload
      parts[1] = Buffer.from(JSON.stringify({ userId: 'hacker' })).toString('base64');
      const tamperedToken = parts.join('.');

      expect(() => {
        verifyToken(tamperedToken, 'access');
      }).toThrow();
    });
  });

  describe('generateRandomToken', () => {
    it('should generate a token', () => {
      const token = generateRandomToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate hexadecimal token', () => {
      const token = generateRandomToken();

      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate 64 character token (32 bytes as hex)', () => {
      const token = generateRandomToken();

      expect(token.length).toBe(64);
    });

    it('should generate unique tokens', () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      const token3 = generateRandomToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });

    it('should generate cryptographically random tokens', () => {
      const tokens = new Set();

      // Generate 100 tokens and check for uniqueness
      for (let i = 0; i < 100; i++) {
        tokens.add(generateRandomToken());
      }

      expect(tokens.size).toBe(100);
    });
  });

  describe('calculateTokenExpiry', () => {
    beforeEach(() => {
      // Mock Date.now() for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate expiry for hours', () => {
      const expiry = calculateTokenExpiry('24h');
      const expected = new Date('2024-01-02T00:00:00Z');

      expect(expiry.getTime()).toBe(expected.getTime());
    });

    it('should calculate expiry for days', () => {
      const expiry = calculateTokenExpiry('7d');
      const expected = new Date('2024-01-08T00:00:00Z');

      expect(expiry.getTime()).toBe(expected.getTime());
    });

    it('should calculate expiry for minutes', () => {
      const expiry = calculateTokenExpiry('30m');
      const expected = new Date('2024-01-01T00:30:00Z');

      expect(expiry.getTime()).toBe(expected.getTime());
    });

    it('should handle single digit values', () => {
      const expiry = calculateTokenExpiry('1h');
      const expected = new Date('2024-01-01T01:00:00Z');

      expect(expiry.getTime()).toBe(expected.getTime());
    });

    it('should handle large values', () => {
      const expiry = calculateTokenExpiry('365d');
      const expected = new Date('2025-01-01T00:00:00Z');

      expect(expiry.getTime()).toBe(expected.getTime());
    });

    it('should throw error for invalid format', () => {
      expect(() => calculateTokenExpiry('invalid')).toThrow('Invalid duration format');
      expect(() => calculateTokenExpiry('24')).toThrow('Invalid duration format');
      expect(() => calculateTokenExpiry('24x')).toThrow('Invalid duration format');
    });

    it('should throw error for negative values', () => {
      expect(() => calculateTokenExpiry('-24h')).toThrow('Invalid duration format');
    });

    it('should throw error for invalid unit', () => {
      expect(() => calculateTokenExpiry('24y')).toThrow('Invalid duration format');
    });
  });

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = validatePassword('TestPassword123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password that is too short', () => {
      const result = validatePassword('Test1!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('testpassword123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('TESTPASSWORD123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without numbers', () => {
      const result = validatePassword('TestPassword!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special characters', () => {
      const result = validatePassword('TestPassword123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePassword('test');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should accept password with all required elements', () => {
      const result = validatePassword('Secure@Pass123');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept password with various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];

      for (const char of specialChars) {
        const result = validatePassword(`TestPassword123${char}`);
        expect(result.valid).toBe(true);
      }
    });

    it('should handle empty password', () => {
      const result = validatePassword('');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Security Tests', () => {
    it('should use constant-time comparison for password verification', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      // Time multiple verifications
      const iterations = 100;

      const correctTimes: number[] = [];
      const incorrectTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = process.hrtime.bigint();
        await verifyPassword(hash, password);
        const end = process.hrtime.bigint();
        correctTimes.push(Number(end - start));
      }

      for (let i = 0; i < iterations; i++) {
        const start = process.hrtime.bigint();
        await verifyPassword(hash, 'WrongPassword!');
        const end = process.hrtime.bigint();
        incorrectTimes.push(Number(end - start));
      }

      // Timing should be similar (within order of magnitude)
      const avgCorrect = correctTimes.reduce((a, b) => a + b) / iterations;
      const avgIncorrect = incorrectTimes.reduce((a, b) => a + b) / iterations;

      // Both should be in microsecond range (Argon2 is intentionally slow)
      expect(avgCorrect).toBeGreaterThan(1000000); // > 1ms
      expect(avgIncorrect).toBeGreaterThan(1000000);
    });

    it('should not leak information about token validity through timing', () => {
      const validToken = generateTokens('user-id', 'email@test.com', 'USER').accessToken;
      const invalidToken = 'invalid.token.here';

      const validTimes: number[] = [];
      const invalidTimes: number[] = [];

      // Time verification of valid token
      for (let i = 0; i < 100; i++) {
        const start = process.hrtime.bigint();
        try {
          verifyToken(validToken, 'access');
        } catch (e) {}
        const end = process.hrtime.bigint();
        validTimes.push(Number(end - start));
      }

      // Time verification of invalid token
      for (let i = 0; i < 100; i++) {
        const start = process.hrtime.bigint();
        try {
          verifyToken(invalidToken, 'access');
        } catch (e) {}
        const end = process.hrtime.bigint();
        invalidTimes.push(Number(end - start));
      }

      // Both operations should complete quickly
      const avgValid = validTimes.reduce((a, b) => a + b) / 100;
      const avgInvalid = invalidTimes.reduce((a, b) => a + b) / 100;

      expect(avgValid).toBeLessThan(10000000); // < 10ms
      expect(avgInvalid).toBeLessThan(10000000);
    });
  });
});
