const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');
const EmailService = require('../services/emailService');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 8 }),
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 })
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } // Shorter access token
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Encrypt sensitive data
const encryptData = (data) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt sensitive data
const decryptData = (encryptedData) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, username, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionTier: true,
        avatar: true,
        createdAt: true
      }
    });

    // Create user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        writingStyle: {},
        preferredTopics: [],
        notificationSettings: {
          email: true,
          push: true
        }
      }
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email-verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    try {
      await EmailService.sendVerificationEmail(user.email, user.username, verificationToken);
    } catch (emailError) {
      logger.error('Failed to send verification email:', emailError);
      // Don't fail signup if email fails
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store encrypted refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken: encryptData(refreshToken)
      }
    });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token: accessToken
      }
    });

  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionTier: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if MFA is required
    if (user.mfaEnabled) {
      return res.status(200).json({
        success: true,
        requiresMFA: true,
        userId: user.id,
        message: 'MFA code required'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store encrypted refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken: encryptData(refreshToken),
        lastLoginAt: new Date()
      }
    });

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token: accessToken
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionTier: true,
        avatar: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        preferences: {
          select: {
            writingStyle: true,
            preferredTopics: true,
            notificationSettings: true,
            theme: true,
            language: true,
            timezone: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token using refresh token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        isActive: true, 
        refreshToken: true 
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Verify stored refresh token matches
    if (!user.refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token stored'
      });
    }

    const storedRefreshToken = decryptData(user.refreshToken);
    if (storedRefreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Update stored refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: encryptData(newRefreshToken) }
    });

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      data: { token: newAccessToken }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired'
      });
    }
    
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate refresh token
// @access  Private
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Clear refresh token from database
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { refreshToken: null }
        });
        
        logger.info(`User logged out: ${decoded.userId}`);
      } catch (error) {
        // Token might be expired, which is fine for logout
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'email-verification') {
      return res.status(400).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified'
      });
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { emailVerified: true }
    });

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    logger.error('Email verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        error: 'Verification token expired'
      });
    }
    
    res.status(400).json({
      success: false,
      error: 'Invalid verification token'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires
      }
    });

    // Send reset email
    try {
      await EmailService.sendPasswordResetEmail(user.email, user.username, resetToken);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email'
      });
    }

    logger.info(`Password reset email sent to: ${email}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    logger.info(`Password reset for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

// @route   POST /api/auth/mfa/setup
// @desc    Setup MFA for user
// @access  Private
router.post('/mfa/setup', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate MFA secret
    const secret = speakeasy.generateSecret({
      name: `HOWPARTH (${user.email})`,
      issuer: 'HOWPARTH'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store encrypted secret temporarily
    const encryptedSecret = encryptData(secret.base32);

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        tempSecret: encryptedSecret
      }
    });

  } catch (error) {
    logger.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup MFA'
    });
  }
});

// @route   POST /api/auth/mfa/verify-setup
// @desc    Verify MFA setup with code
// @access  Private
router.post('/mfa/verify-setup', [
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  body('tempSecret').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const { code, tempSecret } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Decrypt and verify secret
    const secret = decryptData(tempSecret);
    
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 time steps (60 seconds) for clock skew
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // Enable MFA for user
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        mfaSecret: tempSecret,
        mfaEnabled: true
      }
    });

    logger.info(`MFA enabled for user: ${user.email}`);

    res.json({
      success: true,
      message: 'MFA enabled successfully'
    });

  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify MFA setup'
    });
  }
});

// @route   POST /api/auth/mfa/verify
// @desc    Verify MFA code during login
// @access  Public
router.post('/mfa/verify', [
  body('userId').notEmpty(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId, code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({
        success: false,
        error: 'MFA not enabled for this user'
      });
    }

    // Decrypt and verify secret
    const secret = decryptData(user.mfaSecret);
    
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid MFA code'
      });
    }

    res.json({
      success: true,
      message: 'MFA verification successful'
    });

  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify MFA code'
    });
  }
});

// @route   POST /api/auth/mfa/disable
// @desc    Disable MFA for user
// @access  Private
router.post('/mfa/disable', [
  body('code').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const { code } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      return res.status(400).json({
        success: false,
        error: 'MFA not enabled for this user'
      });
    }

    // Verify current code
    const secret = decryptData(user.mfaSecret);
    
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid MFA code'
      });
    }

    // Disable MFA
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        mfaSecret: null,
        mfaEnabled: false
      }
    });

    logger.info(`MFA disabled for user: ${user.email}`);

    res.json({
      success: true,
      message: 'MFA disabled successfully'
    });

  } catch (error) {
    logger.error('MFA disable error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable MFA'
    });
  }
});

module.exports = router;
