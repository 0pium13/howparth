const { AIService } = require('../server/services/aiService');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [], userId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize AI service
    const aiService = new AIService();
    
    // Prepare messages for the AI
    const messages = [
      {
        role: 'user',
        content: message
      }
    ];

    // Generate response using fine-tuned model
    const result = await aiService.generateChatResponse(messages, {
      userId,
      model: 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU',
      maxTokens: 1000,
      temperature: 0.7
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        response: result.response,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
