# 🤖 HOWPARTH AI System Setup Guide

## 🎯 Overview

HOWPARTH now features a **complete AI backend** that provides real ChatGPT-like functionality using:

- **🦙 Ollama** - Local LLM (Llama 3.2) for AI responses
- **🔍 Brave Search** - Free web search with RSS fallback
- **🧠 Chroma** - Vector database for conversation memory
- **⚡ Streaming** - Real-time AI responses
- **🎨 Premium UI** - Beautiful chat interface

## 🚀 Quick Start

### 1. Automated Setup (Recommended)

```bash
# Run the automated setup script
./scripts/setup-ai.sh
```

This script will:
- Install Ollama
- Download AI models
- Set up environment
- Create data directories
- Test the installation

### 2. Manual Setup

#### Step 1: Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com

#### Step 2: Download AI Models

```bash
# Start Ollama
ollama serve

# In another terminal, download models
ollama pull llama3.2:7b-instruct
ollama pull nomic-embed-text
```

#### Step 3: Get Brave Search API Key

1. Visit https://api.search.brave.com/
2. Sign up for free account
3. Get your API key (2000 free requests/month)

#### Step 4: Configure Environment

```bash
# Copy environment template
cp env.ai.example .env

# Edit .env file
nano .env
```

Add your Brave API key:
```env
BRAVE_API_KEY=your_free_brave_api_key_here
```

#### Step 5: Install Dependencies

```bash
npm install
```

#### Step 6: Start the System

```bash
# Start Ollama (in background)
ollama serve &

# Start the application
npm run dev
```

## 🎮 Usage

### Access the AI Chat

1. Open http://localhost:3000/chat
2. Start chatting with Parth!

### Features Available

- **Real AI Responses** - Powered by Llama 3.2
- **Web Search** - Current information from Brave Search
- **Memory** - Remembers your conversations
- **Streaming** - Real-time responses
- **Voice** - Voice input/output (coming soon)
- **Document Analysis** - Upload files for AI analysis

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_URL` | Ollama server URL | `http://localhost:11434` |
| `BRAVE_API_KEY` | Brave Search API key | Required |
| `CHROMA_PATH` | Vector database path | `./data/chroma_db` |
| `USE_REAL_AI` | Enable real AI features | `true` |

### AI Models

The system uses these models:

- **llama3.2:7b-instruct** - Main conversation model
- **nomic-embed-text** - Vector embeddings for memory

To use different models, edit `server/services/ollamaAIService.js`:

```javascript
this.defaultModel = 'your-preferred-model';
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "AI service is currently unavailable"

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

#### 2. "Failed to download model"

**Solution:**
```bash
# Check internet connection
# Try downloading again
ollama pull llama3.2:7b-instruct
```

#### 3. "Brave API limit reached"

**Solution:**
- The system automatically falls back to RSS feeds
- Get a new API key or wait for next month
- RSS fallback provides tech news from major sources

#### 4. "Chroma initialization error"

**Solution:**
```bash
# Create data directory
mkdir -p data/chroma_db

# Check permissions
chmod 755 data/chroma_db
```

### Performance Optimization

#### For Better Response Speed:

1. **Use a smaller model:**
```bash
ollama pull llama3.1:3b-instruct
```

2. **Adjust Ollama settings** in `server/services/ollamaAIService.js`:
```javascript
options: {
  temperature: 0.5,  // Lower = faster, less creative
  top_p: 0.8,       // Lower = faster
  top_k: 20,        // Lower = faster
}
```

#### For Better Quality:

1. **Use a larger model:**
```bash
ollama pull llama3.2:70b-instruct
```

2. **Increase context window** in the controller

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/api/chat/health
```

Response:
```json
{
  "success": true,
  "services": {
    "ai": {
      "status": "online",
      "model": "llama3.2:7b-instruct"
    },
    "memory": {
      "totalMemories": 42,
      "activeUsers": 3,
      "isInitialized": true
    },
    "search": {
      "requestsThisMonth": 156,
      "monthlyLimit": 2000,
      "remainingRequests": 1844,
      "usingFallback": false
    }
  }
}
```

### Logs

Check logs for debugging:
```bash
# Application logs
tail -f logs/app.log

# Ollama logs
ollama logs
```

## 🔒 Security

### API Keys

- Store API keys in `.env` file (never commit to git)
- Brave API key is rate-limited (2000 requests/month)
- Ollama runs locally (no external API calls)

### Data Privacy

- All conversations stored locally in Chroma
- No data sent to external AI services
- User data stays on your server

## 🚀 Deployment

### Production Setup

1. **Use a production model:**
```bash
ollama pull llama3.2:70b-instruct
```

2. **Set up environment:**
```env
NODE_ENV=production
OLLAMA_URL=http://your-ollama-server:11434
```

3. **Configure reverse proxy** (nginx example):
```nginx
location /api/chat/stream {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Docker Deployment

```dockerfile
# Dockerfile for Ollama
FROM ollama/ollama:latest
EXPOSE 11434
CMD ["ollama", "serve"]
```

## 📈 Scaling

### Horizontal Scaling

1. **Multiple Ollama instances:**
```bash
# Instance 1
OLLAMA_URL=http://ollama1:11434

# Instance 2  
OLLAMA_URL=http://ollama2:11434
```

2. **Load balancer** for chat endpoints

3. **Shared Chroma database** for memory

### Vertical Scaling

1. **More RAM** for larger models
2. **GPU acceleration** for faster inference
3. **SSD storage** for Chroma database

## 🤝 Contributing

### Adding New Features

1. **New AI Models:**
   - Add to `ollamaAIService.js`
   - Update model selection logic

2. **New Search Sources:**
   - Extend `braveSearchService.js`
   - Add new RSS feeds

3. **New Memory Features:**
   - Extend `chromaMemoryService.js`
   - Add new vector operations

### Testing

```bash
# Test AI service
curl -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Parth!", "userId": "test"}'

# Test health check
curl http://localhost:3001/api/chat/health
```

## 📚 Resources

- [Ollama Documentation](https://ollama.com/docs)
- [Brave Search API](https://api.search.brave.com/)
- [Chroma Documentation](https://docs.trychroma.com/)
- [HOWPARTH Chat](http://localhost:3000/chat)

## 🎉 Success!

Your HOWPARTH AI system is now ready! Enjoy chatting with Parth, your AI expert assistant.

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.
