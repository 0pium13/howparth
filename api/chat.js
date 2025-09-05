const OpenAI = require('openai');

// Initialize OpenAI with environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 25000, // Reduced for Vercel
  maxRetries: 3
});

const FINE_TUNED_MODEL = process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU';
const FALLBACK_MODEL = 'gpt-3.5-turbo';

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff'
};

// Simple in-memory cache for health checks (resets on function cold start)
let healthCache = {
  lastCheck: 0,
  status: null
};

// Utility function for sleep/delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (req, res) => {
  // Set security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const startTime = Date.now();

  try {
    // Health check endpoint
    if (req.method === 'GET' && req.url.includes('/health')) {
      return await handleHealthCheck(req, res);
    }

    // Status dashboard endpoint
    if (req.method === 'GET' && req.url.includes('/status')) {
      return await handleStatusDashboard(req, res);
    }

    // Only allow POST for chat
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        timestamp: new Date().toISOString()
      });
    }

    const { message, userId = 'default', conversationHistory = [], stream = false } = req.body;

    // Input validation
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
        timestamp: new Date().toISOString()
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 4000 characters)',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Chat request from user ${userId}, message length: ${message.length}`);

    // Prepare messages array
    const messages = [
      {
        role: 'system',
        content: 'You are Parth, a 19-year-old AI video creator and college student from India. You\'re friendly, mix Hindi-English naturally, and have a good sense of humor. Keep responses concise and helpful.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message.trim()
      }
    ];

    if (stream) {
      return await handleStreamingChat(messages, userId, res);
    } else {
      return await handleRegularChat(messages, userId, res, startTime);
    }

  } catch (error) {
    console.error('Chat API error:', error);

    const responseTime = Date.now() - startTime;

    // Determine error type and provide appropriate response
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    let statusCode = 500;

    if (error.message?.includes('API key')) {
      errorMessage = 'API configuration error. Please contact support.';
      statusCode = 503;
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      errorMessage = 'Service temporarily unavailable due to high demand. Please try again in a few minutes.';
      statusCode = 429;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again with a shorter message.';
      statusCode = 408;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      responseTime,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Handle regular (non-streaming) chat
async function handleRegularChat(messages, userId, res, startTime) {
  const maxRetries = 3;
  const retryDelays = [1000, 2000, 4000];
  let lastError = null;

  // Try fine-tuned model first, then fallback
  const modelsToTry = [FINE_TUNED_MODEL, FALLBACK_MODEL];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const model of modelsToTry) {
      try {
        console.log(`Attempt ${attempt + 1}: Using model ${model} for user ${userId}`);

        const response = await openai.chat.completions.create({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.7
        });

        const responseTime = Date.now() - startTime;

        console.log(`✅ Success: Generated response in ${responseTime}ms using ${model}`);

        return res.status(200).json({
          success: true,
          response: response.choices[0].message.content,
          model: model,
          usage: response.usage,
          responseTime,
          timestamp: new Date().toISOString(),
          attempt: attempt + 1
        });

      } catch (error) {
        lastError = error;
        console.warn(`❌ Attempt ${attempt + 1} failed with model ${model}:`, error.message);

        // Don't retry on certain errors
        if (error.code === 'invalid_api_key' || error.code === 'insufficient_quota') {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries - 1) {
          await sleep(retryDelays[attempt]);
        }
      }
    }
  }

  // All attempts failed
  const responseTime = Date.now() - startTime;
  console.error(`❌ All attempts failed for user ${userId}:`, lastError);

  throw new Error('Failed to generate response after multiple attempts');
}

// Handle streaming chat
async function handleStreamingChat(messages, userId, res) {
  try {
    const modelsToTry = [FINE_TUNED_MODEL, FALLBACK_MODEL];

    for (const model of modelsToTry) {
      try {
        const stream = await openai.chat.completions.create({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true
        });

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullResponse = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            res.write(content);
          }
        }

        res.end();
        console.log(`✅ Streaming completed for user ${userId} using ${model}`);
        return;

      } catch (error) {
        console.warn(`Streaming failed with model ${model}:`, error.message);
        if (model === modelsToTry[modelsToTry.length - 1]) {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Streaming response generation failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Streaming failed. Please try again.'
    });
  }
}

// Handle health check
async function handleHealthCheck(req, res) {
  try {
    // Check cache first (valid for 30 seconds)
    const now = Date.now();
    if (healthCache.lastCheck && (now - healthCache.lastCheck) < 30000) {
      return res.status(200).json({
        status: healthCache.status,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    const response = await openai.chat.completions.create({
      model: FINE_TUNED_MODEL,
      messages: [{ role: 'user', content: 'Health check' }],
      max_tokens: 10,
      timeout: 10000
    });

    healthCache = {
      lastCheck: now,
      status: 'healthy'
    };

    return res.status(200).json({
      status: 'healthy',
      responseTime: Date.now() - now,
      model: FINE_TUNED_MODEL,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    healthCache = {
      lastCheck: now,
      status: 'unhealthy'
    };

    return res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle status dashboard
async function handleStatusDashboard(req, res) {
  try {
    const connectivity = await testConnectivity();
    const usage = await getUsageStats();

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      ai: {
        connectivity,
        usage: usage.success ? usage.usage : null
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'production'
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Test API connectivity
async function testConnectivity() {
  try {
    const response = await openai.models.list();
    return {
      success: true,
      modelsAvailable: response.data.length,
      fineTunedModelExists: response.data.some(model => model.id === FINE_TUNED_MODEL)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get usage statistics
async function getUsageStats() {
  try {
    // Note: OpenAI usage endpoint might not be available in all plans
    // This is a placeholder for when usage tracking is implemented
    return {
      success: true,
      usage: {
        totalTokens: 0,
        requestsToday: 0,
        estimatedCost: 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
