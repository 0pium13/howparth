const OllamaAIService = require('../services/ollamaAIService');
const BraveSearchService = require('../services/braveSearchService');
const ChromaMemoryService = require('../services/chromaMemoryService');

class RealAIChatController {
  constructor() {
    this.aiService = new OllamaAIService();
    this.searchService = new BraveSearchService();
    this.memoryService = new ChromaMemoryService();
    this.initializeServices();
  }

  async initializeServices() {
    try {
      await this.memoryService.initialize();
      console.log('✅ Real AI Chat Controller initialized');
    } catch (error) {
      console.error('❌ Failed to initialize chat controller:', error);
    }
  }

  async handleStreamingChat(req, res) {
    const { message, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required',
        success: false
      });
    }

    try {
      // Check if AI service is online
      const isOnline = await this.aiService.isOnline();
      if (!isOnline) {
        return res.status(503).json({
          error: 'AI service is currently unavailable. Please ensure Ollama is running on localhost:11434',
          success: false,
          details: 'Install Ollama from https://ollama.com and run: ollama pull llama3.2:7b-instruct'
        });
      }

      // Get conversation history
      const recentMessages = await this.memoryService.getRecentConversation(userId, 5);
      
      // Check if we need current information
      const needsSearch = this.shouldSearchWeb(message);
      let searchResults = [];
      let searchContext = '';

      if (needsSearch) {
        console.log(`🔍 Searching web for: ${message}`);
        searchResults = await this.searchService.searchWeb(message, 3);
        if (searchResults.length > 0) {
          searchContext = searchResults.map(r => 
            `Source: ${r.title}\nURL: ${r.url}\nInfo: ${r.snippet}\n`
          ).join('\n');
        }
      }

      // Get relevant memory
      const relevantMemory = await this.memoryService.searchMemory(userId, message, 2);
      const memoryContext = relevantMemory.join('\n');
      
      // Build context-aware messages
      const systemPrompt = this.aiService.buildSystemPrompt(searchContext, memoryContext);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Set up streaming response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });

      let fullResponse = '';
      let isFirstChunk = true;

      // Stream the response
      await this.aiService.generateStreamingResponse(messages, (chunk, done) => {
        if (done) {
          // Store conversation in memory
          this.memoryService.addConversation(userId, message, fullResponse, {
            searchResults: searchResults.length,
            searchUsed: needsSearch,
            memoryRetrieved: relevantMemory.length
          });

          res.write(`data: ${JSON.stringify({
            content: '',
            done: true,
            sources: searchResults,
            metadata: {
              searchUsed: needsSearch,
              memoryRetrieved: relevantMemory.length,
              responseLength: fullResponse.length
            }
          })}\n\n`);
          res.end();
          return;
        }

        fullResponse += chunk;
        
        // Send chunk to client
        res.write(`data: ${JSON.stringify({
          content: chunk,
          done: false,
          sources: isFirstChunk ? searchResults : undefined
        })}\n\n`);
        
        isFirstChunk = false;
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to generate response',
          success: false,
          details: error.message
        });
      } else {
        res.write(`data: ${JSON.stringify({
          error: 'Failed to generate response',
          details: error.message
        })}\n\n`);
        res.end();
      }
    }
  }

  shouldSearchWeb(message) {
    const searchKeywords = [
      'latest', 'recent', 'current', 'today', 'news', 'update', 'trending',
      'what happened', 'new in', '2025', 'now', 'this week', 'this month',
      'announcement', 'release', 'launch', 'update', 'version'
    ];
    
    const lowerMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  async handleHealthCheck(req, res) {
    try {
      const aiStatus = await this.aiService.isOnline();
      const memoryStats = await this.memoryService.getMemoryStats();
      const searchStats = await this.searchService.getUsageStats();

      res.json({
        success: true,
        services: {
          ai: {
            status: aiStatus ? 'online' : 'offline',
            model: this.aiService.defaultModel
          },
          memory: memoryStats,
          search: searchStats
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async handleUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const profile = await this.memoryService.getUserProfile(userId);
      
      res.json({
        success: true,
        profile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async handleMemorySearch(req, res) {
    try {
      const { userId, query, limit = 5 } = req.query;
      const results = await this.memoryService.searchMemory(userId, query, parseInt(limit));
      
      res.json({
        success: true,
        results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async handleKnowledgeBaseAdd(req, res) {
    try {
      const { entries } = req.body;
      const success = await this.memoryService.addKnowledgeBase(entries);
      
      res.json({
        success,
        message: success ? 'Knowledge base updated' : 'Failed to update knowledge base'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = RealAIChatController;
