import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Search, FileText, Brain, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any[];
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI assistant, trained on comprehensive research about AI agent orchestration, MCP protocols, SaaS development, and enterprise integration. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate API call to RAG service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(inputMessage),
        timestamp: new Date(),
        context: generateContext()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = (query: string): string => {
    const responses = [
      "Based on the research on AI agent orchestration, I'd recommend implementing a Master-Slave pattern for your use case. This provides centralized control while allowing distributed execution across your agent network.",
      "For MCP server development, you'll want to focus on RESTful API design and secure authentication. The research shows that proper tool integration and error handling are crucial for production deployments.",
      "When building AI SaaS platforms, consider multi-tenancy architecture from the start. The research emphasizes the importance of API-first design and event-driven architecture for scalability.",
      "Enterprise AI integration requires careful planning around legacy system connectivity and data governance. I'd suggest starting with a pilot program and implementing zero-trust architecture for security."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateContext = () => {
    return [
      {
        title: 'AI Agent Orchestration',
        relevance: '95%',
        excerpt: 'Multi-agent systems require sophisticated orchestration patterns...'
      },
      {
        title: 'MCP Protocol Development',
        relevance: '87%',
        excerpt: 'Model Context Protocol enables AI models to interact with external tools...'
      }
    ];
  };

  const quickPrompts = [
    "How do I implement multi-agent orchestration?",
    "What are the best practices for MCP server development?",
    "How should I structure my AI SaaS platform?",
    "What security considerations are important for enterprise AI?"
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-6 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Research Chat</h1>
              <p className="text-gray-400 text-sm">Powered by RAG with transcript context</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowContext(!showContext)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showContext 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Context</span>
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-3xl ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-blue-600' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className={`rounded-2xl px-6 py-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        
                        {/* Context Sources */}
                        {message.context && message.context.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-xs text-gray-400 mb-2">Sources:</p>
                            <div className="space-y-2">
                              {message.context.map((source, index) => (
                                <div key={index} className="flex items-center space-x-2 text-xs">
                                  <FileText className="w-3 h-3 text-purple-400" />
                                  <span className="text-purple-400">{source.title}</span>
                                  <span className="text-gray-500">({source.relevance})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-800 rounded-2xl px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-400">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-6 border-t border-gray-800">
              <div className="flex flex-wrap gap-2 mb-4">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(prompt)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about AI agent orchestration, MCP protocols, SaaS development, or enterprise integration..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none pr-12"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Context Panel */}
          <AnimatePresence>
            {showContext && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-gray-800 bg-gray-900/50"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span>Knowledge Base</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-400 mb-2">AI Agent Orchestration</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        Multi-agent systems, communication protocols, orchestration patterns
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Master-Slave</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Peer-to-Peer</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Pipeline</span>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">MCP Server Development</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        Model Context Protocol, tool integration, API development
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">RESTful APIs</span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Authentication</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Tool Integration</span>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-2">AI SaaS Platform</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        Multi-tenancy, microservices, business models, security
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Multi-tenancy</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Microservices</span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Security</span>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-400 mb-2">Enterprise Integration</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        Legacy systems, data governance, compliance, change management
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">Legacy</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Governance</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Compliance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
