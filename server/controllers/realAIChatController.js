const aiService = require('../services/aiService');
const ChromaMemoryService = require('../services/chromaMemoryService');
const OpenAI = require('openai');

class RealAIChatController {
  constructor() {
    this.aiService = aiService;
    this.memoryService = new ChromaMemoryService();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.initializeServices();
  }

  async initializeServices() {
    try {
      await this.memoryService.initialize();
      console.log('✅ Real AI Chat Controller initialized with Fine-tuned OpenAI Model');
    } catch (error) {
      console.error('❌ Failed to initialize chat controller:', error);
    }
  }

  async handleStreamingChat(req, res) {
    const { message, userId = 'default' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required',
        success: false
      });
    }

    try {
      // Generate response using fine-tuned model directly
      const response = await this.openai.chat.completions.create({
        model: 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU',
        messages: [
          {
            role: 'system',
            content: 'You are Parth, a 19-year-old AI video creator and college student from India. You\'re friendly, mix Hindi-English naturally, and have a good sense of humor.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const aiResponse = response.choices[0].message.content;

      // Store conversation in memory
      try {
        await this.memoryService.addConversation(userId, message, aiResponse, {
          searchResults: 0,
          searchUsed: false,
          memoryRetrieved: 0
        });
      } catch (memoryError) {
        console.warn('Memory storage failed:', memoryError);
      }

      res.status(200).json({
        success: true,
        response: aiResponse,
        usage: response.usage
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate response',
        details: error.message
      });
    }
  }

  async handleHealthCheck(req, res) {
    try {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        aiService: 'Fine-tuned OpenAI Model'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const profile = await this.memoryService.getUserProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleMemorySearch(req, res) {
    try {
      const { userId, query } = req.query;
      const results = await this.memoryService.searchMemory(userId, query, 5);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleKnowledgeBaseAdd(req, res) {
    try {
      const { userId, content, metadata } = req.body;
      const result = await this.memoryService.addKnowledge(userId, content, metadata);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  shouldSearchWeb(message) {
    const searchKeywords = ['latest', 'news', 'update', 'recent', 'current', 'today', 'now'];
    return searchKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }
}

module.exports = RealAIChatController;
