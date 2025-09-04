const { logger } = require('../utils/logger');
const OpenAI = require('openai');

class EnhancedAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout
      maxRetries: 3
    });
    
    this.fineTunedModel = 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU';
    this.fallbackModel = 'gpt-3.5-turbo';
    this.maxRetries = 3;
    this.retryDelays = [1000, 2000, 4000]; // Exponential backoff
    
    // Health monitoring
    this.healthStatus = {
      isHealthy: true,
      lastCheck: new Date(),
      consecutiveFailures: 0,
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      errorLog: []
    };
    
    logger.info('Enhanced AI Service initialized with robust error handling');
  }

  // Exponential backoff retry logic
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check for the AI service
  async healthCheck() {
    try {
      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: this.fineTunedModel,
        messages: [{ role: 'user', content: 'Health check' }],
        max_tokens: 10,
        timeout: 10000
      });
      
      const responseTime = Date.now() - startTime;
      this.updateHealthStatus(true, responseTime);
      
      return {
        status: 'healthy',
        responseTime,
        model: this.fineTunedModel,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.updateHealthStatus(false, 0, error.message);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Update health status
  updateHealthStatus(success, responseTime, error = null) {
    this.healthStatus.lastCheck = new Date();
    this.healthStatus.totalRequests++;
    
    if (success) {
      this.healthStatus.successfulRequests++;
      this.healthStatus.consecutiveFailures = 0;
      this.healthStatus.isHealthy = true;
      
      // Update average response time
      const totalTime = this.healthStatus.averageResponseTime * (this.healthStatus.successfulRequests - 1);
      this.healthStatus.averageResponseTime = (totalTime + responseTime) / this.healthStatus.successfulRequests;
    } else {
      this.healthStatus.consecutiveFailures++;
      this.healthStatus.isHealthy = this.healthStatus.consecutiveFailures < 3;
      
      if (error) {
        this.healthStatus.errorLog.push({
          timestamp: new Date().toISOString(),
          error: error,
          consecutiveFailures: this.healthStatus.consecutiveFailures
        });
        
        // Keep only last 10 errors
        if (this.healthStatus.errorLog.length > 10) {
          this.healthStatus.errorLog = this.healthStatus.errorLog.slice(-10);
        }
      }
    }
  }

  // Get health status
  getHealthStatus() {
    const successRate = this.healthStatus.totalRequests > 0 
      ? (this.healthStatus.successfulRequests / this.healthStatus.totalRequests) * 100 
      : 0;
    
    return {
      ...this.healthStatus,
      successRate: Math.round(successRate * 100) / 100,
      uptime: Date.now() - this.healthStatus.lastCheck.getTime()
    };
  }

  // Generate chat response with robust error handling
  async generateChatResponse(messages, options = {}) {
    const {
      userId = 'default',
      useFineTuned = true,
      maxTokens = 1000,
      temperature = 0.7,
      timeout = 30000
    } = options;

    const startTime = Date.now();
    let lastError = null;

    // Try fine-tuned model first, then fallback
    const modelsToTry = useFineTuned 
      ? [this.fineTunedModel, this.fallbackModel]
      : [this.fallbackModel];

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      for (const model of modelsToTry) {
        try {
          logger.info(`Attempt ${attempt + 1}: Using model ${model} for user ${userId}`);
          
          const response = await this.openai.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are Parth, a 19-year-old AI video creator and college student from India. You\'re friendly, mix Hindi-English naturally, and have a good sense of humor. Keep responses concise and helpful.'
              },
              ...messages
            ],
            max_tokens: maxTokens,
            temperature
          });

          const responseTime = Date.now() - startTime;
          this.updateHealthStatus(true, responseTime);
          
          logger.info(`✅ Success: Generated response in ${responseTime}ms using ${model}`);
          
          return {
            success: true,
            response: response.choices[0].message.content,
            model: model,
            usage: response.usage,
            responseTime,
            attempt: attempt + 1
          };

        } catch (error) {
          lastError = error;
          logger.warn(`❌ Attempt ${attempt + 1} failed with model ${model}:`, error.message);
          
          // Don't retry on certain errors
          if (error.code === 'invalid_api_key' || error.code === 'insufficient_quota') {
            throw error;
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < this.maxRetries - 1) {
            await this.sleep(this.retryDelays[attempt]);
          }
        }
      }
    }

    // All attempts failed
    const responseTime = Date.now() - startTime;
    this.updateHealthStatus(false, responseTime, lastError?.message);
    
    logger.error(`❌ All attempts failed for user ${userId}:`, lastError);
    
    return {
      success: false,
      error: 'Failed to generate response after multiple attempts',
      details: lastError?.message,
      responseTime,
      attempts: this.maxRetries
    };
  }

  // Generate response with streaming (for real-time chat)
  async generateStreamingResponse(messages, options = {}) {
    const {
      userId = 'default',
      useFineTuned = true,
      maxTokens = 1000,
      temperature = 0.7
    } = options;

    try {
      const modelsToTry = useFineTuned 
        ? [this.fineTunedModel, this.fallbackModel]
        : [this.fallbackModel];

      for (const model of modelsToTry) {
        try {
          const stream = await this.openai.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are Parth, a 19-year-old AI video creator and college student from India. You\'re friendly, mix Hindi-English naturally, and have a good sense of humor. Keep responses concise and helpful.'
              },
              ...messages
            ],
            max_tokens: maxTokens,
            temperature,
            stream: true
          });

          return {
            success: true,
            stream,
            model
          };

        } catch (error) {
          logger.warn(`Streaming failed with model ${model}:`, error.message);
          if (model === modelsToTry[modelsToTry.length - 1]) {
            throw error;
          }
        }
      }
    } catch (error) {
      logger.error('Streaming response generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test API connectivity
  async testConnectivity() {
    try {
      const response = await this.openai.models.list();
      return {
        success: true,
        modelsAvailable: response.data.length,
        fineTunedModelExists: response.data.some(model => model.id === this.fineTunedModel)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get usage statistics
  async getUsageStats() {
    try {
      const response = await this.openai.usage.retrieve();
      return {
        success: true,
        usage: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EnhancedAIService();
