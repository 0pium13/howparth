// Comprehensive Feature Testing API Route for Vercel
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
      error: 'Method not allowed. Use GET to run tests.',
      timestamp: new Date().toISOString()
    });
  }

  const startTime = Date.now();
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0
    }
  };

  try {
    console.log('🧪 Starting comprehensive feature tests...');

    // Test 1: Environment Variables
    testResults.tests.push(await testEnvironmentVariables());

    // Test 2: OpenAI API Connectivity
    testResults.tests.push(await testOpenAIConnectivity());

    // Test 3: Fine-tuned Model
    testResults.tests.push(await testFineTunedModel());

    // Test 4: Chat API Functionality
    testResults.tests.push(await testChatAPI());

    // Test 5: Health Check Endpoints
    testResults.tests.push(await testHealthChecks());

    // Test 6: Admin Analytics (if credentials provided)
    testResults.tests.push(await testAdminAnalytics());

    // Test 7: Scraper Service (if credentials provided)
    testResults.tests.push(await testScraperService());

    // Calculate summary
    testResults.tests.forEach(test => {
      testResults.summary.total++;
      if (test.status === 'passed') {
        testResults.summary.passed++;
      } else {
        testResults.summary.failed++;
      }
    });

    testResults.summary.duration = Date.now() - startTime;

    const overallStatus = testResults.summary.failed === 0 ? 'all_passed' : 'some_failed';

    console.log(`✅ Feature tests completed: ${testResults.summary.passed}/${testResults.summary.total} passed`);

    return res.status(200).json({
      success: true,
      status: overallStatus,
      ...testResults
    });

  } catch (error) {
    console.error('❌ Feature testing failed:', error);

    testResults.summary.duration = Date.now() - startTime;
    testResults.tests.push({
      name: 'Test Framework',
      status: 'failed',
      error: error.message,
      duration: testResults.summary.duration
    });

    return res.status(500).json({
      success: false,
      status: 'framework_failed',
      ...testResults
    });
  }
};

