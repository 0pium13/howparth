// Admin API Usage Monitoring Route for Vercel
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000
});

// Simple in-memory usage store (resets on cold start)
// In production, this should be replaced with a proper database
let usageStore = {
  requests: [],
  tokensUsed: 0,
  costs: {
    total: 0,
    byModel: {},
    byEndpoint: {},
    byDay: {}
  },
  limits: {
    dailyTokens: process.env.DAILY_TOKEN_LIMIT || 100000,
    monthlyCost: process.env.MONTHLY_COST_LIMIT || 100
  },
  alerts: []
};

// Helper function to verify admin access
function verifyAdminToken(token) {
  const adminSecret = process.env.ADMIN_JWT_SECRET;
  if (!adminSecret) return false;

  try {
    return token === `Bearer ${adminSecret}`;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

// Track API usage
function trackUsage(endpoint, tokens, model, responseTime, success = true) {
  const now = new Date();
  const day = now.toISOString().split('T')[0];

  // Add request to store
  usageStore.requests.push({
    timestamp: now.toISOString(),
    endpoint,
    tokens,
    model,
    responseTime,
    success
  });

  // Keep only last 1000 requests to prevent memory issues
  if (usageStore.requests.length > 1000) {
    usageStore.requests = usageStore.requests.slice(-1000);
  }

  // Update token count
  usageStore.tokensUsed += tokens;

  // Update costs (rough estimates)
  const costPerThousand = model.includes('gpt-4') ? 0.03 : 0.002;
  const cost = (tokens / 1000) * costPerThousand;
  usageStore.costs.total += cost;

  // Update model costs
  usageStore.costs.byModel[model] = (usageStore.costs.byModel[model] || 0) + cost;

  // Update endpoint costs
  usageStore.costs.byEndpoint[endpoint] = (usageStore.costs.byEndpoint[endpoint] || 0) + cost;

  // Update daily costs
  usageStore.costs.byDay[day] = (usageStore.costs.byDay[day] || 0) + cost;

  // Check limits and create alerts
  checkLimits();
}

// Check usage limits and create alerts
function checkLimits() {
  const today = new Date().toISOString().split('T')[0];
  const todayTokens = usageStore.requests
    .filter(req => req.timestamp.startsWith(today))
    .reduce((sum, req) => sum + req.tokens, 0);

  const todayCost = usageStore.costs.byDay[today] || 0;

  // Token limit alert
  if (todayTokens > usageStore.limits.dailyTokens * 0.8) {
    usageStore.alerts.push({
      type: 'warning',
      message: `Daily token usage at ${Math.round((todayTokens / usageStore.limits.dailyTokens) * 100)}%`,
      timestamp: new Date().toISOString(),
      data: { current: todayTokens, limit: usageStore.limits.dailyTokens }
    });
  }

  // Cost limit alert
  if (todayCost > usageStore.limits.monthlyCost * 0.8) {
    usageStore.alerts.push({
      type: 'warning',
      message: `Monthly cost usage at ${Math.round((todayCost / usageStore.limits.monthlyCost) * 100)}%`,
      timestamp: new Date().toISOString(),
      data: { current: todayCost, limit: usageStore.limits.monthlyCost }
    });
  }

  // Keep only last 50 alerts
  if (usageStore.alerts.length > 50) {
    usageStore.alerts = usageStore.alerts.slice(-50);
  }
}

// Export the usage tracking function for use by other API routes
module.exports.trackUsage = trackUsage;

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
      // Return comprehensive usage statistics
      const usageStats = await getUsageStats();
      return res.status(200).json({
        success: true,
        data: usageStats,
        timestamp: new Date().toISOString()
      });

    } else if (req.method === 'POST') {
      // Record usage data (for external API routes to report usage)
      const { endpoint, tokens, model, responseTime, success } = req.body;

      trackUsage(endpoint, tokens, model, responseTime, success);

      return res.status(200).json({
        success: true,
        message: 'Usage recorded',
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
    console.error('Admin API usage error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process usage request',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get comprehensive usage statistics
async function getUsageStats() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7); // YYYY-MM format

    // Calculate today's metrics
    const todayRequests = usageStore.requests.filter(req => req.timestamp.startsWith(today));
    const todayTokens = todayRequests.reduce((sum, req) => sum + req.tokens, 0);
    const todaySuccessful = todayRequests.filter(req => req.success).length;
    const todayFailed = todayRequests.filter(req => !req.success).length;

    // Calculate this month's metrics
    const monthRequests = usageStore.requests.filter(req => req.timestamp.startsWith(thisMonth));
    const monthTokens = monthRequests.reduce((sum, req) => sum + req.tokens, 0);
    const monthCost = Object.entries(usageStore.costs.byDay)
      .filter(([day]) => day.startsWith(thisMonth))
      .reduce((sum, [, cost]) => sum + cost, 0);

    // Calculate average response times
    const successfulRequests = usageStore.requests.filter(req => req.success);
    const avgResponseTime = successfulRequests.length > 0
      ? successfulRequests.reduce((sum, req) => sum + req.responseTime, 0) / successfulRequests.length
      : 0;

    // Get model usage breakdown
    const modelUsage = {};
    usageStore.requests.forEach(req => {
      modelUsage[req.model] = (modelUsage[req.model] || 0) + req.tokens;
    });

    // Get recent requests (last 50)
    const recentRequests = usageStore.requests
      .slice(-50)
      .reverse()
      .map(req => ({
        timestamp: req.timestamp,
        endpoint: req.endpoint,
        tokens: req.tokens,
        model: req.model,
        responseTime: req.responseTime,
        success: req.success
      }));

    return {
      overview: {
        totalRequests: usageStore.requests.length,
        totalTokens: usageStore.tokensUsed,
        totalCost: Math.round(usageStore.costs.total * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime)
      },

      today: {
        requests: todayRequests.length,
        tokens: todayTokens,
        successful: todaySuccessful,
        failed: todayFailed,
        successRate: todayRequests.length > 0 ? Math.round((todaySuccessful / todayRequests.length) * 100) : 0,
        cost: Math.round((usageStore.costs.byDay[today] || 0) * 100) / 100
      },

      thisMonth: {
        requests: monthRequests.length,
        tokens: monthTokens,
        cost: Math.round(monthCost * 100) / 100,
        remainingBudget: Math.max(0, usageStore.limits.monthlyCost - monthCost)
      },

      byModel: Object.entries(modelUsage).map(([model, tokens]) => ({
        model,
        tokens,
        cost: Math.round((usageStore.costs.byModel[model] || 0) * 100) / 100,
        percentage: Math.round((tokens / usageStore.tokensUsed) * 100)
      })),

      byEndpoint: Object.entries(usageStore.costs.byEndpoint).map(([endpoint, cost]) => ({
        endpoint,
        cost: Math.round(cost * 100) / 100,
        requests: usageStore.requests.filter(req => req.endpoint === endpoint).length
      })),

      recentActivity: recentRequests,

      alerts: usageStore.alerts.slice(-10), // Last 10 alerts

      limits: {
        dailyTokens: usageStore.limits.dailyTokens,
        monthlyCost: usageStore.limits.monthlyCost,
        tokenUsagePercent: Math.round((todayTokens / usageStore.limits.dailyTokens) * 100),
        costUsagePercent: Math.round((monthCost / usageStore.limits.monthlyCost) * 100)
      },

      system: {
        uptime: process.uptime(),
        lastUpdated: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Failed to get usage stats:', error);
    throw error;
  }
}
