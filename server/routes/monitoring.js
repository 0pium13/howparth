const express = require('express');
const router = express.Router();
const enhancedAIService = require('../services/enhancedAIService');
const { logger } = require('../utils/logger');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await enhancedAIService.healthCheck();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed status dashboard
router.get('/status', async (req, res) => {
  try {
    const healthStatus = enhancedAIService.getHealthStatus();
    const connectivity = await enhancedAIService.testConnectivity();
    const usage = await enhancedAIService.getUsageStats();
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      ai: {
        health: healthStatus,
        connectivity,
        usage: usage.success ? usage.usage : null,
        models: {
          fineTuned: 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU',
          fallback: 'gpt-3.5-turbo'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Real-time metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const healthStatus = enhancedAIService.getHealthStatus();
    
    // Prometheus-style metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      metrics: {
        'ai_requests_total': healthStatus.totalRequests,
        'ai_requests_successful': healthStatus.successfulRequests,
        'ai_requests_failed': healthStatus.totalRequests - healthStatus.successfulRequests,
        'ai_success_rate': healthStatus.successRate,
        'ai_average_response_time_ms': healthStatus.averageResponseTime,
        'ai_consecutive_failures': healthStatus.consecutiveFailures,
        'ai_is_healthy': healthStatus.isHealthy ? 1 : 0,
        'system_uptime_seconds': process.uptime(),
        'system_memory_usage_bytes': process.memoryUsage().heapUsed
      }
    };
    
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error logs endpoint
router.get('/errors', async (req, res) => {
  try {
    const healthStatus = enhancedAIService.getHealthStatus();
    res.status(200).json({
      timestamp: new Date().toISOString(),
      errors: healthStatus.errorLog,
      totalErrors: healthStatus.errorLog.length,
      consecutiveFailures: healthStatus.consecutiveFailures
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for manual testing
router.post('/test', async (req, res) => {
  try {
    const { message = 'Test message' } = req.body;
    
    const startTime = Date.now();
    const response = await enhancedAIService.generateChatResponse([
      { role: 'user', content: message }
    ], {
      userId: 'test',
      useFineTuned: true
    });
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      test: {
        message,
        response: response.response,
        model: response.model,
        responseTime,
        attempt: response.attempt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Clear error logs (admin only)
router.delete('/errors', async (req, res) => {
  try {
    // In a real app, you'd check for admin authentication here
    const healthStatus = enhancedAIService.getHealthStatus();
    healthStatus.errorLog = [];
    healthStatus.consecutiveFailures = 0;
    
    res.status(200).json({
      success: true,
      message: 'Error logs cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
