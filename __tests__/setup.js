// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.ENCRYPTION_KEY = 'test-encryption-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/howparth_test';

// Mock email service
jest.mock('../server/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

// Mock speakeasy for MFA tests
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn().mockReturnValue({
    base32: 'JBSWY3DPEHPK3PXP',
    otpauth_url: 'otpauth://totp/HOWPARTH:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=HOWPARTH'
  }),
  totp: {
    verify: jest.fn().mockReturnValue(true) // Always return true for tests
  }
}));

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code')
}));

// Global test utilities
global.testUtils = {
  generateTestUser: () => ({
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  }),
  
  generateTestToken: (userId = 'test-user-id') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  },
};
