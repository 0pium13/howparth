const { logger } = require('../utils/logger');
const apiKeyService = require('./apiKeyService');

class AIService {
  constructor() {
    // AI service now uses per-user API keys
    logger.info('AI Service initialized - using per-user API keys');
  }

  // Generate blog content
  async generateBlogContent(userId, prompt, options = {}) {
    try {
      const openai = await apiKeyService.getOpenAIClient(userId);
      
      const {
        model = 'gpt-4',
        maxTokens = 2000,
        temperature = 0.7,
        writingStyle = 'professional',
        targetAudience = 'general',
        tone = 'informative'
      } = options;

      const enhancedPrompt = this.buildBlogPrompt(prompt, {
        writingStyle,
        targetAudience,
        tone
      });

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert AI content creator specializing in artificial intelligence, automation, and creative technology. Write engaging, informative content that matches the specified style and tone.`
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: maxTokens,
        temperature,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };

    } catch (error) {
      logger.error('Blog content generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate AI tool recommendations
  async generateToolRecommendations(userId, userRequirements, options = {}) {
    try {
      const openai = await apiKeyService.getOpenAIClient(userId);
      
      const {
        model = 'gpt-4',
        maxTokens = 1500,
        temperature = 0.5
      } = options;

      const prompt = this.buildRecommendationPrompt(userRequirements);

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are an expert AI consultant with deep knowledge of 50+ AI tools. Provide personalized recommendations based on user requirements, considering budget, skill level, and use case.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature,
        top_p: 1
      });

      return {
        success: true,
        recommendations: response.choices[0].message.content,
        usage: response.usage
      };

    } catch (error) {
      logger.error('Tool recommendation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate chat responses
  async generateChatResponse(messages, options = {}) {
    try {
      const {
        model = 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU', // Fine-tuned Parth model
        maxTokens = 1000,
        temperature = 0.7
      } = options;

      // Get OpenAI client for the user (assuming this function needs userId)
      const openai = await apiKeyService.getOpenAIClient(options.userId || 'default');

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are Parth, a 19-year-old AI video creator and college student from India. You're friendly, mix Hindi-English naturally, and have a good sense of humor.`
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

  // Generate SEO metadata
  async generateSEOMetadata(title, content, options = {}) {
    try {
      const {
        model = 'gpt-3.5-turbo',
        maxTokens = 500,
        temperature = 0.3
      } = options;

      const prompt = `Generate SEO metadata for this blog post:

Title: ${title}
Content: ${content.substring(0, 1000)}...

Please provide:
1. Meta title (50-60 characters)
2. Meta description (150-160 characters)
3. 5-8 relevant keywords
4. SEO score (1-100) with explanation

Format as JSON.`;

      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Generate optimized metadata for blog posts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature
      });

      const seoData = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        seoData,
        usage: response.usage
      };

    } catch (error) {
      logger.error('SEO metadata generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate social media content
  async generateSocialContent(blogContent, platform, options = {}) {
    try {
      const {
        model = 'gpt-3.5-turbo',
        maxTokens = 300,
        temperature = 0.7
      } = options;

      const platformPrompts = {
        linkedin: 'Create a professional LinkedIn post (max 1300 characters)',
        twitter: 'Create a Twitter thread (max 280 characters per tweet, 3-5 tweets)',
        instagram: 'Create an Instagram caption with relevant hashtags',
        facebook: 'Create a Facebook post with engaging copy'
      };

      const prompt = `${platformPrompts[platform.toLowerCase()]} based on this content:

${blogContent.substring(0, 1000)}...

Make it engaging and platform-appropriate.`;

      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a social media expert. Create platform-specific content that drives engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };

    } catch (error) {
      logger.error('Social content generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Build enhanced blog prompt
  buildBlogPrompt(topic, options) {
    const { writingStyle, targetAudience, tone } = options;
    
    return `Write a comprehensive blog post about: ${topic}

Requirements:
- Writing Style: ${writingStyle}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- Include practical examples and actionable insights
- Use engaging headings and subheadings
- Include a compelling introduction and conclusion
- Optimize for readability and SEO
- Include relevant statistics or case studies when appropriate

Make it informative, engaging, and valuable to the reader.`;
  }

  // Build recommendation prompt
  buildRecommendationPrompt(requirements) {
    return `Based on these requirements, recommend the best AI tools:

Requirements: ${requirements}

Please provide:
1. Top 3-5 tool recommendations with explanations
2. Why each tool is suitable
3. Estimated learning curve and cost
4. Alternative options
5. Implementation timeline
6. Expected outcomes

Be specific and actionable in your recommendations.`;
  }

  // Analyze writing style from existing content
  async analyzeWritingStyle(userId, content) {
    try {
      const openai = await apiKeyService.getOpenAIClient(userId);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze the writing style and create a style profile.'
          },
          {
            role: 'user',
            content: `Analyze this content and extract writing style characteristics:

${content}

Provide a JSON object with:
- tone
- vocabulary_level
- sentence_structure
- common_phrases
- writing_patterns`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      logger.error('Writing style analysis error:', error);
      return null;
    }
  }
}

module.exports = new AIService();
