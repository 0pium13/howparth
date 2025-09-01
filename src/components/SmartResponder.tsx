import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  BookOpen, 
  Code, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface ResponseTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  usage: number;
  rating: number;
}

interface SmartResponse {
  content: string;
  metadata: {
    intent: string;
    confidence: number;
    sentiment: string;
    topics: string[];
    responseType: 'template' | 'dynamic' | 'custom';
    generationTime: number;
  };
  suggestions: string[];
  relatedContent: string[];
}

interface SmartResponderProps {
  userMessage: string;
  context: any;
  onResponseGenerated: (response: SmartResponse) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const SmartResponder: React.FC<SmartResponderProps> = ({
  userMessage,
  context,
  onResponseGenerated,
  isGenerating,
  setIsGenerating
}) => {
  const [responseTemplates, setResponseTemplates] = useState<ResponseTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [responseHistory, setResponseHistory] = useState<SmartResponse[]>([]);

  // Initialize response templates
  useEffect(() => {
    const templates: ResponseTemplate[] = [
      {
        id: 'greeting_001',
        category: 'greeting',
        title: 'Friendly Welcome',
        content: "Hey there! 👋 I'm Parth, your AI expert and creative specialist. I've been working with AI for over 3 years and mastered 50+ tools. What would you like to explore today?",
        tags: ['welcome', 'introduction', 'friendly'],
        usage: 45,
        rating: 4.8
      },
      {
        id: 'technical_001',
        category: 'technical',
        title: 'Multi-Agent Systems',
        content: "For multi-agent systems, I typically use MCP protocols for seamless communication between agents. This ensures reliable data flow and error handling.\n\nBased on my experience with HOWPARTH projects, here's my recommended approach:\n1. Start with a clear agent hierarchy\n2. Implement MCP for inter-agent communication\n3. Use fallback mechanisms for reliability\n4. Monitor agent performance and optimize",
        tags: ['multi-agent', 'mcp', 'architecture', 'technical'],
        usage: 23,
        rating: 4.9
      },
      {
        id: 'consultation_001',
        category: 'consultation',
        title: 'Consultation Offer',
        content: "I'd be happy to help you with that! Based on your question, I think we could benefit from a more detailed consultation.\n\nI offer personalized AI strategy sessions where we can:\n• Analyze your specific use case\n• Recommend the perfect AI tools for your needs\n• Create a step-by-step implementation plan\n• Set up automation workflows",
        tags: ['consultation', 'strategy', 'planning'],
        usage: 18,
        rating: 4.7
      },
      {
        id: 'frustration_001',
        category: 'support',
        title: 'Problem Solving',
        content: "I understand that can be frustrating! 😔 Let's tackle this step by step.\n\nLet me understand the issue better:\n• What exactly are you trying to accomplish?\n• What tools or platforms are you using?\n• What error messages are you seeing?\n\nI've helped many people through similar challenges, and I'm confident we can find a solution together.",
        tags: ['support', 'problem-solving', 'empathy'],
        usage: 32,
        rating: 4.6
      },
      {
        id: 'tools_001',
        category: 'recommendations',
        title: 'AI Tool Recommendations',
        content: "Based on your needs, here are some AI tools I'd recommend:\n\n🎨 **Content Creation**: ChatGPT, Midjourney, RunwayML\n🤖 **Automation**: Zapier, Make, n8n\n🎬 **Video**: DaVinci Resolve, CapCut, Pika Labs\n🎵 **Audio**: ElevenLabs, Descript, Murf.ai\n\nEach tool has its strengths - would you like me to dive deeper into any specific one?",
        tags: ['tools', 'recommendations', 'ai-tools'],
        usage: 67,
        rating: 4.8
      }
    ];
    setResponseTemplates(templates);
  }, []);

  const generateSmartResponse = async (): Promise<SmartResponse> => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate response generation with progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    // Analyze user intent and context
    const intent = analyzeIntent(userMessage);
    const sentiment = analyzeSentiment(userMessage);
    const topics = extractTopics(userMessage);

    // Find best matching template
    const bestTemplate = findBestTemplate(intent, topics);
    
    // Generate dynamic content based on context
    const dynamicContent = await generateDynamicContent(userMessage, context, bestTemplate);

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

    clearInterval(progressInterval);
    setGenerationProgress(100);

    const response: SmartResponse = {
      content: dynamicContent,
      metadata: {
        intent,
        confidence: 0.85 + Math.random() * 0.1,
        sentiment,
        topics,
        responseType: bestTemplate ? 'template' : 'dynamic',
        generationTime: Date.now()
      },
      suggestions: generateSuggestions(intent, topics),
      relatedContent: generateRelatedContent(topics)
    };

    setResponseHistory(prev => [...prev, response]);
    setIsGenerating(false);
    setGenerationProgress(0);

    return response;
  };

