const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class AITrainingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Training data from uploaded transcripts
    this.trainingData = {
      aiAgentOrchestration: {
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
        expertise: 'AI agent orchestration, multi-agent systems, distributed computing, system architecture'
      },
      customMCP: {
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
        expertise: 'MCP protocol, API development, server architecture, security, testing'
      },
      aiSaaS: {
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
        expertise: 'SaaS development, multi-tenancy, API design, business operations, compliance'
      },
      enterpriseAI: {
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
        expertise: 'Enterprise integration, data governance, security, change management, ROI'
      }
    };

    this.fineTunedModels = new Map();
    this.trainingJobs = new Map();
  }

  /**
   * Preprocess training data for fine-tuning
   */
  async preprocessTrainingData(transcriptType) {
    const data = this.trainingData[transcriptType];
    if (!data) {
      throw new Error(`Training data not found for type: ${transcriptType}`);
    }

    // Create training examples in the format required by OpenAI
    const trainingExamples = this.createTrainingExamples(data.content, data.expertise);
    
    // Save to temporary file
    const filename = `training_data_${transcriptType}_${Date.now()}.jsonl`;
    const filepath = path.join(__dirname, '../temp', filename);
    
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, trainingExamples.join('\n'));
    
    return filepath;
  }

  /**
   * Create training examples from content
   */
  createTrainingExamples(content, expertise) {
    const examples = [];
    
    // Split content into chunks and create Q&A pairs
    const chunks = content.split('\n').filter(line => line.trim().length > 0);
    
    for (let i = 0; i < chunks.length; i += 2) {
      if (i + 1 < chunks.length) {
        const question = this.generateQuestion(chunks[i], expertise);
        const answer = chunks[i + 1];
        
        examples.push(JSON.stringify({
          messages: [
            { role: "system", content: `You are an expert in ${expertise}. Provide detailed, accurate, and helpful responses.` },
            { role: "user", content: question },
            { role: "assistant", content: answer }
          ]
        }));
      }
    }
    
    return examples;
  }

  /**
   * Generate questions from content chunks
   */
  generateQuestion(content, expertise) {
    const questions = [
      `Can you explain ${content.toLowerCase()}?`,
      `What are the best practices for ${content.toLowerCase()}?`,
      `How should I implement ${content.toLowerCase()}?`,
      `What considerations are important for ${content.toLowerCase()}?`,
      `Can you provide guidance on ${content.toLowerCase()}?`
    ];
    
    return questions[Math.floor(Math.random() * questions.length)];
  }

  /**
   * Create fine-tuning job
   */
  async createFineTune(transcriptType, modelName = 'gpt-3.5-turbo') {
    try {
      logger.info(`Starting fine-tuning for ${transcriptType}`);
      
      // Preprocess training data
      const trainingFile = await this.preprocessTrainingData(transcriptType);
      
      // Upload training file
      const file = await this.openai.files.create({
        file: fs.createReadStream(trainingFile),
        purpose: 'fine-tune'
      });
      
      logger.info(`Training file uploaded: ${file.id}`);
      
      // Create fine-tuning job
      const fineTune = await this.openai.fineTuning.jobs.create({
        training_file: file.id,
        model: modelName,
        hyperparameters: {
          n_epochs: 3,
          batch_size: 1,
          learning_rate_multiplier: 0.1
        }
      });
      
      logger.info(`Fine-tuning job created: ${fineTune.id}`);
      
      // Store job information
      this.trainingJobs.set(fineTune.id, {
        transcriptType,
        status: fineTune.status,
        createdAt: new Date(),
        modelName
      });
      
      // Clean up temporary file
      await fs.unlink(trainingFile);
      
      return {
        jobId: fineTune.id,
        status: fineTune.status,
        transcriptType,
        modelName
      };
      
    } catch (error) {
      logger.error('Fine-tuning creation failed:', error);
      throw error;
    }
  }

  /**
   * Check fine-tuning job status
   */
  async checkFineTuneStatus(jobId) {
    try {
      const fineTune = await this.openai.fineTuning.jobs.retrieve(jobId);
      
      // Update stored job information
      if (this.trainingJobs.has(jobId)) {
        const jobInfo = this.trainingJobs.get(jobId);
        jobInfo.status = fineTune.status;
        jobInfo.updatedAt = new Date();
        
        if (fineTune.status === 'succeeded' && fineTune.fine_tuned_model) {
          jobInfo.fineTunedModel = fineTune.fine_tuned_model;
          this.fineTunedModels.set(jobInfo.transcriptType, fineTune.fine_tuned_model);
        }
      }
      
      return {
        jobId,
        status: fineTune.status,
        fineTunedModel: fineTune.fine_tuned_model,
        createdAt: fineTune.created_at,
        finishedAt: fineTune.finished_at,
        trainingFile: fineTune.training_file,
        resultFiles: fineTune.result_files
      };
      
    } catch (error) {
      logger.error('Failed to check fine-tuning status:', error);
      throw error;
    }
  }

  /**
   * Generate response using fine-tuned model
   */
  async generateResponse(prompt, transcriptType, useFineTuned = true) {
    try {
      let model = 'gpt-3.5-turbo';
      
      if (useFineTuned && this.fineTunedModels.has(transcriptType)) {
        model = this.fineTunedModels.get(transcriptType);
      }
      
      const data = this.trainingData[transcriptType];
      const systemPrompt = this.buildSystemPrompt(data?.expertise || 'AI and technology');
      
      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });
      
      return completion.choices[0].message.content;
      
    } catch (error) {
      logger.error('Response generation failed:', error);
      throw error;
    }
  }

  /**
   * Build system prompt for fine-tuned model
   */
  buildSystemPrompt(expertise) {
    return `You are an expert AI assistant specializing in ${expertise}. 
    You have been trained on comprehensive research and real-world implementation data.
    Provide detailed, accurate, and actionable responses based on your expertise.
    Always consider practical implementation details and best practices.
    When appropriate, include code examples, architectural recommendations, and security considerations.
    Your responses should be professional, informative, and tailored to the user's specific needs.`;
  }

  /**
   * Get available transcript types
   */
  getAvailableTranscripts() {
    return Object.keys(this.trainingData);
  }

  /**
   * Add custom training data
   */
  async addCustomTrainingData(type, content, expertise) {
    this.trainingData[type] = { content, expertise };
    logger.info(`Added custom training data for type: ${type}`);
  }

  /**
   * Get training job status
   */
  getTrainingJobStatus(jobId) {
    return this.trainingJobs.get(jobId);
  }

  /**
   * Get all training jobs
   */
  getAllTrainingJobs() {
    return Array.from(this.trainingJobs.entries()).map(([jobId, jobInfo]) => ({
      jobId,
      ...jobInfo
    }));
  }

  /**
   * Get fine-tuned models
   */
  getFineTunedModels() {
    return Array.from(this.fineTunedModels.entries()).map(([type, model]) => ({
      transcriptType: type,
      modelId: model
    }));
  }

  /**
   * Cancel fine-tuning job
   */
  async cancelFineTune(jobId) {
    try {
      const fineTune = await this.openai.fineTuning.jobs.cancel(jobId);
      logger.info(`Fine-tuning job cancelled: ${jobId}`);
      return fineTune;
    } catch (error) {
      logger.error('Failed to cancel fine-tuning job:', error);
      throw error;
    }
  }

  /**
   * List all fine-tuning jobs
   */
  async listFineTuningJobs(limit = 10) {
    try {
      const jobs = await this.openai.fineTuning.jobs.list({ limit });
      return jobs.data;
    } catch (error) {
      logger.error('Failed to list fine-tuning jobs:', error);
      throw error;
    }
  }
}

module.exports = AITrainingService;
