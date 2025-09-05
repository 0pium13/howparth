# 🚀 HOWPARTH Vercel Deployment Guide

## Pre-Deployment Checklist

### ✅ 1. Environment Variables Setup

**Required Variables:**
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
FINE_TUNED_MODEL_ID=ft:gpt-3.5-turbo-0125:personal::CAmRK7vU
JWT_SECRET=your-super-secure-jwt-secret-here-at-least-32-characters
ADMIN_JWT_SECRET=your-super-secure-admin-jwt-secret-here
```

**Optional Variables:**
```bash
DATABASE_URL=postgresql://username:password@host:port/database
REDDIT_CLIENT_ID=your-reddit-app-client-id
REDDIT_CLIENT_SECRET=your-reddit-app-client-secret
GOOGLE_ANALYTICS_ID=GA-XXXXX-X
```

### ✅ 2. Build Validation

Run the validation script to check all requirements:
```bash
npm run validate
```

### ✅ 3. Local Build Test

Test the build locally:
```bash
npm run build
npm start
```

## Deployment Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Add Environment Variables
```bash
vercel env add OPENAI_API_KEY
vercel env add FINE_TUNED_MODEL_ID
vercel env add JWT_SECRET
vercel env add ADMIN_JWT_SECRET
# Add other variables as needed
```

### Step 4: Deploy
```bash
vercel --prod
```

## Post-Deployment Validation

### 1. Health Check
Visit: `https://your-domain.vercel.app/api/health-check`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "services": {
    "openai": {
      "status": "healthy",
      "modelsAvailable": 50,
      "fineTunedModelExists": true
    }
  }
}
```

### 2. Chat API Test
Test the chat endpoint:
```bash
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### 3. Admin Dashboard
Visit: `https://your-domain.vercel.app/admin`

### 4. Community Hub
Visit: `https://your-domain.vercel.app/community`

## Monitoring & Maintenance

### 1. Error Monitoring
- Check Vercel function logs
- Monitor API response times
- Track error rates

### 2. Performance Monitoring
- Monitor Core Web Vitals
- Track API response times
- Monitor memory usage

### 3. Cost Monitoring
- Track OpenAI API usage
- Monitor Vercel function execution time
- Set up billing alerts

## Troubleshooting

### Common Issues

**1. Build Failures**
- Check environment variables
- Verify all dependencies are installed
- Check for TypeScript errors

**2. API Timeouts**
- Reduce timeout values in vercel.json
- Optimize API response times
- Check OpenAI API status

**3. CORS Issues**
- Verify CORS headers in API routes
- Check vercel.json configuration
- Test with different origins

**4. Database Connection Issues**
- Verify DATABASE_URL format
- Check database accessibility
- Test connection from Vercel functions

### Debug Commands

```bash
# Check build locally
npm run build

# Validate deployment
npm run validate

# Test API endpoints
curl -X GET https://your-domain.vercel.app/api/health-check

# Check Vercel logs
vercel logs
```

## Security Best Practices

### 1. Environment Variables
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS only

### 3. Database Security
- Use connection pooling
- Implement proper authentication
- Regular backups

## Performance Optimization

### 1. Frontend
- Enable code splitting
- Optimize images
- Use CDN for static assets

### 2. Backend
- Implement caching
- Optimize database queries
- Use connection pooling

### 3. API
- Implement request batching
- Use streaming for large responses
- Monitor response times

## Scaling Considerations

### 1. Database
- Consider read replicas
- Implement caching layer
- Monitor connection limits

### 2. API
- Implement rate limiting
- Use request queuing
- Monitor function execution time

### 3. Frontend
- Implement service workers
- Use edge caching
- Optimize bundle size

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://reactjs.org/docs)

## Emergency Procedures

### 1. Rollback
```bash
vercel rollback
```

### 2. Disable Features
- Update environment variables
- Redeploy with feature flags

### 3. Contact Support
- Vercel Support
- OpenAI Support
- Database Provider Support