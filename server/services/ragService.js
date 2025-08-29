const OpenAI = require('openai');
const { logger } = require('../utils/logger');

class RAGService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Vector embeddings storage (in production, use Pinecone or Weaviate)
    this.vectorStore = new Map();
    
    // Initialize with transcript data
    this.initializeVectorStore();
  }

  // Initialize vector store with transcript embeddings
  async initializeVectorStore() {
    try {
      const transcripts = [
        {
          id: 'ai-agent-orchestration',
          title: 'AI Agent Orchestration',
          content: `
Multi-agent systems require sophisticated orchestration patterns for effective coordination. 
Key patterns include Master-Slave for centralized control, Peer-to-Peer for decentralized collaboration, 
Pipeline for sequential processing, and Broadcast for one-to-many communication.

Technical implementation involves message queues (Redis/RabbitMQ), distributed state management, 
error handling with graceful degradation, and comprehensive monitoring for agent performance tracking.

Best practices include agent isolation to prevent interference, horizontal scaling for scalability, 
secure authentication and authorization, and comprehensive observability with logging and metrics.
          `,
          tags: ['multi-agent', 'orchestration', 'distributed-systems', 'communication-protocols']
        },
        {
          id: 'custom-mcp-server',
          title: 'Custom MCP Server Development',
          content: `
MCP (Model Context Protocol) enables AI models to interact with external tools and APIs through 
standardized protocols. Implementation involves RESTful APIs for tool interactions, secure authentication 
and API key management, rate limiting for abuse prevention, and intelligent caching strategies.

Tool development includes creating specialized domain tools, building API wrappers for external services, 
implementing data transformation and validation, and comprehensive integration testing.

Deployment strategies include containerization with Docker, load balancing across multiple instances, 
real-time performance monitoring, and robust backup and recovery procedures.
          `,
          tags: ['mcp', 'api-development', 'tool-integration', 'server-architecture']
        },
        {
          id: 'ai-saas-building',
          title: 'AI SaaS Platform Development',
          content: `
AI SaaS platforms require sophisticated architecture patterns including multi-tenancy for isolated 
customer environments, microservices for modular scalability, API-first design for all interactions, 
and event-driven architecture for asynchronous processing.

AI integration strategies involve efficient model serving and inference, pipeline orchestration for 
complex workflows, secure data management, and model versioning for multiple deployments.

Business model implementation includes flexible subscription management, usage tracking and billing, 
feature flags for gradual rollout, and comprehensive analytics for customer behavior insights.
          `,
          tags: ['saas', 'ai-platform', 'business-models', 'multi-tenancy', 'microservices']
        },
        {
          id: 'enterprise-ai-integration',
          title: 'Enterprise AI Integration',
          content: `
Enterprise AI integration requires careful consideration of legacy system connectivity, data governance 
frameworks, scalability planning for large deployments, and organizational change management.

Integration patterns include API gateways for centralized management, event streaming with Kafka/Pulsar, 
data lakes for centralized analytics, and service mesh for microservices communication.

Security and compliance involve zero trust architecture, data classification and protection, 
compliance frameworks (SOC2, ISO27001, HIPAA), and vendor risk assessment for third-party services.
          `,
          tags: ['enterprise', 'integration', 'security', 'compliance', 'legacy-systems']
        }
      ];

      // Generate embeddings for all transcripts
      for (const transcript of transcripts) {
        await this.addDocument(transcript);
      }

      logger.info(`Vector store initialized with ${transcripts.length} transcripts`);

    } catch (error) {
      logger.error('Vector store initialization failed:', error);
    }
  }

  // Generate embeddings for text
  async generateEmbeddings(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;

    } catch (error) {
      logger.error('Embedding generation failed:', error);
      throw error;
    }
  }

  // Add document to vector store
  async addDocument(document) {
    try {
      // Generate embeddings for the document content
      const embeddings = await this.generateEmbeddings(document.content);
      
      // Store document with embeddings
      this.vectorStore.set(document.id, {
        ...document,
        embeddings,
        timestamp: new Date().toISOString()
      });

      logger.info(`Document added to vector store: ${document.title}`);

    } catch (error) {
      logger.error(`Failed to add document ${document.id}:`, error);
      throw error;
    }
  }

  // Calculate cosine similarity between two vectors
  calculateSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Search for relevant documents
  async searchDocuments(query, limit = 5) {
    try {
      // Generate embeddings for the query
      const queryEmbeddings = await this.generateEmbeddings(query);
      
      // Calculate similarities with all documents
      const similarities = [];
      
      for (const [id, document] of this.vectorStore.entries()) {
        const similarity = this.calculateSimilarity(queryEmbeddings, document.embeddings);
        similarities.push({
          id,
          document,
          similarity
        });
      }
      
      // Sort by similarity and return top results
      similarities.sort((a, b) => b.similarity - a.similarity);
      
      return similarities.slice(0, limit).map(item => ({
        id: item.id,
        title: item.document.title,
        content: item.document.content,
        tags: item.document.tags,
        similarity: item.similarity
      }));

    } catch (error) {
      logger.error('Document search failed:', error);
      return [];
    }
  }

  // Generate RAG response with context
  async generateRAGResponse(query, conversationHistory = []) {
    try {
      // Search for relevant documents
      const relevantDocs = await this.searchDocuments(query, 3);
      
      // Build context from relevant documents
      const context = relevantDocs.map(doc => 
        `Document: ${doc.title}\nContent: ${doc.content}\nRelevance: ${(doc.similarity * 100).toFixed(1)}%`
      ).join('\n\n');
      
      // Create system prompt with context
      const systemPrompt = `You are an expert AI consultant with deep knowledge in AI technologies, multi-agent systems, MCP protocols, SaaS development, and enterprise integration.

Based on the following relevant documents and conversation history, provide a comprehensive and accurate response:

RELEVANT DOCUMENTS:
${context}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

When responding:
1. Use information from the relevant documents when applicable
2. Maintain consistency with previous conversation context
3. Provide practical, actionable advice
4. Reference specific insights from the documents
5. Adapt recommendations to the user's specific needs

Current query: ${query}`;

      // Generate response using OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return {
        success: true,
        response: response.choices[0].message.content,
        context: relevantDocs,
        usage: response.usage
      };

    } catch (error) {
      logger.error('RAG response generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get document by ID
  getDocument(id) {
    const document = this.vectorStore.get(id);
    if (document) {
      return {
        id: document.id,
        title: document.title,
        content: document.content,
        tags: document.tags,
        timestamp: document.timestamp
      };
    }
    return null;
  }

  // Get all documents
  getAllDocuments() {
    return Array.from(this.vectorStore.values()).map(doc => ({
      id: doc.id,
      title: doc.title,
      tags: doc.tags,
      timestamp: doc.timestamp
    }));
  }

  // Update document
  async updateDocument(id, updates) {
    try {
      const existingDoc = this.vectorStore.get(id);
      if (!existingDoc) {
        throw new Error(`Document not found: ${id}`);
      }

      const updatedDoc = { ...existingDoc, ...updates };
      
      // Regenerate embeddings if content changed
      if (updates.content) {
        updatedDoc.embeddings = await this.generateEmbeddings(updates.content);
      }

      this.vectorStore.set(id, updatedDoc);
      
      logger.info(`Document updated: ${id}`);
      return { success: true };

    } catch (error) {
      logger.error(`Failed to update document ${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Delete document
  deleteDocument(id) {
    const deleted = this.vectorStore.delete(id);
    if (deleted) {
      logger.info(`Document deleted: ${id}`);
    }
    return { success: deleted };
  }

  // Get vector store statistics
  getStats() {
    return {
      totalDocuments: this.vectorStore.size,
      documents: this.getAllDocuments()
    };
  }
}

module.exports = new RAGService();
