// Admin Analytics API Route for Vercel
const OpenAI = require('openai');

// Initialize OpenAI (reuse from chat API)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000
});

// Simple in-memory analytics store (resets on cold start)
// In production, this should be replaced with a proper database
let analyticsStore = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  totalTokens: 0,
  requestsByHour: {},
  errorsByType: {},
  userStats: {},
  lastUpdated: new Date().toISOString()
};

// Helper function to verify admin access
function verifyAdminToken(token) {
  // In production, implement proper JWT verification
  const adminSecret = process.env.ADMIN_JWT_SECRET;
  if (!adminSecret) return false;

  try {
    // Simple token verification (replace with proper JWT verification)
    return token === `Bearer ${adminSecret}`;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

// Helper function to update analytics
function updateAnalytics(success, responseTime, tokens = 0, userId = 'anonymous', error = null) {
  analyticsStore.totalRequests++;
  analyticsStore.totalTokens += tokens;

  if (success) {
    analyticsStore.successfulRequests++;
  } else {
    analyticsStore.failedRequests++;
    if (error) {
      const errorType = error.includes('API key') ? 'auth' :
                       error.includes('quota') ? 'quota' :
                       error.includes('timeout') ? 'timeout' : 'other';
      analyticsStore.errorsByType[errorType] = (analyticsStore.errorsByType[errorType] || 0) + 1;
    }
  }

  // Update average response time
  const totalTime = analyticsStore.averageResponseTime * (analyticsStore.successfulRequests + analyticsStore.failedRequests - 1);
  analyticsStore.averageResponseTime = (totalTime + responseTime) / (analyticsStore.successfulRequests + analyticsStore.failedRequests);

  // Update hourly stats
  const hour = new Date().getHours();
  analyticsStore.requestsByHour[hour] = (analyticsStore.requestsByHour[hour] || 0) + 1;

  // Update user stats
  analyticsStore.userStats[userId] = (analyticsStore.userStats[userId] || 0) + 1;

  analyticsStore.lastUpdated = new Date().toISOString();
}

// Export the analytics update function for use by other API routes
module.exports.updateAnalytics = updateAnalytics;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verify admin authentication
  const authHeader = req.headers.authorization;
  if (!verifyAdminToken(authHeader)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Admin access required',
      timestamp: new Date().toISOString()
    });
  }

  try {
    if (req.method === 'GET') {
      // Return comprehensive analytics data
      const analytics = await getAnalyticsData();
      return res.status(200).json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
      });

    } else if (req.method === 'POST') {
      // Update analytics (for external API routes to report metrics)
      const { success, responseTime, tokens, userId, error } = req.body;

      updateAnalytics(success, responseTime, tokens, userId, error);

      return res.status(200).json({
        success: true,
        message: 'Analytics updated',
        timestamp: new Date().toISOString()
      });

    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process analytics request',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get comprehensive analytics data
async function getAnalyticsData() {
  try {
    // Get AI service health
    const aiHealth = await getAIHealth();

    // Calculate success rate
    const totalRequests = analyticsStore.totalRequests;
    const successRate = totalRequests > 0 ? (analyticsStore.successfulRequests / totalRequests) * 100 : 0;

    // Get usage estimates (simplified)
    const estimatedCost = (analyticsStore.totalTokens / 1000) * 0.002; // Rough estimate for GPT-3.5

    // Get peak hours
    const peakHour = Object.keys(analyticsStore.requestsByHour).reduce((a, b) =>
      analyticsStore.requestsByHour[a] > analyticsStore.requestsByHour[b] ? a : b, '0'
    );

    return {
      overview: {
        totalRequests,
        successfulRequests: analyticsStore.successfulRequests,
        failedRequests: analyticsStore.failedRequests,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: Math.round(analyticsStore.averageResponseTime),
        totalTokens: analyticsStore.totalTokens,
        estimatedCost: Math.round(estimatedCost * 100) / 100
      },

      ai: {
        health: aiHealth,
        modelsUsed: ['ft:gpt-3.5-turbo-0125:personal::CAmRK7vU', 'gpt-3.5-turbo'],
        fallbackUsage: 0 // Would need more complex tracking
      },

      usage: {
        tokensByDay: {}, // Would need date-based tracking
        requestsByHour: analyticsStore.requestsByHour,
        peakHour: `${peakHour}:00`,
        userCount: Object.keys(analyticsStore.userStats).length,
        topUsers: Object.entries(analyticsStore.userStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
      },

      errors: {
        totalErrors: analyticsStore.failedRequests,
        errorsByType: analyticsStore.errorsByType,
        recentErrors: [] // Would need error log storage
      },

      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'production',
        lastUpdated: analyticsStore.lastUpdated
      }
    };

  } catch (error) {
    console.error('Failed to get analytics data:', error);
    throw error;
  }
}

// Get AI service health status
async function getAIHealth() {
  try {
    const response = await openai.models.list();
    const fineTunedModel = 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU';

    return {
      status: 'healthy',
      modelsAvailable: response.data.length,
      fineTunedModelExists: response.data.some(model => model.id === fineTunedModel),
      connectivity: true,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'degraded',
      connectivity: false,
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }
}