  const analyzeIntent = (message: string): string => {
    const intents = {
      greeting: ['hi', 'hello', 'hey', 'how are you'],
      technical: ['how to', 'build', 'create', 'implement', 'agent', 'mcp'],
      consultation: ['help', 'advice', 'recommend', 'consultation'],
      frustration: ['problem', 'issue', 'error', 'stuck', 'confused'],
      tools: ['tool', 'software', 'platform', 'recommendation']
    };

    const lowerMessage = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }
    return 'general';
  };

  const analyzeSentiment = (message: string): string => {
    const positiveWords = ['thanks', 'awesome', 'great', 'love', 'excellent'];
    const negativeWords = ['problem', 'issue', 'error', 'stuck', 'frustrated'];
    
    const lowerMessage = message.toLowerCase();
    if (positiveWords.some(word => lowerMessage.includes(word))) return 'positive';
    if (negativeWords.some(word => lowerMessage.includes(word))) return 'negative';
    return 'neutral';
  };

  const extractTopics = (message: string): string[] => {
    const topics = ['ai', 'automation', 'content', 'video', 'audio', 'saas', 'multi-agent'];
    const lowerMessage = message.toLowerCase();
    return topics.filter(topic => lowerMessage.includes(topic));
  };

  const findBestTemplate = (intent: string, topics: string[]): ResponseTemplate | null => {
    const matchingTemplates = responseTemplates.filter(template => 
      template.category === intent || 
      template.tags.some(tag => topics.includes(tag))
    );

    if (matchingTemplates.length === 0) return null;

    // Sort by rating and usage
    return matchingTemplates.sort((a, b) => 
      (b.rating * b.usage) - (a.rating * a.usage)
    )[0];
  };

  const generateDynamicContent = async (
    userMessage: string, 
    context: any, 
    template: ResponseTemplate | null
  ): Promise<string> => {
    if (template) {
      // Enhance template with dynamic content
      let content = template.content;
      
      // Personalize based on user context
      if (context.userProfile) {
        content = content.replace(
          /I'm Parth/g, 
          `I'm Parth, and I see you're at the ${context.userProfile.skillLevel} level`
        );
      }

      // Add specific examples based on topics
      const topics = extractTopics(userMessage);
      if (topics.includes('multi-agent')) {
        content += '\n\nFor example, I recently helped a client build a customer service system with 5 AI agents that reduced response time by 80%.';
      }

      return content;
    }

    // Generate completely dynamic response
    return generateCustomResponse(userMessage, context);
  };

  const generateCustomResponse = (userMessage: string, context: any): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('project')) {
      return `I'd love to help you with your project! Based on my experience with 50+ AI tools, I can guide you through:\n\n• Project planning and strategy\n• Tool selection and setup\n• Implementation and optimization\n• Testing and deployment\n\nWhat type of project are you working on?`;
    }

    if (lowerMessage.includes('experience')) {
      return `I've been working with AI for over 3 years and have:\n\n• Mastered 50+ AI tools and platforms\n• Built successful SaaS applications\n• Created automation workflows for enterprise clients\n• Developed multi-agent systems\n• Generated thousands of AI-powered content pieces\n\nWhat specific area would you like to explore?`;
    }

    return `That's an interesting question! I love exploring new AI applications and use cases.\n\nFrom my experience with 50+ AI tools, I've found that the best approach is often to start simple and iterate. What specific outcome are you looking to achieve? I can suggest some tools and strategies that might be perfect for your needs.\n\nAlso, if you're interested, I can share some case studies from my work with HOWPARTH projects - we've tackled some really interesting challenges!`;
  };

  const generateSuggestions = (intent: string, topics: string[]): string[] => {
    const suggestions = {
      greeting: [
        "Tell me about your AI project",
        "What tools are you currently using?",
        "How can I help you today?"
      ],
      technical: [
        "Show me a practical example",
        "What's your current setup?",
        "Let's break this down step by step"
      ],
      consultation: [
        "Schedule a consultation session",
        "Share your project requirements",
        "Let's create a custom strategy"
      ],
      frustration: [
        "Let's troubleshoot together",
        "What error messages are you seeing?",
        "I can help you find a solution"
      ]
    };

    return suggestions[intent as keyof typeof suggestions] || [
      "Tell me more about your needs",
      "What's your experience level?",
      "How can I assist you further?"
    ];
  };

  const generateRelatedContent = (topics: string[]): string[] => {
    const contentMap = {
      'ai': ['AI Fundamentals Guide', 'Getting Started with AI Tools'],
      'automation': ['Automation Best Practices', 'Zapier Workflow Examples'],
      'content': ['Content Creation Strategies', 'AI Content Tools Comparison'],
      'video': ['Video Editing with AI', 'AI Video Generation Guide'],
      'saas': ['SaaS Development Roadmap', 'No-Code SaaS Platforms']
    };

    const related = topics.flatMap(topic => 
      contentMap[topic as keyof typeof contentMap] || []
    );

    return related.slice(0, 3);
  };

  const handleGenerateResponse = async () => {
    const response = await generateSmartResponse();
    onResponseGenerated(response);
  };

  const getCategoryColor = (category: string): string => {
    const colors = {
      greeting: 'from-green-500 to-green-600',
      technical: 'from-blue-500 to-blue-600',
      consultation: 'from-purple-500 to-purple-600',
      support: 'from-orange-500 to-orange-600',
      recommendations: 'from-pink-500 to-pink-600'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Response Generation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateResponse}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Generating...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span className="text-sm">Generate Response</span>
              </>
            )}
          </motion.button>

          {isGenerating && (
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-gray-400">{Math.round(generationProgress)}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Avg: 2.3s</span>
        </div>
      </div>

      {/* Response Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Response Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {responseTemplates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                selectedTemplate?.id === template.id
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50'
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white mb-1">{template.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getCategoryColor(template.category)} text-white`}>
                      {template.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-400">{template.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {template.usage} uses
                </div>
              </div>
              
              <p className="text-sm text-gray-300 line-clamp-3">
                {template.content.substring(0, 120)}...
              </p>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 text-gray-300 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Response History */}
      {responseHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Recent Responses</h3>
          <div className="space-y-3">
            {responseHistory.slice(-3).reverse().map((response, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/10 rounded-xl border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      response.metadata.responseType === 'template' ? 'bg-purple-400' :
                      response.metadata.responseType === 'dynamic' ? 'bg-blue-400' :
                      'bg-green-400'
                    }`} />
                    <span className="text-xs text-gray-400 capitalize">
                      {response.metadata.responseType}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(response.metadata.confidence * 100)}% confidence
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(response.metadata.generationTime).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 line-clamp-2">
                  {response.content.substring(0, 150)}...
                </p>
                
                {response.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {response.suggestions.slice(0, 2).map((suggestion, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs border border-purple-500/30"
                      >
                        {suggestion}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartResponder;
