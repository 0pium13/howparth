# HOWPARTH Developer Guide

## 🔐 Authentication System Architecture

### Overview
HOWPARTH uses a secure JWT-based authentication system with refresh tokens, email verification, password reset functionality, and multi-factor authentication (MFA).

### Security Features
- **AES-256 encryption** for sensitive data storage
- **bcrypt password hashing** with 12 salt rounds
- **JWT access tokens** (15 minutes) + refresh tokens (30 days)
- **HttpOnly cookies** for refresh token storage
- **Email verification** with signed JWT links
- **Password reset** with secure one-time tokens
- **TOTP-based MFA** (Google Authenticator compatible)
- **Rate limiting** (100 requests per 15 minutes)
- **CORS protection** with credentials support

## 🏗️ Database Schema

### User Model
```prisma
model User {
  id               String           @id @default(cuid())
  email            String           @unique
  username         String           @unique
  password         String           // bcrypt hashed
  firstName        String?
  lastName         String?
  avatar           String?
  role             UserRole         @default(USER)
  subscriptionTier SubscriptionTier @default(FREE)
  isActive         Boolean          @default(true)
  emailVerified    Boolean          @default(false)
  lastLoginAt      DateTime?
  
  // Authentication & Security
  refreshToken     String?          // Encrypted refresh token
  resetToken       String?          // Password reset token
  resetTokenExpires DateTime?       // Reset token expiration
  mfaSecret        String?          // Encrypted MFA secret
  mfaEnabled       Boolean          @default(false)
  
  // API Keys (encrypted)
  openAIApiKey      String?         // Encrypted OpenAI API key
  openAIApiKeyValid Boolean         @default(false)
  openAIApiKeyLastValidated DateTime?
  
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}
```

## 🔄 Token Flow

### Access Token Flow
1. User logs in with credentials
2. Server validates credentials and generates:
   - Access token (15 minutes)
   - Refresh token (30 days)
3. Access token stored in localStorage (encrypted)
4. Refresh token stored in HttpOnly cookie
5. On API calls, access token sent in Authorization header
6. On 401 responses, frontend automatically refreshes token

### Refresh Token Flow
1. Access token expires (401 response)
2. Frontend calls `/api/auth/refresh` with refresh token cookie
3. Server validates refresh token and generates new access token
4. New access token returned to frontend
5. Original request retried with new token

## 📧 Email Verification

### Flow
1. User signs up
2. Verification email sent with signed JWT link
3. User clicks link or submits token to `/api/auth/verify-email`
4. Server validates token and marks email as verified
5. Token expires after 24 hours

### Email Templates
- **Verification Email**: Welcome message with verification link
- **Password Reset**: Reset link with 1-hour expiration
- **Fallback**: Development mode logs email content

## 🔐 Multi-Factor Authentication (MFA)

### Setup Flow
1. User calls `/api/auth/mfa/setup` (authenticated)
2. Server generates TOTP secret and QR code
3. User scans QR code with authenticator app
4. User submits 6-digit code to `/api/auth/mfa/verify-setup`
5. Server validates code and enables MFA

### Login Flow with MFA
1. User submits credentials
2. If MFA enabled, server returns `requiresMFA: true`
3. Frontend shows MFA input
4. User submits code to `/api/auth/mfa/verify`
5. On success, login proceeds normally

### MFA Management
- **Enable**: `/api/auth/mfa/setup` + `/api/auth/mfa/verify-setup`
- **Disable**: `/api/auth/mfa/disable` (requires current MFA code)
- **Verify**: `/api/auth/mfa/verify` (during login)

## 🔑 Password Reset

### Flow
1. User requests password reset via `/api/auth/forgot-password`
2. Server generates secure random token (32 bytes)
3. Token stored in database with 1-hour expiration
4. Reset email sent with secure link
5. User clicks link and submits new password
6. Server validates token and updates password
7. Token cleared from database

### Security Features
- **Secure tokens**: 32-byte random hex strings
- **Time-limited**: 1-hour expiration
- **Single-use**: Token cleared after use
- **No user enumeration**: Same response for existing/non-existing emails

## 🛡️ Security Middleware

### Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
```

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true // Required for HttpOnly cookies
}));
```

### Authentication Middleware
```javascript
const authenticateToken = async (req, res, next) => {
  // Validates JWT token and attaches user to req.user
};

const requireRole = (roles) => {
  // Checks user role against required roles
};

const requireSubscription = (tiers) => {
  // Checks user subscription tier
};
```

