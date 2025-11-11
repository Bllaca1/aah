import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { cleanupTestData } from '../fixtures/factories';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!',
      displayName: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.user.username).toBe(validUser.username);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('message');
    });

    it('should not return password in response', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject registration with existing email', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/auth/register')
        .send({ ...validUser, username: 'differentuser' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should reject registration with existing username', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      // Second registration with same username
      const response = await request(app)
        .post('/auth/register')
        .send({ ...validUser, email: 'different@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('username');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ ...validUser, password: 'weak' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ ...validUser, email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should create user with default credits', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: validUser.email },
      });

      expect(user?.credits).toBeGreaterThan(0);
    });

    it('should create user with unverified email', async () => {
      await request(app)
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: validUser.email },
      });

      expect(user?.emailVerified).toBe(false);
      expect(user?.emailVerificationToken).toBeDefined();
      expect(user?.emailVerificationExpires).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    const userData = {
      username: 'loginuser',
      email: 'login@example.com',
      password: 'TestPassword123!',
      displayName: 'Login User',
    };

    beforeEach(async () => {
      // Register a user
      await request(app)
        .post('/auth/register')
        .send(userData);

      // Verify email manually
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      await prisma.user.update({
        where: { id: user!.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
    });

    it('should login successfully with email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should login successfully with username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: userData.username,
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject login without email verification', async () => {
      // Create unverified user
      await request(app)
        .post('/auth/register')
        .send({
          username: 'unverified',
          email: 'unverified@example.com',
          password: 'TestPassword123!',
          displayName: 'Unverified',
        });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'TestPassword123!',
        })
        .expect(403);

      expect(response.body.error).toContain('verify');
    });

    it('should return valid JWT tokens', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      const { accessToken, refreshToken } = response.body;

      // Tokens should have 3 parts (header.payload.signature)
      expect(accessToken.split('.')).toHaveLength(3);
      expect(refreshToken.split('.')).toHaveLength(3);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/auth/register')
        .send({
          username: 'refreshuser',
          email: 'refresh@example.com',
          password: 'TestPassword123!',
          displayName: 'Refresh User',
        });

      const user = await prisma.user.findUnique({
        where: { email: 'refresh@example.com' },
      });

      await prisma.user.update({
        where: { id: user!.id },
        data: { emailVerified: true },
      });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'TestPassword123!',
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).toBeDefined();
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject refresh with access token instead of refresh token', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'TestPassword123!',
        });

      const { accessToken } = loginResponse.body;

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: accessToken })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register, verify, and login
      await request(app)
        .post('/auth/register')
        .send({
          username: 'logoutuser',
          email: 'logout@example.com',
          password: 'TestPassword123!',
          displayName: 'Logout User',
        });

      const user = await prisma.user.findUnique({
        where: { email: 'logout@example.com' },
      });

      await prisma.user.update({
        where: { id: user!.id },
        data: { emailVerified: true },
      });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'TestPassword123!',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('success');
    });

    it('should reject logout without token', async () => {
      await request(app)
        .post('/auth/logout')
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          username: 'forgotuser',
          email: 'forgot@example.com',
          password: 'TestPassword123!',
          displayName: 'Forgot User',
        });
    });

    it('should initiate password reset for existing email', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify token was created
      const user = await prisma.user.findUnique({
        where: { email: 'forgot@example.com' },
      });

      expect(user?.passwordResetToken).toBeDefined();
      expect(user?.passwordResetExpires).toBeDefined();
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      // Should return success even for non-existent email (security)
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Auth Flow End-to-End', () => {
    it('should complete full registration -> login -> refresh -> logout flow', async () => {
      // 1. Register
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          username: 'flowuser',
          email: 'flow@example.com',
          password: 'TestPassword123!',
          displayName: 'Flow User',
        })
        .expect(201);

      expect(registerResponse.body.user.email).toBe('flow@example.com');

      // 2. Verify email (manually for testing)
      const user = await prisma.user.findUnique({
        where: { email: 'flow@example.com' },
      });

      await prisma.user.update({
        where: { id: user!.id },
        data: { emailVerified: true },
      });

      // 3. Login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'flow@example.com',
          password: 'TestPassword123!',
        })
        .expect(200);

      const { accessToken, refreshToken } = loginResponse.body;
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // 4. Access protected resource (if available)
      // This would be tested in specific endpoint tests

      // 5. Refresh token
      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.accessToken).toBeDefined();
      const newAccessToken = refreshResponse.body.accessToken;

      // 6. Logout
      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);
    });
  });
});
