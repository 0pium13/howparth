import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  User, 
  Brain, 
  Upload, 
  Crown,
  Star,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  reactions: string[];
  attachments?: any[];
  metadata?: {
    intent: string;
    confidence: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
    sources?: any[]; // Added for sources
  };
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  summary: string;
  topics: string[];
  userProfile: {
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    interests: string[];
    previousProjects: string[];
    preferredTools: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const AdvancedChat: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parth's personality and knowledge base
  const parthPersonality = {
    name: 'Parth',
    expertise: [
      'Multi-agent systems and MCP protocols',
      'No-code SaaS development',
      'Voice cloning and AI audio',
      'Enterprise AI integrations',
      'Custom AI tool recommendations'
    ]
  };

  // Quick actions for enhanced UX
  const quickActions = [
    { label: 'Explain more', action: 'explain' },
    { label: 'Show example', action: 'example' },
    { label: 'Related tools', action: 'tools' },
    { label: 'Book consultation', action: 'consultation' }
  ];

  // Message reactions
  const reactions = ['👍', '🤯', '❤️', '🔥'];

  const initializeConversation = useCallback(async () => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: 'Chat with Parth - AI Expert',
      messages: [],
      summary: '',
      topics: [],
      userProfile: {
        skillLevel: 'beginner',
        interests: [],
        previousProjects: [],
        preferredTools: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversation(newConversation);

    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hey there! 👋 I'm Parth, your AI expert and creative specialist. I've been working with AI for over 3 years and mastered 50+ tools including ChatGPT, Midjourney, RunwayML, and more.

I'm here to help you with anything AI-related - from building multi-agent systems to creating stunning AI-generated content. What would you like to explore today?`,
      timestamp: new Date(),
      reactions: [],
      metadata: {
        intent: 'greeting',
        confidence: 0.95,
        sentiment: 'positive',
        topics: ['introduction', 'expertise']
      }
    };

    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    initializeConversation();
  }, [initializeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const analyzeUserIntent = (message: string): any => {
    const intents = {
      greeting: ['hi', 'hello', 'hey', 'how are you'],
      technical: ['how to', 'build', 'create', 'implement'],
      consultation: ['help', 'advice', 'recommend'],
      casual: ['thanks', 'cool', 'awesome'],
      frustration: ['problem', 'error', 'stuck']
    };

    const lowerMessage = message.toLowerCase();
    let detectedIntent = 'general';
    let confidence = 0.5;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedIntent = intent;
        confidence = 0.8;
        break;
      }
    }

    if (lowerMessage.includes('thanks') || lowerMessage.includes('awesome')) {
      sentiment = 'positive';
    } else if (lowerMessage.includes('error') || lowerMessage.includes('problem')) {
      sentiment = 'negative';
    }

    return { intent: detectedIntent, confidence, sentiment };
  };

  const generateParthResponse = async (userMessage: string, context: any) => {
    const { intent, sentiment } = analyzeUserIntent(userMessage);
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);

    let response = '';
    
    switch (intent) {
      case 'greeting':
        response = `Hey! Great to see you! 😊 How's your AI journey going? I'm always excited to help fellow AI enthusiasts explore new possibilities. What's on your mind today?`;
        break;
      case 'technical':
        response = `Excellent question! Based on my experience with AI systems, here's what I'd recommend:

For multi-agent systems, I typically use MCP protocols for seamless communication between agents. This ensures reliable data flow and error handling.

Would you like me to dive deeper into any specific aspect or show you some practical examples?`;
        break;
      case 'consultation':
        response = `I'd be happy to help you with that! Based on your question, I think we could benefit from a more detailed consultation. 

I offer personalized AI strategy sessions where we can:
• Analyze your specific use case
• Recommend the perfect AI tools for your needs
• Create a step-by-step implementation plan
• Set up automation workflows

Would you like to schedule a consultation? I can also share some immediate insights based on what you've shared.`;
        break;
      default:
        response = `That's an interesting point! I love exploring new AI applications and use cases. 

From my experience with 50+ AI tools, I've found that the best approach is often to start simple and iterate. What specific outcome are you looking to achieve? I can suggest some tools and strategies that might be perfect for your needs.`;
    }

    return {
      content: response,
      metadata: {
        intent,
        confidence: 0.9,
        sentiment: sentiment as 'positive' | 'negative' | 'neutral',
        topics: ['ai', 'expertise', 'help']
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      reactions: [],
      attachments: [...attachments],
      metadata: analyzeUserIntent(inputMessage)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Try real AI backend first
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: user?.id || 'anonymous'
        })
      });

      if (response.ok) {
        // Handle streaming response
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let fullResponse = '';
          let sources: any[] = [];

          const assistantMessage: Message = {
            id: `msg_${Date.now() + 1}`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            reactions: [],
            metadata: {
              intent: 'ai_response',
              confidence: 0.9,
              sentiment: 'positive',
              topics: ['ai', 'response']
            }
          };

          setMessages(prev => [...prev, assistantMessage]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(Boolean);

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.error) {
                    throw new Error(data.error);
                  }

                  if (data.content) {
                    fullResponse += data.content;
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: fullResponse }
                        : msg
                    ));
                  }

                  if (data.sources && data.sources.length > 0) {
                    sources = data.sources;
                  }

                  if (data.done) {
                                         // Update final message with sources
                     setMessages(prev => prev.map(msg => 
                       msg.id === assistantMessage.id 
                         ? { 
                             ...msg, 
                             content: fullResponse,
                             metadata: {
                               ...msg.metadata!,
                               sources: sources
                             }
                           }
                         : msg
                     ));
                    setIsLoading(false);
                    return;
                  }
                } catch (e) {
                  console.error('Error parsing streaming data:', e);
                }
              }
            }
          }
        }
      } else {
        // Fallback to mock response if real AI is unavailable
        console.log('Real AI unavailable, using fallback response');
        const fallbackResponse = await generateParthResponse(inputMessage, {
          conversation: conversation,
          userProfile: conversation?.userProfile,
          previousMessages: messages
        });

        const assistantMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: fallbackResponse.content,
          timestamp: new Date(),
          reactions: [],
          metadata: fallbackResponse.metadata
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Show error message to user
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `I apologize, but I'm having trouble connecting to my AI services right now. This might be due to a temporary API issue.

To fix this:
1. Check your internet connection
2. Verify your OpenAI API key is valid
3. Try refreshing the page

For now, I can still help with general questions about AI and HOWPARTH!`,
        timestamp: new Date(),
        reactions: [],
        metadata: {
          intent: 'error',
          confidence: 1.0,
          sentiment: 'neutral',
          topics: ['error', 'help']
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: [...msg.reactions, reaction] }
        : msg
    ));
  };

  const handleQuickAction = (action: string) => {
    const actions = {
      explain: 'Could you explain that in more detail?',
      example: 'Can you show me a practical example?',
      tools: 'What tools would you recommend for this?',
      consultation: 'I\'d like to book a consultation session.'
    };

    setInputMessage(actions[action as keyof typeof actions] || '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b border-white/10 bg-black/50 backdrop-blur-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Parth - AI Expert
              </h1>
              <p className="text-gray-400 text-sm flex items-center space-x-2">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>3+ Years AI Experience • 50+ Tools Mastered</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                voiceEnabled 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-sm">Voice</span>
            </button>

            <button
              onClick={() => setShowContext(!showContext)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                showContext 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span className="text-sm">Knowledge</span>
            </button>
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-4 max-w-4xl ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-6 h-6 text-white" />
                        ) : (
                          <Crown className="w-6 h-6 text-white" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`relative group ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        <div className={`rounded-2xl px-6 py-4 backdrop-blur-xl border ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 text-white' 
                            : 'bg-white/10 border-white/20 text-gray-100'
                        } shadow-xl`}>
                          <div className="prose prose-invert max-w-none">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                          
                          {/* Message Metadata */}
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.metadata && (
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  message.metadata.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                                  message.metadata.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {message.metadata.intent}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {message.reactions.map((reaction, idx) => (
                              <span key={idx} className="text-lg">{reaction}</span>
                            ))}
                          </div>
                        )}

                        {/* Quick Actions for Assistant Messages */}
                        {message.role === 'assistant' && (
                          <div className="absolute -bottom-12 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-xl rounded-xl p-2 border border-white/20">
                              {reactions.map((reaction) => (
                                <button
                                  key={reaction}
                                  onClick={() => handleReaction(message.id, reaction)}
                                  className="hover:scale-110 transition-transform duration-200 text-lg"
                                >
                                  {reaction}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-4 max-w-4xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-xl">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-purple-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">Parth is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-t border-white/10 bg-black/30 backdrop-blur-xl">
              <div className="flex flex-wrap gap-3 mb-4">
                {quickActions.map((action) => (
                  <button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-gray-300 transition-all duration-200 hover:scale-105"
                  >
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex items-end space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 bg-white/10 hover:bg-white/20 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-200 hover:scale-105"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-4 h-4 text-gray-300" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.js,.ts,.py,.json"
                  onChange={(e) => e.target.files && console.log('File upload:', e.target.files)}
                  className="hidden"
                />

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Parth about AI, multi-agent systems, SaaS development, or anything else..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none pr-12 resize-none backdrop-blur-xl"
                    rows={1}
                    disabled={isLoading}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
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
                className="border-l border-white/10 bg-black/50 backdrop-blur-xl"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4 text-purple-400">Parth's Knowledge Base</h3>
                  <div className="space-y-4">
                    {parthPersonality.expertise.map((expertise, index) => (
                      <motion.div
                        key={expertise}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors duration-200"
                      >
                        <h4 className="font-semibold text-purple-400 mb-2">{expertise}</h4>
                        <p className="text-sm text-gray-400">Deep expertise in this area</p>
                      </motion.div>
                    ))}
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

export default AdvancedChat;
