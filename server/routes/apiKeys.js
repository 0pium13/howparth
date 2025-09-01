const express = require('express');
const { body, validationResult } = require('express-validator');
const apiKeyService = require('../services/apiKeyService');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Store/Update user's OpenAI API key
router.post('/openai', [
  body('apiKey')
    .isString()
    .isLength({ min: 20 })
    .withMessage('API key must be a valid string with at least 20 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { apiKey } = req.body;
    const userId = req.user.id;

    const result = await apiKeyService.storeUserApiKey(userId, apiKey);

    if (result.success) {
      res.json({
        success: true,
        message: 'API key stored successfully',
        valid: result.valid,
        models: result.models
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to store API key'
      });
    }
  } catch (error) {
    logger.error('API key storage error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's API key status
router.get('/openai/status', async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await apiKeyService.getUserApiKeyStatus(userId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('API key status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Revalidate user's API key
router.post('/openai/validate', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await apiKeyService.revalidateUserApiKey(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove user's API key
router.delete('/openai', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await apiKeyService.removeUserApiKey(userId);

    res.json({
      success: true,
      message: 'API key removed successfully'
    });
  } catch (error) {
    logger.error('API key removal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's OpenAI usage (if available)
router.get('/openai/usage', async (req, res) => {
  try {
    const userId = req.user.id;
    const usage = await apiKeyService.getUserUsage(userId);

    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    logger.error('Usage retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