## 🧪 Testing

### Running Tests
```bash
# Run auth tests only
npm run test:auth

# Run all tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **Unit tests**: All auth endpoints and services
- **Integration tests**: Full auth flows
- **Security tests**: Token validation, MFA, password reset
- **Error handling**: Invalid inputs, expired tokens, etc.

### Test Structure
```
__tests__/
├── setup.js              # Test configuration and mocks
├── auth.test.js          # Authentication API tests
└── coverage/             # Coverage reports
```

## 🔧 Environment Variables

### Required Variables
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=15m

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key
REACT_APP_ENCRYPTION_KEY=your-frontend-encryption-key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/howparth

# Email Configuration (Choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@howparth.com

# Option 2: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Development vs Production
- **Development**: Uses default keys, logs email content
- **Production**: Requires secure keys, sends actual emails

## 🚀 Deployment Checklist

### Security Checklist
- [ ] Change all default encryption keys
- [ ] Set secure JWT secrets (32+ characters)
- [ ] Configure HTTPS in production
- [ ] Set up email service (SendGrid/SMTP)
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting for production load
- [ ] Enable Helmet security headers
- [ ] Configure secure cookie settings

### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Email Setup
1. **SendGrid** (Recommended):
   - Create SendGrid account
   - Verify sender domain
   - Set `SENDGRID_API_KEY` and `FROM_EMAIL`

2. **SMTP** (Alternative):
   - Configure SMTP settings
   - Use app passwords for Gmail
   - Set all SMTP_* variables

## 🔍 Monitoring & Logging

### Log Levels
- **INFO**: User actions, successful operations
- **WARN**: Non-critical issues, fallbacks
- **ERROR**: Failed operations, security events

### Key Events Logged
- User registration and login
- Email verification and password reset
- MFA setup and verification
- Token refresh and logout
- Security events (failed logins, etc.)

### Monitoring Points
- Failed login attempts
- Token refresh failures
- Email delivery issues
- MFA verification failures
- Rate limit violations

## 🐛 Troubleshooting

### Common Issues

#### Token Refresh Fails
- Check refresh token cookie settings
- Verify JWT_REFRESH_SECRET is set
- Check database for stored refresh token

#### Email Not Sending
- Verify email service configuration
- Check SendGrid/SMTP credentials
- Review email service logs

#### MFA Setup Issues
- Ensure speakeasy and qrcode packages installed
- Check encryption key for MFA secret storage
- Verify TOTP app compatibility

#### Database Connection
- Verify DATABASE_URL format
- Check database server status
- Ensure Prisma client is generated

### Debug Mode
Set `NODE_ENV=development` for detailed logging and error messages.

## 📚 API Reference

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user account.

**Request:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "access-token"
  }
}
```

#### POST /api/auth/login
Authenticate user and get access token.

**Request:**
```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Response (No MFA):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "access-token"
  }
}
```

**Response (MFA Required):**
```json
{
  "success": true,
  "requiresMFA": true,
  "userId": "user-id",
  "message": "MFA code required"
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Headers:** `Cookie: refreshToken=token`

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new-access-token"
  }
}
```

#### POST /api/auth/verify-email
Verify email address with token.

**Request:**
```json
{
  "token": "verification-token"
}
```

#### POST /api/auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "test@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

#### POST /api/auth/mfa/setup
Setup MFA for user (authenticated).

**Headers:** `Authorization: Bearer access-token`

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "TOTP_SECRET",
    "qrCode": "data:image/png;base64,...",
    "tempSecret": "encrypted-secret"
  }
}
```

#### POST /api/auth/mfa/verify-setup
Verify MFA setup with code.

**Request:**
```json
{
  "code": "123456",
  "tempSecret": "encrypted-secret"
}
```

#### POST /api/auth/mfa/verify
Verify MFA code during login.

**Request:**
```json
{
  "userId": "user-id",
  "code": "123456"
}
```

#### POST /api/auth/logout
Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer access-token`

## 🤝 Contributing

### Code Standards
- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Use TypeScript for frontend code
- Follow security best practices

### Security Guidelines
- Never log sensitive data (passwords, tokens)
- Use environment variables for secrets
- Validate all inputs
- Implement proper error handling
- Follow OWASP security guidelines

### Testing Requirements
- Unit tests for all new endpoints
- Integration tests for auth flows
- Security tests for edge cases
- Maintain >90% test coverage

---

For additional support, contact the development team or create an issue in the repository.
