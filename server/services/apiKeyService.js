const crypto = require('crypto');
const OpenAI = require('openai');
const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

class APIKeyService {
  constructor() {
    // Use environment variable for encryption key, fallback to a default for development
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here';
    this.algorithm = 'aes-256-gcm';
  }

  // Encrypt API key
  encryptApiKey(apiKey) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      
      let encrypted = cipher.update(apiKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Return IV + AuthTag + Encrypted data
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('API key encryption error:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  // Decrypt API key
  decryptApiKey(encryptedData) {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('API key decryption error:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  // Validate OpenAI API key
  async validateOpenAIKey(apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
      
      // Test the key by making a simple API call
      const response = await openai.models.list();
      
      return {
        valid: true,
        models: response.data.map(model => model.id)
      };
    } catch (error) {
      logger.warn('OpenAI API key validation failed:', error.message);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Store encrypted API key for user
  async storeUserApiKey(userId, apiKey) {
    try {
      const encryptedKey = this.encryptApiKey(apiKey);
      
      // Validate the key before storing
      const validation = await this.validateOpenAIKey(apiKey);
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          openAIApiKey: encryptedKey,
          openAIApiKeyValid: validation.valid,
          openAIApiKeyLastValidated: new Date()
        }
      });

      logger.info(`API key stored for user ${userId}, valid: ${validation.valid}`);
      
      return {
        success: true,
        valid: validation.valid,
        models: validation.models || []
      };
    } catch (error) {
      logger.error('Failed to store API key:', error);
      throw error;
    }
  }

  // Get and decrypt user's API key
  async getUserApiKey(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { openAIApiKey: true, openAIApiKeyValid: true }
      });

      if (!user || !user.openAIApiKey) {
        return null;
      }

      if (!user.openAIApiKeyValid) {
        logger.warn(`User ${userId} has invalid API key`);
        return null;
      }

      const decryptedKey = this.decryptApiKey(user.openAIApiKey);
      return decryptedKey;
    } catch (error) {
      logger.error('Failed to get user API key:', error);
      return null;
    }
  }

  // Create OpenAI client for user
  async getOpenAIClient(userId) {
    try {
      const apiKey = await this.getUserApiKey(userId);
      
      if (!apiKey) {
        throw new Error('No valid OpenAI API key found for user');
      }

      return new OpenAI({ apiKey });
    } catch (error) {
      logger.error('Failed to create OpenAI client for user:', error);
      throw error;
    }
  }

  // Check user's API key status
  async getUserApiKeyStatus(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          openAIApiKey: true,
          openAIApiKeyValid: true,
          openAIApiKeyLastValidated: true
        }
      });

      if (!user || !user.openAIApiKey) {
        return {
          hasKey: false,
          valid: false,
          lastValidated: null
        };
      }

      return {
        hasKey: true,
        valid: user.openAIApiKeyValid,
        lastValidated: user.openAIApiKeyLastValidated
      };
    } catch (error) {
      logger.error('Failed to get API key status:', error);
      return {
        hasKey: false,
        valid: false,
        lastValidated: null
      };
    }
  }

  // Remove user's API key
  async removeUserApiKey(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          openAIApiKey: null,
          openAIApiKeyValid: false,
          openAIApiKeyLastValidated: null
        }
      });

      logger.info(`API key removed for user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to remove API key:', error);
      throw error;
    }
  }

  // Revalidate user's API key
  async revalidateUserApiKey(userId) {
    try {
      const apiKey = await this.getUserApiKey(userId);
      
      if (!apiKey) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            openAIApiKeyValid: false,
            openAIApiKeyLastValidated: new Date()
          }
        });
        return { valid: false, error: 'No API key found' };
      }

      const validation = await this.validateOpenAIKey(apiKey);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          openAIApiKeyValid: validation.valid,
          openAIApiKeyLastValidated: new Date()
        }
      });

      return {
        valid: validation.valid,
        models: validation.models || [],
        error: validation.error
      };
    } catch (error) {
      logger.error('Failed to revalidate API key:', error);
      throw error;
    }
  }

  // Get user's OpenAI usage (if available)
  async getUserUsage(userId) {
    try {
      const client = await this.getOpenAIClient(userId);
      
      // Note: OpenAI usage API requires specific permissions
      // This is a placeholder for when usage tracking is implemented
      const usage = await client.usage.list({
        date: new Date().toISOString().split('T')[0]
      });

      return {
        success: true,
        usage: usage.data
      };
    } catch (error) {
      logger.warn('Failed to get user usage:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new APIKeyService();
