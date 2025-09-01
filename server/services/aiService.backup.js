// BACKUP: Original AI Service Configuration
// Keep this file in case you need to rollback

const { logger } = require('../utils/logger');
const apiKeyService = require('./apiKeyService');

class AIService {
  constructor() {
    // AI service now uses per-user API keys
    logger.info('AI Service initialized - using per-user API keys');
  }

  // Generate chat responses - ORIGINAL VERSION
  async generateChatResponse(messages, options = {}) {
    try {
      const {
        model = 'gpt-4', // ORIGINAL MODEL
        maxTokens = 1000,
        temperature = 0.7
      } = options;

      const openai = await apiKeyService.getOpenAIClient(options.userId || 'default');

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are Parth, an AI creative specialist with 3+ years of experience. You're knowledgeable about 50+ AI tools including ChatGPT, Midjourney, Stable Diffusion, RunwayML, and DaVinci Resolve. Provide helpful, professional advice with a friendly tone.`
          },
          ...messages
        ],
        max_tokens: maxTokens,
        temperature,
        top_p: 1
      });

      return {
        success: true,
        response: response.choices[0].message.content,
        usage: response.usage
      };

    } catch (error) {
      logger.error('Chat response generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AIService;
