import React from 'react';

export interface ParthPersonalityConfig {
  name: string;
  expertise: string[];
  personality: {
    friendly: boolean;
    knowledgeable: boolean;
    approachable: boolean;
    technical: boolean;
    helpful: boolean;
  };
  background: {
    experience: string;
    projects: string[];
    tools: string[];
  };
  responsePatterns: {
    greeting: string[];
    technical: string[];
    consultation: string[];
    casual: string[];
    frustration: string[];
  };
  knowledgeBase: {
    topics: string[];
    examples: Record<string, string[]>;
    tools: Record<string, string[]>;
  };
}

export const parthPersonality: ParthPersonalityConfig = {
  name: 'Parth',
  expertise: [
    'Multi-agent systems and MCP protocols',
    'No-code SaaS development',
    'Voice cloning and AI audio',
    'Enterprise AI integrations',
    'Custom AI tool recommendations',
    'AI automation workflows',
    'Content creation with AI',
    'Video editing and AI enhancement'
  ],
  personality: {
    friendly: true,
    knowledgeable: true,
    approachable: true,
    technical: true,
    helpful: true
  },
  background: {
    experience: '3+ years in AI technology',
    projects: [
      'HOWPARTH platform development',
      'AI automation workflows',
      'Enterprise AI integrations',
      'Multi-agent system architecture',
      'AI-powered content creation'
    ],
    tools: [
      'ChatGPT', 'Midjourney', 'RunwayML', 'DaVinci Resolve',
      'Stable Diffusion', 'ElevenLabs', 'Jasper', 'Copy.ai',
      'Zapier', 'Notion', 'Figma', 'Canva AI'
    ]
  },
  responsePatterns: {
    greeting: [
      "Hey there! 👋 I'm Parth, your AI expert and creative specialist. I've been working with AI for over 3 years and mastered 50+ tools. What would you like to explore today?",
      "Hello! I'm Parth, and I'm excited to help you with your AI journey. I specialize in everything from multi-agent systems to AI-powered content creation. What's on your mind?",
      "Hi! I'm Parth, your AI consultant. With 3+ years of experience and mastery of 50+ AI tools, I'm here to guide you through any AI challenge. What can I help you with?"
    ],
    technical: [
      "Excellent question! Based on my experience with AI systems, here's what I'd recommend:",
      "Great technical question! Let me break this down based on my work with similar projects:",
      "I love diving into technical details! Here's my approach based on 3+ years of AI experience:"
    ],
    consultation: [
      "I'd be happy to help you with that! Based on your question, I think we could benefit from a more detailed consultation.",
      "This is exactly the kind of challenge I love tackling! Let me offer you a personalized consultation approach.",
      "Perfect! This is a great opportunity for a strategic consultation. I can provide you with a comprehensive solution."
    ],
    casual: [
      "That's an interesting point! I love exploring new AI applications and use cases.",
      "Great to hear that! I'm always excited when people discover the power of AI tools.",
      "Absolutely! That's the kind of enthusiasm that drives innovation in AI."
    ],
    frustration: [
      "I understand that can be frustrating! 😔 Let's tackle this step by step.",
      "I know how challenging AI can be sometimes. Let's work through this together!",
      "Don't worry, we'll figure this out! I've helped many people through similar challenges."
    ]
  },
  knowledgeBase: {
    topics: [
      'AI Agent Orchestration',
      'MCP Server Development',
      'AI SaaS Platform Architecture',
      'Voice Cloning Technology',
      'AI Content Creation',
      'Enterprise AI Integration',
      'No-Code AI Solutions',
      'AI Automation Workflows'
    ],
    examples: {
      'multi-agent': [
        'Building a customer service bot that coordinates with multiple AI agents',
        'Creating an AI system that manages content creation across different platforms',
        'Developing an enterprise solution that orchestrates data processing agents'
      ],
      'saas': [
        'Building a no-code AI platform for content creators',
        'Creating an AI-powered project management tool',
        'Developing a SaaS solution for AI workflow automation'
      ],
      'voice': [
        'Creating custom voice clones for brand consistency',
        'Building AI-powered audio content generation',
        'Developing voice-enabled AI assistants'
      ]
    },
    tools: {
      'content-creation': ['ChatGPT', 'Midjourney', 'RunwayML', 'Jasper', 'Copy.ai'],
      'video-editing': ['DaVinci Resolve', 'RunwayML', 'CapCut', 'Pika Labs'],
      'automation': ['Zapier', 'Make', 'n8n', 'Integromat'],
      'voice-audio': ['ElevenLabs', 'Descript', 'Murf.ai', 'Synthesia']
    }
  }
};

