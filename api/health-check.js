const OpenAI = require('openai');

// Initialize OpenAI for health checks
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000
});

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff'
};

module.exports = async (req, res) => {
  // Set security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {}
  };

  try {
    // Check OpenAI API connectivity
    try {
      const response = await openai.models.list();
      healthStatus.services.openai = {
        status: 'healthy',
        modelsAvailable: response.data.length,
        fineTunedModelExists: response.data.some(model => 
          model.id === process.env.FINE_TUNED_MODEL_ID
        )
      };
    } catch (error) {
      healthStatus.services.openai = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.status = 'degraded';
    }

    // Check environment variables
    const requiredEnvVars = [
      'OPENAI_API_KEY',
      'FINE_TUNED_MODEL_ID'
    ];

    const optionalEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'REDDIT_CLIENT_ID',
      'REDDIT_CLIENT_SECRET'
    ];

    healthStatus.services.environment = {
      required: {},
      optional: {}
    };

    requiredEnvVars.forEach(envVar => {
      healthStatus.services.environment.required[envVar] = !!process.env[envVar];
      if (!process.env[envVar]) {
        healthStatus.status = 'unhealthy';
      }
    });

    optionalEnvVars.forEach(envVar => {
      healthStatus.services.environment.optional[envVar] = !!process.env[envVar];
    });

    // Check memory usage
    const memUsage = process.memoryUsage();
    healthStatus.services.memory = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024) // MB
    };

    // Check response time
    healthStatus.responseTime = Date.now() - startTime;

    // Determine overall status
    if (healthStatus.status === 'healthy' && healthStatus.responseTime > 5000) {
      healthStatus.status = 'degraded';
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthStatus);

  } catch (error) {
    console.error('Health check error:', error);
    
    healthStatus.status = 'unhealthy';
    healthStatus.error = error.message;
    healthStatus.responseTime = Date.now() - startTime;

    res.status(503).json(healthStatus);
  }
};