// Test Environment Variables
async function testEnvironmentVariables() {
  const startTime = Date.now();

  try {
    const requiredVars = ['OPENAI_API_KEY', 'FINE_TUNED_MODEL_ID'];
    const optionalVars = ['ADMIN_JWT_SECRET', 'REDDIT_CLIENT_ID', 'DATABASE_URL'];

    const results = {
      required: {},
      optional: {}
    };

    // Check required variables
    for (const varName of requiredVars) {
      results.required[varName] = {
        present: !!process.env[varName],
        masked: process.env[varName] ? '***' + process.env[varName].slice(-4) : null
      };
    }

    // Check optional variables
    for (const varName of optionalVars) {
      results.optional[varName] = {
        present: !!process.env[varName],
        masked: process.env[varName] ? '***configured***' : null
      };
    }

    const hasAllRequired = Object.values(results.required).every(v => v.present);

    return {
      name: 'Environment Variables',
      status: hasAllRequired ? 'passed' : 'failed',
      duration: Date.now() - startTime,
      details: results,
      message: hasAllRequired ? 'All required environment variables are configured' : 'Some required environment variables are missing'
    };

  } catch (error) {
    return {
      name: 'Environment Variables',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

// Test OpenAI API Connectivity
async function testOpenAIConnectivity() {
  const startTime = Date.now();

  try {
    const response = await openai.models.list();

    return {
      name: 'OpenAI API Connectivity',
      status: 'passed',
      duration: Date.now() - startTime,
      details: {
        modelsAvailable: response.data.length,
        connectivity: 'successful'
      }
    };

  } catch (error) {
    return {
      name: 'OpenAI API Connectivity',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

// Test Fine-tuned Model
async function testFineTunedModel() {
  const startTime = Date.now();

  try {
    const fineTunedModel = process.env.FINE_TUNED_MODEL_ID;

    if (!fineTunedModel) {
      throw new Error('FINE_TUNED_MODEL_ID not configured');
    }

    const response = await openai.chat.completions.create({
      model: fineTunedModel,
      messages: [{ role: 'user', content: 'Test message for fine-tuned model' }],
      max_tokens: 50
    });

    return {
      name: 'Fine-tuned Model',
      status: 'passed',
      duration: Date.now() - startTime,
      details: {
        model: fineTunedModel,
        responseReceived: !!response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens
      }
    };

  } catch (error) {
    return {
      name: 'Fine-tuned Model',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

// Test Chat API Functionality
async function testChatAPI() {
  const startTime = Date.now();

  try {
    // Import the chat API handler
    const chatHandler = require('./chat.js');

    // Create mock request/response
    const mockReq = {
      method: 'POST',
      body: {
        message: 'Hello, this is a test message',
        userId: 'test-user',
        conversationHistory: []
      }
    };

    let mockRes = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader: function(key, value) { this.headers[key] = value; },
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; },
      end: function() {}
    };

    // Call the handler
    await chatHandler(mockReq, mockRes);

    const success = mockRes.body && mockRes.body.success;
    const hasResponse = mockRes.body && mockRes.body.response;

    return {
      name: 'Chat API Functionality',
      status: success && hasResponse ? 'passed' : 'failed',
      duration: Date.now() - startTime,
      details: {
        responseReceived: !!mockRes.body,
        success: success,
        hasResponse: hasResponse,
        model: mockRes.body?.model,
        responseTime: mockRes.body?.responseTime
      }
    };

  } catch (error) {
    return {
      name: 'Chat API Functionality',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

// Test Health Check Endpoints
async function testHealthChecks() {
  const startTime = Date.now();

  try {
    // Test main health endpoint
    const healthHandler = require('./health.js');

    const mockReq = { method: 'GET' };
    let mockRes = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader: function(key, value) { this.headers[key] = value; },
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; },
      end: function() {}
    };

    await healthHandler(mockReq, mockRes);

    const healthData = mockRes.body;
    const overallHealthy = healthData && healthData.status === 'healthy';

    return {
      name: 'Health Check Endpoints',
      status: overallHealthy ? 'passed' : 'warning',
      duration: Date.now() - startTime,
      details: {
        healthData: healthData,
        overallStatus: healthData?.status,
        services: healthData?.services
      }
    };

  } catch (error) {
    return {
      name: 'Health Check Endpoints',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

// Test Admin Analytics (if credentials provided)
async function testAdminAnalytics() {
  const startTime = Date.now();

  try {
    if (!process.env.ADMIN_JWT_SECRET) {
      return {
        name: 'Admin Analytics',
        status: 'skipped',
        duration: Date.now() - startTime,
        message: 'ADMIN_JWT_SECRET not configured'
      };
    }

    // Test admin analytics endpoint
    const adminHandler = require('./admin/analytics.js');

    const mockReq = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${process.env.ADMIN_JWT_SECRET}`
      }
    };

    let mockRes = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader: function(key, value) { this.headers[key] = value; },
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; },
      end: function() {}
    };

    await adminHandler(mockReq, mockRes);

    const success = mockRes.body && mockRes.body.success;

    return {
      name: 'Admin Analytics',
      status: success ? 'passed' : 'failed',
      duration: Date.now() - startTime,
      details: {
        authenticated: success,
        hasData: !!mockRes.body?.data
      }
    };

  } catch (error) {
    return {
      name: 'Admin Analytics',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

// Test Scraper Service (if credentials provided)
async function testScraperService() {
  const startTime = Date.now();

  try {
    if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
      return {
        name: 'Scraper Service',
        status: 'skipped',
        duration: Date.now() - startTime,
        message: 'Reddit credentials not configured'
      };
    }

    // Test scraper health endpoint
    const scraperHandler = require('./scraper.js');

    const mockReq = {
      method: 'GET',
      url: '/health'
    };

    let mockRes = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader: function(key, value) { this.headers[key] = value; },
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.body = data; },
      end: function() {}
    };

    await scraperHandler(mockReq, mockRes);

    const success = mockRes.body && mockRes.body.status === 'healthy';

    return {
      name: 'Scraper Service',
      status: success ? 'passed' : 'warning',
      duration: Date.now() - startTime,
      details: {
        status: mockRes.body?.status,
        lastScraped: mockRes.body?.lastScraped,
        totalScraped: mockRes.body?.totalScraped
      }
    };

  } catch (error) {
    return {
      name: 'Scraper Service',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}
