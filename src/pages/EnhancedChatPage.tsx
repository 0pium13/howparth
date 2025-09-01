import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Search, Brain, Upload, Mic, MicOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import enhancedChatService from '../services/enhancedChatService';
import { Message, Conversation, Attachment, ChatSettings } from '../types/chat';
import { useToast } from '../components/Toast';

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  start(): void;
  stop(): void;
}

const EnhancedChatPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showContext, setShowContext] = useState(false);

  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const chatSettings: ChatSettings = {
    streaming: true,
    autoScroll: true,
    showTimestamps: true,
    showContext: true,
    showSentiment: true,
    theme: 'dark',
    fontSize: 'medium',
    compactMode: false
  };

  const initializeChat = useCallback(async () => {
    try {
      const newConversation: Conversation = {
        id: `conv_${Date.now()}`,
        userId: user?.id || 'guest',
        title: 'New Conversation',
        status: 'active',
        type: 'general',
        participants: [{
          id: user?.id || 'guest',
          username: user?.username || 'Guest',
          role: 'owner',
          avatar: user?.avatar || '',
          isOnline: true,
          lastSeen: new Date(),
          isTyping: false
        }],
        messages: [],
        metadata: {
          tags: [],
          priority: 'medium',
          category: 'general',
          estimatedDuration: 0,
          actualDuration: 0,
          satisfaction: 0,
          followUpRequired: false
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivity: new Date()
      };
      
      setConversation(newConversation);
      
      const welcomeMessage: Message = {
        id: 'welcome',
        conversationId: newConversation.id,
        role: 'assistant',
        content: `Hello ${user?.username || 'Guest'}! I'm your enhanced AI assistant with memory, streaming responses, and multimodal capabilities. How can I help you today?`,
        contentType: 'text',
        attachments: [],
        metadata: {
          userAgent: navigator.userAgent,
          ip: '',
          device: navigator.platform,
          sessionId: newConversation.id,
          responseTime: 0,
          modelUsed: 'gpt-4',
          tokensUsed: 0,
          cost: 0
        },
        context: [],
        sentiment: 'positive',
        confidence: 0.95,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
      showError('Failed to initialize chat');
    }
  }, [user, showError]);

  useEffect(() => {
    // Temporarily allow chat initialization without authentication
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInputMessage(prev => prev + ' ' + finalTranscript);
          }
        };
      }
    }
  }, []);



  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !conversation) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: conversation.id,
      role: 'user',
      content: inputMessage,
      contentType: 'text',
      attachments: [...attachments],
      metadata: {
        userAgent: navigator.userAgent,
        ip: '',
        device: navigator.platform,
        sessionId: conversation.id,
        responseTime: 0,
        modelUsed: '',
        tokensUsed: 0,
        cost: 0
      },
      context: [],
      sentiment: 'neutral',
      confidence: 1,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      if (chatSettings.streaming) {
        await handleStreamingResponse(userMessage);
      } else {
        await handleRegularResponse(userMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingResponse = async (userMessage: Message) => {
    setIsStreaming(true);
    const streamingMessageId = `stream_${Date.now()}`;

    const streamingMessage: Message = {
      id: streamingMessageId,
      conversationId: conversation!.id,
      role: 'assistant',
      content: '',
      contentType: 'text',
      attachments: [],
      metadata: userMessage.metadata,
      context: [],
      sentiment: 'neutral',
      confidence: 0,
      timestamp: new Date(),
      isStreaming: true,
      streamChunks: []
    };

    setMessages(prev => [...prev, streamingMessage]);

    let accumulatedContent = '';

    await enhancedChatService.sendMessageStream(
      conversation!.id,
      userMessage.content,
      userMessage.attachments,
      (chunk: string) => {
        accumulatedContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessageId 
              ? { ...msg, content: accumulatedContent, streamChunks: [...(msg.streamChunks || []), chunk] }
              : msg
          )
        );
      },
      (completeMessage: Message) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessageId 
              ? { ...completeMessage, id: streamingMessageId }
              : msg
          )
        );
        setIsStreaming(false);
      },
      (error: string) => {
        console.error('Streaming error:', error);
        showError('Error in AI response. Please try again.');
        setIsStreaming(false);
      }
    );
  };

  const handleRegularResponse = async (userMessage: Message) => {
    try {
      const response = await enhancedChatService.sendMessageWithFallback(
        conversation!.id,
        userMessage.content,
        userMessage.attachments
      );
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error getting response:', error);
      throw error;
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const attachment = await enhancedChatService.uploadAttachment(file);
        return attachment;
      });
      const uploadedAttachments = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedAttachments]);
      showSuccess(`${uploadedAttachments.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading files:', error);
      showError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      showError('Speech recognition not supported in this browser');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "How do I implement multi-agent orchestration?",
    "What are the best practices for MCP server development?",
    "How should I structure my AI SaaS platform?",
    "What security considerations are important for enterprise AI?"
  ];

  // Temporarily disabled authentication for development
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
  //       <div className="text-center">
  //         <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
  //         <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
  //         <p className="text-gray-400">Please log in to access the enhanced chat experience.</p>
  //       </div>
  //     </div>
  //   );
  // }

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
              <h1 className="text-2xl font-bold">Enhanced AI Chat</h1>
              <p className="text-gray-400 text-sm">Powered by advanced AI with memory and streaming</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleVoiceToggle}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isRecording ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-sm">Voice</span>
            </button>

            <button
              onClick={() => setShowContext(!showContext)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showContext ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
                        message.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-purple-500 to-blue-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      
                      <div className={`rounded-2xl px-6 py-4 ${
                        message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && !isStreaming && (
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
              <div className="flex items-end space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
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
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                />

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about AI agent orchestration, MCP protocols, SaaS development, or enterprise integration..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none pr-12 resize-none"
                    rows={1}
                    disabled={isLoading}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
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
                className="border-l border-gray-800 bg-gray-900/50"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Knowledge Base</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-400 mb-2">AI Agent Orchestration</h4>
                      <p className="text-sm text-gray-400">Multi-agent systems and communication protocols</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">MCP Server Development</h4>
                      <p className="text-sm text-gray-400">Model Context Protocol and tool integration</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-400 mb-2">AI SaaS Platform</h4>
                      <p className="text-sm text-gray-400">Multi-tenancy and microservices architecture</p>
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

export default EnhancedChatPage;
