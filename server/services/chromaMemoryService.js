const { ChromaClient } = require('chromadb');
const path = require('path');

class ChromaMemoryService {
  constructor() {
    this.client = null;
    this.collection = null;
    this.conversations = new Map(); // userId -> recent messages
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // For now, let's disable Chroma to avoid initialization issues
      console.log('⚠️ Chroma memory service disabled for now');
      this.isInitialized = false;
      return;
      
      // Original code (commented out for now):
      // const dbPath = process.env.CHROMA_PATH || path.join(__dirname, '../../data/chroma_db');
      // this.client = new ChromaClient({
      //   path: dbPath
      // });

      // Create or get the collection
      this.collection = await this.client.getOrCreateCollection({
        name: 'howparth_memory',
        metadata: {
          description: 'HOWPARTH conversation memory and knowledge base'
        }
      });

      this.isInitialized = true;
      console.log('✅ Chroma memory service initialized successfully');
    } catch (error) {
      console.error('❌ Chroma initialization error:', error);
      this.isInitialized = false;
    }
  }

  async addConversation(userId, userMessage, aiResponse, metadata = {}) {
    // Add to short-term memory
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    
    const conversation = this.conversations.get(userId);
    const timestamp = new Date();
    
    conversation.push(
      { 
        role: 'user', 
        content: userMessage, 
        timestamp: timestamp,
        metadata: metadata
      },
      { 
        role: 'assistant', 
        content: aiResponse, 
        timestamp: timestamp,
        metadata: metadata
      }
    );

    // Keep only last 20 messages
    if (conversation.length > 20) {
      conversation.splice(0, conversation.length - 20);
    }

    // Add to long-term vector memory
    if (this.isInitialized && this.collection) {
      try {
        const memoryText = `User: ${userMessage}\nParth: ${aiResponse}`;
        const memoryId = `conv_${userId}_${Date.now()}`;
        
        await this.collection.add({
          ids: [memoryId],
          documents: [memoryText],
          metadatas: [{
            userId,
            timestamp: timestamp.toISOString(),
            type: 'conversation',
            userMessage: userMessage.substring(0, 100),
            aiResponse: aiResponse.substring(0, 100),
            ...metadata
          }]
        });

        console.log(`💾 Stored conversation memory: ${memoryId}`);
      } catch (error) {
        console.error('Failed to store in vector memory:', error);
      }
    }
  }

  async getRecentConversation(userId, limit = 10) {
    const conversation = this.conversations.get(userId) || [];
    return conversation.slice(-limit);
  }

  async searchMemory(userId, query, limit = 3) {
    if (!this.isInitialized || !this.collection) {
      return [];
    }
    
    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit,
        where: { userId }
      });
      
      return results.documents?.[0] || [];
    } catch (error) {
      console.error('Memory search error:', error);
      return [];
    }
  }

  async searchGlobalMemory(query, limit = 5) {
    if (!this.isInitialized || !this.collection) {
      return [];
    }
    
    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit
      });
      
      return results.documents?.[0] || [];
    } catch (error) {
      console.error('Global memory search error:', error);
      return [];
    }
  }

  async addKnowledgeBase(entries) {
    if (!this.isInitialized || !this.collection) {
      return false;
    }

    try {
      const ids = [];
      const documents = [];
      const metadatas = [];

      entries.forEach((entry, index) => {
        const id = `kb_${Date.now()}_${index}`;
        ids.push(id);
        documents.push(entry.content);
        metadatas.push({
          type: 'knowledge_base',
          category: entry.category,
          timestamp: new Date().toISOString(),
          ...entry.metadata
        });
      });

      await this.collection.add({
        ids,
        documents,
        metadatas
      });

      console.log(`📚 Added ${entries.length} knowledge base entries`);
      return true;
    } catch (error) {
      console.error('Failed to add knowledge base:', error);
      return false;
    }
  }

  async getUserProfile(userId) {
    const conversation = this.conversations.get(userId) || [];
    
    // Analyze conversation patterns
    const userMessages = conversation
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.toLowerCase());
    
    const topics = this.extractTopics(userMessages);
    const skillLevel = this.assessSkillLevel(userMessages);
    const interests = this.extractInterests(userMessages);
    
    return {
      userId,
      skillLevel,
      interests,
      topics,
      conversationCount: conversation.length / 2,
      lastActive: conversation.length > 0 ? conversation[conversation.length - 1].timestamp : null
    };
  }

  extractTopics(messages) {
    const topicKeywords = {
      'multi-agent': ['agent', 'mcp', 'orchestration', 'multi-agent'],
      'saas': ['saas', 'platform', 'no-code', 'automation'],
      'voice': ['voice', 'audio', 'elevenlabs', 'cloning'],
      'content': ['content', 'creation', 'midjourney', 'chatgpt'],
      'automation': ['automation', 'workflow', 'zapier', 'integration']
    };

    const topics = new Set();
    messages.forEach(message => {
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => message.includes(keyword))) {
          topics.add(topic);
        }
      });
    });

    return Array.from(topics);
  }

  assessSkillLevel(messages) {
    const technicalTerms = [
      'api', 'integration', 'architecture', 'protocol', 'algorithm',
      'optimization', 'deployment', 'infrastructure', 'microservices'
    ];

    const technicalCount = messages.reduce((count, message) => {
      return count + technicalTerms.filter(term => message.includes(term)).length;
    }, 0);

    if (technicalCount > 10) return 'advanced';
    if (technicalCount > 5) return 'intermediate';
    return 'beginner';
  }

  extractInterests(messages) {
    const interests = new Set();
    const interestKeywords = {
      'AI Tools': ['chatgpt', 'midjourney', 'runway', 'ai tool'],
      'Automation': ['automation', 'workflow', 'zapier'],
      'Content Creation': ['content', 'creation', 'video', 'audio'],
      'SaaS Development': ['saas', 'platform', 'development'],
      'Voice AI': ['voice', 'audio', 'elevenlabs']
    };

    messages.forEach(message => {
      Object.entries(interestKeywords).forEach(([interest, keywords]) => {
        if (keywords.some(keyword => message.includes(keyword))) {
          interests.add(interest);
        }
      });
    });

    return Array.from(interests);
  }

  async getMemoryStats() {
    if (!this.isInitialized || !this.collection) {
      return { error: 'Memory service not initialized' };
    }

    try {
      const count = await this.collection.count();
      return {
        totalMemories: count,
        activeUsers: this.conversations.size,
        isInitialized: this.isInitialized
      };
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      return { error: 'Failed to get stats' };
    }
  }
}

module.exports = ChromaMemoryService;
