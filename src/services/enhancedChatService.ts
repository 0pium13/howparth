import { 
  Message, 
  UserProfile, 
  ProactiveSuggestion, 
  AIRecommendation, 
  StreamResponse, 
  MemoryVector,
  Attachment,
  ChatAnalytics,
  ExportOptions,
  WebhookEvent
} from '../types/chat';

// Enhanced Chat Service with ChatGPT-5 level features
class EnhancedChatService {
  private baseUrl: string;
  private userProfile: UserProfile | null = null;
  private memoryVectors: MemoryVector[] = [];
  private activeStreams: Map<string, ReadableStreamDefaultReader> = new Map();
  private webhookCallbacks: Map<string, (event: WebhookEvent) => void> = new Map();

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'https://api.howparth.com/api';
  }

  // 1. Deep User Profiling & Memory
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      this.userProfile = profile;
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/profile/${userId}/preferences`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to update user preferences');
      }

      // Update local profile
      if (this.userProfile) {
        this.userProfile.preferences = { ...this.userProfile.preferences, ...preferences };
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async storeMemoryVector(vector: Omit<MemoryVector, 'id'>): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/memory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vector)
      });

      if (!response.ok) {
        throw new Error('Failed to store memory vector');
      }

      const result = await response.json();
      this.memoryVectors.push({ ...vector, id: result.id });
      return result.id;
    } catch (error) {
      console.error('Error storing memory vector:', error);
      throw error;
    }
  }

  async retrieveRelevantMemories(query: string, limit: number = 5): Promise<MemoryVector[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/memory/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, limit })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve memories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }

  // 2. Proactive & Contextual Engagement
  async getProactiveSuggestions(userId: string): Promise<ProactiveSuggestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/suggestions/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proactive suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching proactive suggestions:', error);
      return [];
    }
  }

  async getAIRecommendations(userId: string, context: string): Promise<AIRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, context })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      return [];
    }
  }

  // 3. Streaming LLM Calls with Partial Response Rendering
  async sendMessageStream(
    conversationId: string, 
    content: string, 
    attachments: Attachment[] = [],
    onChunk: (chunk: string) => void,
    onComplete: (message: Message) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/message/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          content,
          attachments,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      this.activeStreams.set(conversationId, reader);

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamResponse = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'chunk':
                  if (data.content) {
                    onChunk(data.content);
                  }
                  break;
                case 'complete':
                  if (data.messageId) {
                    // Fetch complete message
                    const message = await this.getMessage(data.messageId);
                    onComplete(message);
                  }
                  break;
                case 'error':
                  onError(data.error || 'Unknown error');
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }

      this.activeStreams.delete(conversationId);
    } catch (error) {
      console.error('Error in message stream:', error);
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async interruptStream(conversationId: string): Promise<void> {
    const reader = this.activeStreams.get(conversationId);
    if (reader) {
      await reader.cancel();
      this.activeStreams.delete(conversationId);
    }
  }

  // 4. Multimodal Input & Output
  async uploadAttachment(file: File): Promise<Attachment> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/chat/attachments/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload attachment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  async analyzeAttachment(attachmentId: string): Promise<Attachment> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/attachments/${attachmentId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to analyze attachment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing attachment:', error);
      throw error;
    }
  }

  async extractTextFromDocument(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${this.baseUrl}/chat/documents/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from document');
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Error extracting text from document:', error);
      throw error;
    }
  }

  // 5. Real-Time Collaboration & Sharing
  async joinCollaborationSession(sessionId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/collaboration/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to join collaboration session');
      }
    } catch (error) {
      console.error('Error joining collaboration session:', error);
      throw error;
    }
  }

  async updateCursorPosition(sessionId: string, userId: string, position: { x: number; y: number }): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/chat/collaboration/${sessionId}/cursor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, position })
      });
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  }

  async exportConversation(conversationId: string, options: ExportOptions): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/conversations/${conversationId}/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error('Failed to export conversation');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting conversation:', error);
      throw error;
    }
  }

  // 6. Analytics & Insights
  async getChatAnalytics(userId: string, dateRange?: { start: Date; end: Date }): Promise<ChatAnalytics> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('start', dateRange.start.toISOString());
        params.append('end', dateRange.end.toISOString());
      }

      const response = await fetch(`${this.baseUrl}/chat/analytics/${userId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat analytics:', error);
      throw error;
    }
  }

  async rateResponse(messageId: string, rating: number, feedback?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/messages/${messageId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, feedback })
      });

      if (!response.ok) {
        throw new Error('Failed to rate response');
      }
    } catch (error) {
      console.error('Error rating response:', error);
      throw error;
    }
  }

  // 7. Security & Privacy
  async deleteConversation(conversationId: string, permanent: boolean = false): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permanent })
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async forgetChat(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/conversations/${conversationId}/forget`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to forget chat');
      }
    } catch (error) {
      console.error('Error forgetting chat:', error);
      throw error;
    }
  }

  // 8. Integration & Extensibility
  registerWebhook(eventType: string, callback: (event: WebhookEvent) => void): string {
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.webhookCallbacks.set(webhookId, callback);
    return webhookId;
  }

  unregisterWebhook(webhookId: string): void {
    this.webhookCallbacks.delete(webhookId);
  }

  // 9. Fallback & Reliability
  async sendMessageWithFallback(
    conversationId: string,
    content: string,
    attachments: Attachment[] = []
  ): Promise<Message> {
    try {
      return await this.sendMessage(conversationId, content, attachments);
    } catch (error) {
      console.warn('Primary model failed, trying fallback:', error);
      
      // Try fallback model
      try {
        return await this.sendMessageWithModel(conversationId, content, attachments, 'gpt-4-turbo');
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError);
        throw new Error('All AI models are currently unavailable. Please try again later.');
      }
    }
  }

  // Helper methods
  private async sendMessage(conversationId: string, content: string, attachments: Attachment[] = []): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId,
        content,
        attachments
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  }

  private async sendMessageWithModel(
    conversationId: string, 
    content: string, 
    attachments: Attachment[] = [], 
    model: string
  ): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversationId,
        content,
        attachments,
        model
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  }

  private async getMessage(messageId: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/chat/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }

    return await response.json();
  }

  private getAuthToken(): string {
    return localStorage.getItem('howparth_session_token') || '';
  }
}

export const enhancedChatService = new EnhancedChatService();
export default enhancedChatService;
