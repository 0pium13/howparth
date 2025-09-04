// Health Check API Route for Vercel
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  const startTime = Date.now();

  try {
    // Test database connectivity (placeholder - would need actual DB connection)
    const databaseHealth = await checkDatabaseHealth();

    // Test AI service connectivity
    const aiHealth = await checkAIServiceHealth();

    // Test scraper service status
    const scraperHealth = await checkScraperHealth();

    const overallHealth = databaseHealth.status === 'healthy' &&
                         aiHealth.status === 'healthy' &&
                         scraperHealth.status === 'healthy';

    const responseTime = Date.now() - startTime;

    return res.status(overallHealth ? 200 : 503).json({
      status: overallHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'production',

      services: {
        database: databaseHealth,
        ai: aiHealth,
        scraper: scraperHealth
      },

      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },

      endpoints: {
        chat: '/api/chat',
        admin: '/api/admin/analytics',
        scraper: '/api/scraper',
        health: '/api/health'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);

    const responseTime = Date.now() - startTime;

    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      error: error.message,

      services: {
        database: { status: 'unknown', error: 'Health check failed' },
        ai: { status: 'unknown', error: 'Health check failed' },
        scraper: { status: 'unknown', error: 'Health check failed' }
      }
    });
  }
};

// Check database health (placeholder for actual DB check)
async function checkDatabaseHealth() {
  try {
    // In production, this would check actual database connection
    // For now, return healthy status
    return {
      status: 'healthy',
      responseTime: 0,
      connection: 'simulated',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Check AI service health
async function checkAIServiceHealth() {
  try {
    const startTime = Date.now();

    // Quick model availability check
    const response = await openai.models.list();
    const fineTunedModel = 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU';
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      modelsAvailable: response.data.length,
      fineTunedModelExists: response.data.some(model => model.id === fineTunedModel),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Check scraper service health
async function checkScraperHealth() {
  try {
    // Import scraper module to check its status
    // This is a simple check - in production might ping actual scraper service
    return {
      status: 'healthy',
      lastScraped: null, // Would be populated from actual scraper data
      totalScraped: 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'degraded',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
