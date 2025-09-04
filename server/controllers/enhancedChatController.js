const enhancedAIService = require('../services/enhancedAIService');
const ChromaMemoryService = require('../services/chromaMemoryService');
const { logger } = require('../utils/logger');

class EnhancedChatController {
  constructor() {
    this.aiService = enhancedAIService;
    this.memoryService = new ChromaMemoryService();
    this.initializeServices();
    
    // Request tracking
    this.requestStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: null
    };
  }

  async initializeServices() {
    try {
      await this.memoryService.initialize();
      logger.info('✅ Enhanced Chat Controller initialized with robust error handling');
    } catch (error) {
      logger.error('❌ Failed to initialize enhanced chat controller:', error);
    }
  }

  // Enhanced chat handler with comprehensive error handling
  async handleChat(req, res) {
    const startTime = Date.now();
    const { message, userId = 'default', conversationHistory = [] } = req.body;

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

    this.requestStats.totalRequests++;
    this.requestStats.lastRequestTime = new Date();

    try {
      // Prepare messages array
      const messages = [
        ...conversationHistory,
        {
          role: 'user',
          content: message.trim()
        }
      ];

      // Generate AI response
      const aiResponse = await this.aiService.generateChatResponse(messages, {
        userId,
        useFineTuned: true,
        maxTokens: 1000,
        temperature: 0.7
      });

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'Failed to generate response');
      }

      // Store conversation in memory (non-blocking)
      this.storeConversationAsync(userId, message, aiResponse.response, {
        model: aiResponse.model,
        responseTime: aiResponse.responseTime,
        attempt: aiResponse.attempt
      });

      // Update stats
      this.requestStats.successfulRequests++;
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);

      // Log successful request
      logger.info(`✅ Chat request successful for user ${userId} in ${responseTime}ms`);

      res.status(200).json({
        success: true,
        response: aiResponse.response,
        model: aiResponse.model,
        usage: aiResponse.usage,
        responseTime,
        timestamp: new Date().toISOString(),
        attempt: aiResponse.attempt
      });

    } catch (error) {
      this.requestStats.failedRequests++;
      const responseTime = Date.now() - startTime;
      
      logger.error(`❌ Chat request failed for user ${userId}:`, error);

      // Determine error type and provide appropriate response
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      let statusCode = 500;

      if (error.message.includes('API key')) {
        errorMessage = 'API configuration error. Please contact support.';
        statusCode = 503;
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        errorMessage = 'Service temporarily unavailable due to high demand. Please try again in a few minutes.';
        statusCode = 429;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again with a shorter message.';
        statusCode = 408;
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        responseTime,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Streaming chat handler
  async handleStreamingChat(req, res) {
    const { message, userId = 'default', conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    try {
      const messages = [
        ...conversationHistory,
        { role: 'user', content: message.trim() }
      ];

      const streamResponse = await this.aiService.generateStreamingResponse(messages, {
        userId,
        useFineTuned: true
      });

      if (!streamResponse.success) {
        throw new Error(streamResponse.error);
      }

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';

      for await (const chunk of streamResponse.stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(content);
        }
      }

      res.end();

      // Store conversation after streaming completes
      this.storeConversationAsync(userId, message, fullResponse, {
        model: streamResponse.model,
        streaming: true
      });

    } catch (error) {
      logger.error('Streaming chat error:', error);
      res.status(500).json({
        success: false,
        error: 'Streaming failed. Please try again.'
      });
    }
  }

  // Health check endpoint
  async handleHealthCheck(req, res) {
    try {
      const aiHealth = await this.aiService.healthCheck();
      const memoryHealth = await this.memoryService.healthCheck();
      
      const overallHealth = aiHealth.status === 'healthy' && memoryHealth.status === 'healthy';
      
      res.status(overallHealth ? 200 : 503).json({
        status: overallHealth ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          ai: aiHealth,
          memory: memoryHealth
        },
        stats: this.getRequestStats(),
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // API status dashboard
  async handleStatusDashboard(req, res) {
    try {
      const aiHealth = this.aiService.getHealthStatus();
      const connectivity = await this.aiService.testConnectivity();
      const usage = await this.aiService.getUsageStats();
      
      res.status(200).json({
        timestamp: new Date().toISOString(),
        ai: {
          health: aiHealth,
          connectivity,
          usage: usage.success ? usage.usage : null
        },
        requests: this.getRequestStats(),
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version
        }
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Store conversation asynchronously (non-blocking)
  async storeConversationAsync(userId, message, response, metadata) {
    try {
      await this.memoryService.addConversation(userId, message, response, {
        ...metadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.warn('Memory storage failed (non-critical):', error);
    }
  }

  // Update average response time
  updateAverageResponseTime(responseTime) {
    const totalTime = this.requestStats.averageResponseTime * (this.requestStats.successfulRequests - 1);
    this.requestStats.averageResponseTime = (totalTime + responseTime) / this.requestStats.successfulRequests;
  }

  // Get request statistics
  getRequestStats() {
    const successRate = this.requestStats.totalRequests > 0 
      ? (this.requestStats.successfulRequests / this.requestStats.totalRequests) * 100 
      : 0;

    return {
      ...this.requestStats,
      successRate: Math.round(successRate * 100) / 100,
      uptime: this.requestStats.lastRequestTime 
        ? Date.now() - this.requestStats.lastRequestTime.getTime()
        : 0
    };
  }

  // Memory search endpoint
  async handleMemorySearch(req, res) {
    try {
      const { userId, query } = req.query;
      const results = await this.memoryService.searchMemory(userId, query, 5);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // User profile endpoint
  async handleUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const profile = await this.memoryService.getUserProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EnhancedChatController;
