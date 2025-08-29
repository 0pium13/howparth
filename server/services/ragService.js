const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../utils/logger');

class RAGService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Initialize Pinecone
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    this.indexName = process.env.PINECONE_INDEX_NAME || 'howparth-knowledge';
    this.index = null;
    this.namespace = 'transcripts';
    
    // Initialize index
    this.initializeIndex();
  }

  /**
   * Initialize Pinecone index
   */
  async initializeIndex() {
    try {
      // Check if index exists, create if not
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.some(index => index.name === this.indexName);
      
      if (!indexExists) {
        logger.info(`Creating Pinecone index: ${this.indexName}`);
        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 1536, // OpenAI text-embedding-ada-002 dimension
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        // Wait for index to be ready
        await this.waitForIndexReady();
      }
      
      this.index = this.pinecone.index(this.indexName);
      logger.info(`Pinecone index initialized: ${this.indexName}`);
      
    } catch (error) {
      logger.error('Failed to initialize Pinecone index:', error);
      throw error;
    }
  }

  /**
   * Wait for index to be ready
   */
  async waitForIndexReady() {
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const description = await this.pinecone.describeIndex(this.indexName);
        if (description.status.ready) {
          logger.info('Pinecone index is ready');
          return;
        }
        
        logger.info(`Waiting for index to be ready... (${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        attempts++;
        
      } catch (error) {
        logger.error('Error checking index status:', error);
        attempts++;
      }
    }
    
    throw new Error('Index failed to become ready within timeout');
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbeddings(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      logger.error('Failed to generate embeddings:', error);
      throw error;
    }
  }

  /**
   * Add document to vector store
   */
  async addDocument(id, content, metadata = {}) {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }
      
      // Generate embeddings
      const embedding = await this.generateEmbeddings(content);
      
      // Prepare vector for Pinecone
      const vector = {
        id: id,
        values: embedding,
        metadata: {
          content: content.substring(0, 1000), // Store truncated content
          fullContent: content,
          ...metadata,
          timestamp: new Date().toISOString()
        }
      };
      
      // Upsert to Pinecone
      await this.index.namespace(this.namespace).upsert([vector]);
      
      logger.info(`Document added to vector store: ${id}`);
      return { success: true, id };
      
    } catch (error) {
      logger.error('Failed to add document to vector store:', error);
      throw error;
    }
  }

  /**
   * Search for similar documents
   */
  async searchDocuments(query, topK = 5, filter = {}) {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }
      
      // Generate query embeddings
      const queryEmbedding = await this.generateEmbeddings(query);
      
      // Search in Pinecone
      const searchResponse = await this.index.namespace(this.namespace).query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      });
      
      // Format results
      const results = searchResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        content: match.metadata.fullContent || match.metadata.content,
        metadata: match.metadata
      }));
      
      logger.info(`Search completed, found ${results.length} results`);
      return results;
      
    } catch (error) {
      logger.error('Failed to search documents:', error);
      throw error;
    }
  }

  /**
   * Initialize vector store with transcript data
   */
  async initializeVectorStore() {
    try {
      logger.info('Initializing vector store with transcript data...');
      
      const transcripts = [
        {
          id: 'ai-agent-orchestration',
          content: `AI Agent Orchestration Research:
          Multi-agent systems require sophisticated orchestration patterns for optimal performance. 
          Key patterns include Master-Slave, Peer-to-Peer, and Hierarchical architectures.
          Master-Slave pattern provides centralized control while allowing distributed execution.
          Peer-to-Peer enables equal collaboration between agents.
          Hierarchical structures support complex decision-making processes.
          Error handling and recovery mechanisms are crucial for production deployments.
          Load balancing ensures optimal resource utilization across agent networks.
          Communication protocols must be standardized for interoperability.
          Security considerations include authentication, authorization, and data encryption.
          Monitoring and observability are essential for system health.
          Performance optimization requires careful tuning of agent interactions.`,
          metadata: {
            type: 'research',
            category: 'ai-orchestration',
            expertise: 'multi-agent systems, distributed computing'
          }
        },
        {
          id: 'custom-mcp-server',
          content: `Custom MCP Server Development:
          Model Context Protocol enables AI models to interact with external tools and data sources.
          RESTful API design principles are fundamental for MCP server implementation.
          Authentication mechanisms must be robust and secure.
          Error handling should be comprehensive with proper HTTP status codes.
          Rate limiting prevents abuse and ensures fair resource allocation.
          Documentation is critical for developer adoption and integration.
          Testing strategies include unit tests, integration tests, and load testing.
          Deployment considerations include containerization and cloud infrastructure.
          Monitoring and logging provide insights into server performance.
          Versioning strategies ensure backward compatibility.
          Security best practices include input validation and output sanitization.`,
          metadata: {
            type: 'development',
            category: 'mcp-protocol',
            expertise: 'API development, server architecture'
          }
        },
        {
          id: 'ai-saas-building',
          content: `AI SaaS Building Methodologies:
          Multi-tenancy architecture is essential for scalable SaaS platforms.
          API-first design enables integration with various client applications.
          Event-driven architecture supports real-time features and scalability.
          Database design must support tenant isolation and data security.
          User management includes authentication, authorization, and role-based access.
          Billing and subscription management are critical for business operations.
          Analytics and reporting provide insights into platform usage.
          Security measures include data encryption, access controls, and audit trails.
          Performance optimization requires caching, CDN, and database optimization.
          Customer support tools enable efficient issue resolution.
          Compliance with regulations like GDPR and SOC 2 is mandatory.`,
          metadata: {
            type: 'business',
            category: 'saas-development',
            expertise: 'SaaS architecture, business operations'
          }
        },
        {
          id: 'enterprise-ai-integration',
          content: `Enterprise AI Integration Strategies:
          Legacy system integration requires careful planning and execution.
          Data governance frameworks ensure data quality and compliance.
          Zero-trust architecture provides comprehensive security.
          Pilot programs validate AI solutions before full deployment.
          Change management processes support organizational adoption.
          Training programs ensure user competency and adoption.
          Performance monitoring tracks system health and optimization opportunities.
          Scalability planning supports business growth and expansion.
          Risk management identifies and mitigates potential issues.
          ROI measurement demonstrates business value and justification.
          Vendor management ensures reliable partnerships and support.`,
          metadata: {
            type: 'enterprise',
            category: 'ai-integration',
            expertise: 'enterprise architecture, change management'
          }
        }
      ];
      
      // Add all transcripts to vector store
      for (const transcript of transcripts) {
        await this.addDocument(transcript.id, transcript.content, transcript.metadata);
      }
      
      logger.info('Vector store initialization completed');
      return { success: true, documentsAdded: transcripts.length };
      
    } catch (error) {
      logger.error('Failed to initialize vector store:', error);
      throw error;
    }
  }

  /**
   * Generate RAG response with context
   */
  async generateRAGResponse(query, conversationHistory = [], topK = 5) {
    try {
      // Search for relevant documents
      const relevantDocs = await this.searchDocuments(query, topK);
      
      // Build context from relevant documents
      const context = relevantDocs.map(doc => doc.content).join('\n\n');
      
      // Build conversation history
      const historyText = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      // Create system prompt with context
      const systemPrompt = `You are an expert AI assistant with access to comprehensive research and knowledge about AI technologies, multi-agent systems, MCP protocols, SaaS development, and enterprise integration.

Context from knowledge base:
${context}

Previous conversation:
${historyText}

Based on the context and conversation history, provide a detailed, accurate, and helpful response. When appropriate, reference specific information from the context and provide actionable recommendations.`;

      // Generate response using OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });
      
      const response = completion.choices[0].message.content;
      
      return {
        response,
        context: relevantDocs,
        sources: relevantDocs.map(doc => ({
          id: doc.id,
          score: doc.score,
          metadata: doc.metadata
        }))
      };
      
    } catch (error) {
      logger.error('Failed to generate RAG response:', error);
      throw error;
    }
  }

  /**
   * Delete document from vector store
   */
  async deleteDocument(id) {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }
      
      await this.index.namespace(this.namespace).deleteOne(id);
      logger.info(`Document deleted from vector store: ${id}`);
      return { success: true };
      
    } catch (error) {
      logger.error('Failed to delete document:', error);
      throw error;
    }
  }

  /**
   * Get vector store statistics
   */
  async getStats() {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }
      
      const stats = await this.index.describeIndexStats({
        filter: {
          namespace: this.namespace
        }
      });
      
      return {
        totalVectors: stats.totalVectorCount,
        dimension: stats.dimension,
        namespaces: stats.namespaces
      };
      
    } catch (error) {
      logger.error('Failed to get vector store stats:', error);
      throw error;
    }
  }

  /**
   * Update document in vector store
   */
  async updateDocument(id, content, metadata = {}) {
    try {
      // Delete existing document
      await this.deleteDocument(id);
      
      // Add updated document
      return await this.addDocument(id, content, metadata);
      
    } catch (error) {
      logger.error('Failed to update document:', error);
      throw error;
    }
  }

  /**
   * Search documents by metadata filter
   */
  async searchByMetadata(filter, topK = 10) {
    try {
      if (!this.index) {
        await this.initializeIndex();
      }
      
      // Search with metadata filter
      const searchResponse = await this.index.namespace(this.namespace).query({
        vector: new Array(1536).fill(0), // Zero vector for metadata-only search
        topK: topK,
        includeMetadata: true,
        filter: filter
      });
      
      return searchResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        content: match.metadata.fullContent || match.metadata.content,
        metadata: match.metadata
      }));
      
    } catch (error) {
      logger.error('Failed to search by metadata:', error);
      throw error;
    }
  }
}

module.exports = RAGService;
