const express = require('express');
const EnhancedChatController = require('../controllers/enhancedChatController');
const router = express.Router();

const chatController = new EnhancedChatController();

// Enhanced chat endpoint with robust error handling
router.post('/stream', async (req, res) => {
  await chatController.handleStreamingChat(req, res);
});

// Enhanced chat endpoint (non-streaming)
router.post('/', async (req, res) => {
  await chatController.handleChat(req, res);
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

// Status dashboard endpoint
router.get('/status', async (req, res) => {
  await chatController.handleStatusDashboard(req, res);
});

module.exports = router;
