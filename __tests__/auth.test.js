const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userPreferences: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

const app = express();
app.use(express.json());

// Import auth routes
const authRoutes = require('../server/routes/auth');
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  let testUser;

  beforeEach(() => {
    testUser = testUtils.generateTestUser();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const userData = testUtils.generateTestUser();
      
      // Mock Prisma responses
      mockPrisma.user.findFirst.mockResolvedValue(null); // No existing user
      mockPrisma.user.create.mockResolvedValue({
        id: 'test-user-id',
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'USER',
        subscriptionTier: 'FREE',
        avatar: null,
        createdAt: new Date(),
      });
      mockPrisma.userPreferences.create.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const userData = testUtils.generateTestUser();
      
      mockPrisma.user.findFirst.mockResolvedValue({
        email: userData.email,
        username: 'existinguser',
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    it('should reject duplicate username', async () => {
      const userData = testUtils.generateTestUser();
      
      mockPrisma.user.findFirst.mockResolvedValue({
        email: 'different@example.com',
        username: userData.username,
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        subscriptionTier: 'FREE',
        avatar: null,
        isActive: true,
        lastLoginAt: null,
        mfaEnabled: false,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should require MFA for users with MFA enabled', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        subscriptionTier: 'FREE',
        avatar: null,
        isActive: true,
        lastLoginAt: null,
        mfaEnabled: true,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.requiresMFA).toBe(true);
      expect(response.body.userId).toBe('test-user-id');
    });

    it('should reject invalid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        subscriptionTier: 'FREE',
        avatar: null,
        isActive: true,
        lastLoginAt: null,
        mfaEnabled: false,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject inactive users', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        subscriptionTier: 'FREE',
        avatar: null,
        isActive: false,
        lastLoginAt: null,
        mfaEnabled: false,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = jwt.sign(
        { userId: 'test-user-id', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      // Mock encrypted refresh token
      const crypto = require('crypto');
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync('test-encryption-key', 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(refreshToken, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const encryptedRefreshToken = iv.toString('hex') + ':' + encrypted;

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        isActive: true,
        refreshToken: encryptedRefreshToken,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid refresh token');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email successfully', async () => {
      const verificationToken = jwt.sign(
        { userId: 'test-user-id', type: 'email-verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        emailVerified: false,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email verified successfully');
    });

    it('should reject already verified email', async () => {
      const verificationToken = jwt.sign(
        { userId: 'test-user-id', type: 'email-verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        emailVerified: true,
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already verified');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
      });
      mockPrisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link has been sent');
    });

    it('should not reveal if user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link has been sent');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpires: new Date(Date.now() + 3600000), // 1 hour from now
      });
      mockPrisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'valid-token',
          password: 'newpassword123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset successfully');
    });

    it('should reject expired token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'expired-token',
          password: 'newpassword123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired reset token');
    });
  });

  describe('POST /api/auth/mfa/setup', () => {
    it('should setup MFA successfully', async () => {
      const accessToken = testUtils.generateTestToken('test-user-id');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });

      const response = await request(app)
        .post('/api/auth/mfa/setup')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.secret).toBeDefined();
      expect(response.body.data.qrCode).toBeDefined();
      expect(response.body.data.tempSecret).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/setup')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('POST /api/auth/mfa/verify-setup', () => {
    it('should verify MFA setup successfully', async () => {
      const accessToken = testUtils.generateTestToken('test-user-id');

      // Mock encrypted temp secret
      const crypto = require('crypto');
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync('test-encryption-key', 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update('JBSWY3DPEHPK3PXP', 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const encryptedSecret = iv.toString('hex') + ':' + encrypted;

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
      });
      mockPrisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/mfa/verify-setup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          code: '123456', // Using static code for testing
          tempSecret: encryptedSecret,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('MFA enabled successfully');
    });
  });

  describe('POST /api/auth/mfa/verify', () => {
    it('should verify MFA code successfully', async () => {
      // Mock encrypted MFA secret
      const crypto = require('crypto');
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync('test-encryption-key', 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update('JBSWY3DPEHPK3PXP', 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const encryptedSecret = iv.toString('hex') + ':' + encrypted;

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        mfaEnabled: true,
        mfaSecret: encryptedSecret,
      });

      const response = await request(app)
        .post('/api/auth/mfa/verify')
        .send({
          userId: 'test-user-id',
          code: '123456',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('MFA verification successful');
    });

    it('should reject MFA for users without MFA enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        mfaEnabled: false,
        mfaSecret: null,
      });

      const response = await request(app)
        .post('/api/auth/mfa/verify')
        .send({
          userId: 'test-user-id',
          code: '123456',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MFA not enabled for this user');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const accessToken = testUtils.generateTestToken('test-user-id');

      // Mock user for logout
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        refreshToken: 'encrypted-refresh-token',
      });
      mockPrisma.user.update.mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});
