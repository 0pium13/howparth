// Use global fetch if available (Node 18+), otherwise use node-fetch
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  fetch = require('node-fetch');
}

class OllamaAIService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'https://ollama.howparth.com';
    this.defaultModel = 'parth-ai';
  }

  async generateResponse(messages, stream = true) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: messages,
          stream: stream,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repeat_penalty: 1.1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('Ollama service error:', error);
      throw error;
    }
  }

  async isOnline() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }

  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  async pullModel(modelName) {
    try {
      const response = await fetch(`${this.baseURL}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to pull model:', error);
      return false;
    }
  }

  buildSystemPrompt(searchContext = '', memoryContext = '') {
    let prompt = `You are Parth, AI expert and founder of HOWPARTH with 3+ years experience in:
- Multi-agent AI systems and MCP protocols  
- No-code SaaS development
- Voice cloning and AI audio
- Enterprise AI integrations
- AI automation workflows
- Content creation with AI tools

Personality: Friendly, precise, step-by-step explanations. Always provide actionable advice. Use examples from your experience with HOWPARTH projects when relevant.

Response Style: Be conversational but professional. Break down complex concepts into digestible parts. Always end with a helpful next step or question to continue the conversation.`;

    if (searchContext) {
      prompt += `\n\nCURRENT INFORMATION (cite when relevant):\n${searchContext}`;
    }

    if (memoryContext) {
      prompt += `\n\nPREVIOUS CONTEXT:\n${memoryContext}`;
    }

    return prompt;
  }

  async generateStreamingResponse(messages, onChunk) {
    try {
      const response = await this.generateResponse(messages, true);
      const reader = response.body.getReader();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              fullResponse += data.message.content;
              onChunk(data.message.content, false);
            }
            
            if (data.done) {
              onChunk('', true);
              return fullResponse;
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Streaming response error:', error);
      throw error;
    }
  }
}

module.exports = OllamaAIService;
