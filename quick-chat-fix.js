// Quick Chat Fix - Minimal working solution
// This will work immediately without complex dependencies

const http = require('http');
const url = require('url');
require('dotenv').config();

const PORT = 3002;

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Health check endpoint
  if (path === '/health' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: 'Quick Chat Fix',
      port: PORT
    }));
    return;
  }

  // Chat endpoint
  if (path === '/api/chat' && method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { message } = data;
        
        if (!message) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            error: 'Message is required'
          }));
          return;
        }

        console.log('💬 Chat request:', message.substring(0, 50) + '...');

        // Call OpenAI API with your fine-tuned model
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU', // Your fine-tuned model
            messages: [
              {
                role: 'system',
                content: 'You are Parth, a 19-year-old AI video creator and college student from India. You\'re friendly, mix Hindi-English naturally, and have a good sense of humor. Keep responses concise and helpful. You have expertise in AI tools, video creation, and creative solutions.'
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

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.text();
          console.error('❌ OpenAI API Error:', openaiResponse.status, errorData);
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        const aiResponse = openaiData.choices[0].message.content;

        console.log('✅ Fine-tuned model response received');

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          response: aiResponse,
          model: 'ft:gpt-3.5-turbo-0125:personal::CAmRK7vU',
          usage: openaiData.usage
        }));

      } catch (error) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid request format'
        }));
      }
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({
    success: false,
    error: 'Not found',
    availableEndpoints: ['/health', '/api/chat']
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Quick Chat Fix Server Started!');
  console.log(`✅ Running on http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
  console.log('');
  console.log('📱 Your React app should now work!');
  console.log('   Visit: http://localhost:3001/chat');
  console.log('');
  console.log('🧪 Test:');
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/chat -H "Content-Type: application/json" -d '{"message":"Hello!"}'`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