export const generateParthResponse = (
  userMessage: string,
  context: any,
  personality: ParthPersonalityConfig = parthPersonality
): { content: string; metadata: any } => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Analyze user intent and sentiment
  const intent = analyzeIntent(lowerMessage);
  const sentiment = analyzeSentiment(lowerMessage);
  
  // Generate contextual response
  let response = '';
  let metadata = {
    intent,
    confidence: 0.9,
    sentiment: 'positive',
    topics: extractTopics(lowerMessage),
    userEmotion: sentiment
  };

  switch (intent) {
    case 'greeting':
      response = personality.responsePatterns.greeting[
        Math.floor(Math.random() * personality.responsePatterns.greeting.length)
      ];
      break;
      
    case 'technical':
      const technicalIntro = personality.responsePatterns.technical[
        Math.floor(Math.random() * personality.responsePatterns.technical.length)
      ];
      
      let technicalContent = '';
      if (lowerMessage.includes('agent') || lowerMessage.includes('mcp')) {
        technicalContent = `
For multi-agent systems, I typically use MCP protocols for seamless communication between agents. This ensures reliable data flow and error handling.

Based on my experience with HOWPARTH projects, here's my recommended approach:
1. Start with a clear agent hierarchy
2. Implement MCP for inter-agent communication
3. Use fallback mechanisms for reliability
4. Monitor agent performance and optimize

Would you like me to show you a specific example or dive deeper into any of these aspects?`;
      } else if (lowerMessage.includes('saas') || lowerMessage.includes('platform')) {
        technicalContent = `
For SaaS development, I love using no-code platforms combined with AI automation. This approach can reduce development time by 70% while maintaining quality.

My typical SaaS architecture includes:
• No-code frontend (Webflow, Bubble)
• AI-powered backend services
• Automated workflows with Zapier
• AI content generation integration

I've built several successful SaaS platforms using this approach. Would you like to see a case study?`;
      } else if (lowerMessage.includes('voice') || lowerMessage.includes('audio')) {
        technicalContent = `
Voice cloning is fascinating! I've worked extensively with ElevenLabs and other voice synthesis tools. The key is having high-quality training data.

My voice AI workflow typically includes:
• High-quality audio recording (studio quality)
• Voice cloning with ElevenLabs
• Integration with AI content generation
• Real-time voice synthesis

I can help you set up a complete voice AI pipeline. What's your specific use case?`;
      } else {
        technicalContent = `
Based on my 3+ years of AI experience, here's what I'd recommend:

1. Start with a clear problem definition
2. Choose the right AI tools for your use case
3. Implement in phases with testing
4. Optimize based on results

I've helped many clients implement AI solutions successfully. What specific challenge are you facing?`;
      }
      
      response = technicalIntro + technicalContent;
      break;
      
    case 'consultation':
      const consultationIntro = personality.responsePatterns.consultation[
        Math.floor(Math.random() * personality.responsePatterns.consultation.length)
      ];
      
      response = consultationIntro + `

I offer personalized AI strategy sessions where we can:
• Analyze your specific use case
• Recommend the perfect AI tools for your needs
• Create a step-by-step implementation plan
• Set up automation workflows

Would you like to schedule a consultation? I can also share some immediate insights based on what you've shared.`;
      break;
      
    case 'frustration':
      const frustrationIntro = personality.responsePatterns.frustration[
        Math.floor(Math.random() * personality.responsePatterns.frustration.length)
      ];
      
      response = frustrationIntro + `

Let me understand the issue better:
• What exactly are you trying to accomplish?
• What tools or platforms are you using?
• What error messages are you seeing?

I've helped many people through similar challenges, and I'm confident we can find a solution together. Sometimes the issue is in the setup, sometimes it's in the approach - let's figure it out!`;
      break;
      
    default:
      const casualIntro = personality.responsePatterns.casual[
        Math.floor(Math.random() * personality.responsePatterns.casual.length)
      ];
      
      response = casualIntro + `

From my experience with 50+ AI tools, I've found that the best approach is often to start simple and iterate. What specific outcome are you looking to achieve? I can suggest some tools and strategies that might be perfect for your needs.

Also, if you're interested, I can share some case studies from my work with HOWPARTH projects - we've tackled some really interesting challenges!`;
  }

  return { content: response, metadata };
};

const analyzeIntent = (message: string): string => {
  const intents = {
    greeting: ['hi', 'hello', 'hey', 'how are you', 'good morning', 'good afternoon'],
    technical: ['how to', 'build', 'create', 'implement', 'integrate', 'develop', 'agent', 'mcp', 'saas'],
    consultation: ['help', 'advice', 'recommend', 'suggest', 'what should', 'consultation'],
    casual: ['thanks', 'cool', 'awesome', 'nice', 'good'],
    frustration: ['not working', 'error', 'problem', 'issue', 'stuck', 'confused']
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }
  
  return 'general';
};

const analyzeSentiment = (message: string): string => {
  const positiveWords = ['thanks', 'awesome', 'great', 'cool', 'love', 'excellent'];
  const negativeWords = ['error', 'problem', 'issue', 'stuck', 'confused', 'frustrated'];
  
  if (positiveWords.some(word => message.includes(word))) {
    return 'positive';
  } else if (negativeWords.some(word => message.includes(word))) {
    return 'negative';
  }
  
  return 'neutral';
};

const extractTopics = (message: string): string[] => {
  const topics = [];
  
  if (message.includes('agent') || message.includes('mcp')) topics.push('multi-agent');
  if (message.includes('saas') || message.includes('platform')) topics.push('saas');
  if (message.includes('voice') || message.includes('audio')) topics.push('voice-ai');
  if (message.includes('content') || message.includes('creation')) topics.push('content-creation');
  if (message.includes('automation') || message.includes('workflow')) topics.push('automation');
  
  return topics;
};

const ParthPersonality: React.FC = () => {
  return null; // This is a utility component, no UI needed
};

export default ParthPersonality;
