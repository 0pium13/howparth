// Enhanced Chat System Types

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  preferences: UserPreferences;
  personality: PersonalitySettings;
  industry: string;
  expertise: string[];
  projectHistory: ProjectHistory[];
  conversationHistory: ConversationSummary[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  tone: 'formal' | 'casual' | 'professional' | 'friendly';
  formality: 'low' | 'medium' | 'high';
  humor: 'none' | 'subtle' | 'moderate' | 'high';
  responseLength: 'concise' | 'detailed' | 'comprehensive';
  language: string;
  timezone: string;
  notificationSettings: NotificationSettings;
}

export interface PersonalitySettings {
  communicationStyle: 'direct' | 'empathetic' | 'analytical' | 'creative';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  decisionMaking: 'quick' | 'thorough' | 'collaborative';
  riskTolerance: 'low' | 'medium' | 'high';
}

export interface ProjectHistory {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate: Date;
  endDate?: Date;
  challenges: string[];
  solutions: string[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  topics: string[];
  keyInsights: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  duration: number;
  createdAt: Date;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: { start: string; end: string };
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType: 'text' | 'image' | 'code' | 'file' | 'voice';
  attachments: Attachment[];
  metadata: MessageMetadata;
  context: ContextSource[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  timestamp: Date;
  isStreaming?: boolean;
  streamChunks?: string[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'code' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
  extractedText?: string;
  analysis?: AttachmentAnalysis;
}

export interface AttachmentAnalysis {
  type: 'ocr' | 'code-parsing' | 'document-summary' | 'image-description';
  content: string;
  confidence: number;
  metadata: Record<string, any>;
}

export interface MessageMetadata {
  userAgent: string;
  ip: string;
  location?: string;
  device: string;
  sessionId: string;
  responseTime: number;
  modelUsed: string;
  tokensUsed: number;
  cost: number;
}

export interface ContextSource {
  id: string;
  type: 'document' | 'conversation' | 'knowledge-base' | 'web-search';
  title: string;
  url?: string;
  relevance: number;
  excerpt: string;
  tags: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  type: 'general' | 'project' | 'consultation' | 'collaboration';
  participants: Participant[];
  messages: Message[];
  metadata: ConversationMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

export interface Participant {
  id: string;
  username: string;
  role: 'owner' | 'participant' | 'observer';
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  cursor?: CursorPosition;
  isTyping: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  timestamp: Date;
}

export interface ConversationMetadata {
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimatedDuration: number;
  actualDuration: number;
  satisfaction: number;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface ChatSettings {
  streaming: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  showContext: boolean;
  showSentiment: boolean;
  theme: 'dark' | 'light' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

export interface ProactiveSuggestion {
  id: string;
  type: 'follow-up' | 'reminder' | 'recommendation' | 'insight';
  title: string;
  content: string;
  relevance: number;
  action?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AIRecommendation {
  id: string;
  type: 'tool' | 'workflow' | 'resource' | 'strategy';
  title: string;
  description: string;
  category: string;
  relevance: number;
  confidence: number;
  cost?: number;
  timeToImplement?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  url?: string;
  alternatives?: string[];
}

export interface ChatAnalytics {
  totalMessages: number;
  averageResponseTime: number;
  userSatisfaction: number;
  topTopics: string[];
  peakUsageHours: number[];
  abandonedConversations: number;
  successfulResolutions: number;
  sentimentTrend: 'improving' | 'stable' | 'declining';
}

export interface MemoryVector {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    type: 'conversation' | 'preference' | 'project' | 'insight';
    userId: string;
    timestamp: Date;
    tags: string[];
    relevance: number;
  };
}

export interface StreamResponse {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  messageId?: string;
  error?: string;
  metadata?: Partial<MessageMetadata>;
}

export interface CollaborationSession {
  id: string;
  conversationId: string;
  participants: Participant[];
  cursors: Map<string, CursorPosition>;
  typingIndicators: Map<string, boolean>;
  sharedFiles: Attachment[];
  sessionStart: Date;
  isActive: boolean;
}

export interface ExportOptions {
  format: 'pdf' | 'markdown' | 'json' | 'txt';
  includeMetadata: boolean;
  includeAttachments: boolean;
  includeAnalytics: boolean;
  dateRange?: { start: Date; end: Date };
}

export interface WebhookEvent {
  type: 'message_sent' | 'conversation_started' | 'conversation_ended' | 'user_joined' | 'user_left';
  conversationId: string;
  userId: string;
  timestamp: Date;
  data: Record<string, any>;
}
