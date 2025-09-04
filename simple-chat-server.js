// Simple Chat Server - Quick Fix for Chat Section
// Run this alongside your React app: node simple-chat-server.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3002; // Different port from React app

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables (you need to set these)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';
const FINE_TUNED_MODEL = process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU';

console.log('🚀 Simple Chat Server Starting...');
console.log('📋 Configuration:');
console.log('   - Port:', PORT);
console.log('   - OpenAI API Key:', OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   - Fine-tuned Model:', FINE_TUNED_MODEL);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Simple Chat Server',
    port: PORT,
    openaiConfigured: !!OPENAI_API_KEY
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      });
    }

    console.log('🔍 Chat request:', { message: message.substring(0, 50) + '...', userId });

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      // Mock response for testing
      console.log('⚠️  Using mock response (no API key configured)');
      return res.json({
        success: true,
        response: `Hi! I'm Parth's AI assistant. You said: "${message}". This is a mock response because the OpenAI API key isn't configured yet. Please add your API key to the environment variables.`,
        model: 'mock-model',
        usage: { total_tokens: 50 }
      });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: FINE_TUNED_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are Parth, a 19-year-old AI video creator and college student from India. You\'re friendly, mix Hindi-English naturally, and have a good sense of humor. Keep responses concise and helpful.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ OpenAI Response received');

    res.json({
      success: true,
      response: aiResponse,
      model: FINE_TUNED_MODEL,
      usage: data.usage
    });

  } catch (error) {
    console.error('❌ Chat API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple Chat Server running on http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log('');
  console.log('📝 To test:');
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log('');
  console.log('🔧 To configure OpenAI API key:');
  console.log('   export OPENAI_API_KEY="your-actual-api-key"');
  console.log('   export FINE_TUNED_MODEL_ID="your-model-id"');
  console.log('');
});
