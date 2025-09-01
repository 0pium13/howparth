const express = require('express');
const RealAIChatController = require('../controllers/realAIChatController');
const router = express.Router();

const chatController = new RealAIChatController();

// Real AI streaming chat endpoint
router.post('/stream', async (req, res) => {
  await chatController.handleStreamingChat(req, res);
});

// Health check endpoint
router.get('/health', async (req, res) => {
  await chatController.handleHealthCheck(req, res);
});

// User profile endpoint
router.get('/profile/:userId', async (req, res) => {
  await chatController.handleUserProfile(req, res);
});

// Memory search endpoint
router.get('/memory/search', async (req, res) => {
  await chatController.handleMemorySearch(req, res);
});

// Knowledge base management
router.post('/knowledge', async (req, res) => {
  await chatController.handleKnowledgeBaseAdd(req, res);
});

// Legacy chat endpoint (fallback)
router.post('/', async (req, res) => {
  // Redirect to streaming endpoint
  await chatController.handleStreamingChat(req, res);
});

module.exports = router;
