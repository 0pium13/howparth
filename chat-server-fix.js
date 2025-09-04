// Production-Ready Chat Server - Complete Solution
// This replaces the problematic backend and provides a reliable chat API

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://192.168.1.7:3001'],
  credentials: true
}));
app.use(express.json());

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FINE_TUNED_MODEL = process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU';

console.log('🚀 Production Chat Server Starting...');
console.log('📋 Configuration:');
console.log('   - Port:', PORT);
console.log('   - OpenAI API Key:', OPENAI_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('   - Fine-tuned Model:', FINE_TUNED_MODEL);
console.log('   - CORS Origins:', ['http://localhost:3001', 'http://localhost:3000', 'http://192.168.1.7:3001']);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Production Chat Server',
    port: PORT,
    openaiConfigured: !!OPENAI_API_KEY,
    fineTunedModel: FINE_TUNED_MODEL,
    cors: 'Enabled for localhost and network access'
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, userId, messages = [] } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      });
    }

    console.log('🔍 Chat request:', { 
      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });

    // If no API key, return helpful mock response
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('⚠️  Using mock response (no API key configured)');
      const mockResponse = `Hi! I'm Parth's AI assistant. You said: "${message}". 

This is a mock response because the OpenAI API key isn't configured yet. 

To fix this:
1. Add your OpenAI API key to the .env file:
   OPENAI_API_KEY=sk-your-actual-api-key-here

2. Restart this server

3. Your fine-tuned model will then respond with Parth's personality!`;

      return res.json({
        success: true,
        response: mockResponse,
        model: 'mock-model',
        usage: { total_tokens: 50 },
        mock: true
      });
    }

    // Prepare messages for OpenAI
    const chatMessages = [
      {
        role: 'system',
        content: 'You are Parth, a 19-year-old AI video creator and college student from India. You\'re friendly, mix Hindi-English naturally, and have a good sense of humor. Keep responses concise and helpful. You have expertise in AI tools, video creation, and creative solutions.'
      },
      ...messages,
      {
        role: 'user',
        content: message
      }
    ];

    console.log('🤖 Calling OpenAI API with fine-tuned model...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: FINE_TUNED_MODEL,
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorData);
      
      // Provide helpful error messages
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your .env file.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 404) {
        throw new Error('Fine-tuned model not found. Please check your model ID.');
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const responseTime = Date.now() - startTime;

    console.log('✅ OpenAI Response received:', {
      responseLength: aiResponse.length,
      responseTime: `${responseTime}ms`,
      tokensUsed: data.usage?.total_tokens || 0
    });

    res.json({
      success: true,
      response: aiResponse,
      model: FINE_TUNED_MODEL,
      usage: data.usage,
      responseTime: responseTime
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Chat API Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: error.message,
      responseTime: responseTime
    });
  }
});

// Monitoring endpoint
app.get('/api/monitoring/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Production Chat Server',
    port: PORT,
    openaiConfigured: !!OPENAI_API_KEY,
    fineTunedModel: FINE_TUNED_MODEL,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    availableEndpoints: ['/health', '/api/chat', '/api/monitoring/health']
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('✅ Production Chat Server is running!');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`📊 Monitoring: http://localhost:${PORT}/api/monitoring/health`);
  console.log('');
  console.log('📱 Your React app should connect to:');
  console.log(`   http://localhost:${PORT}/api/chat`);
  console.log('');
  console.log('🧪 Test commands:');
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/chat -H "Content-Type: application/json" -d '{"message":"Hello!"}'`);
  console.log('');
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
    console.log('⚠️  CONFIGURATION NEEDED:');
    console.log('   1. Add your OpenAI API key to .env file');
    console.log('   2. Restart this server');
    console.log('   3. Your fine-tuned model will then work!');
    console.log('');
  } else {
    console.log('🎉 Ready to use your fine-tuned model!');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down chat server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down chat server...');
  process.exit(0);
});
