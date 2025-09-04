// Community service for fetching AI community data
export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  upvotes: number;
  comments: number;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  trending: boolean;
  hot: boolean;
  type: 'discussion' | 'prompt' | 'tutorial' | 'showcase';
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  reactions: {
    likes: number;
    dislikes: number;
    fire: number;
    lightning: number;
  };
  userReaction?: 'like' | 'dislike' | 'fire' | 'lightning' | null;
  saved?: boolean;
  views: number;
  created_utc: number;
}

export interface TrendingTopic {
  topic: string;
  mentions: number;
  sentiment: number;
  trend: 'up' | 'down' | 'stable';
  subreddits: string[];
}

export interface CommunityAnalytics {
  totalPosts: number;
  totalComments: number;
  trendingTopics: number;
  activeSubreddits: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

class CommunityService {
  private baseUrl: string;

  constructor() {
    // Use Vercel API route in production, local API in development
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '/api' 
      : 'http://localhost:3001/api';
  }

  async fetchDiscussions(params: {
    limit?: number;
    subreddit?: string;
    type?: string;
    trending?: boolean;
    hot?: boolean;
  } = {}): Promise<{ discussions: Discussion[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.subreddit) queryParams.append('subreddit', params.subreddit);
      if (params.type) queryParams.append('type', params.type);
      if (params.trending) queryParams.append('trending', 'true');
      if (params.hot) queryParams.append('hot', 'true');
      
      const response = await fetch(`${this.baseUrl}/community?type=discussions&${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching discussions:', error);
      // Return mock data as fallback
      return this.getMockDiscussions(params);
    }
  }

  async fetchTrendingTopics(): Promise<TrendingTopic[]> {
    try {
      const response = await fetch(`${this.baseUrl}/community?type=trending`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.topics;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return this.getMockTrendingTopics();
    }
  }

  async fetchAnalytics(): Promise<CommunityAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/community?type=analytics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return this.getMockAnalytics();
    }
  }

  async submitReaction(discussionId: string, reaction: 'like' | 'dislike' | 'fire' | 'lightning'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reaction',
          discussionId,
          data: { reaction }
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error submitting reaction:', error);
      return false;
    }
  }

  async saveDiscussion(discussionId: string, saved: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          discussionId,
          data: { saved }
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error saving discussion:', error);
      return false;
    }
  }

  async shareDiscussion(discussionId: string, platform: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'share',
          discussionId,
          data: { platform }
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error sharing discussion:', error);
      return false;
    }
  }

  // Mock data fallbacks
  private getMockDiscussions(params: any = {}): { discussions: Discussion[]; total: number } {
    const mockDiscussions: Discussion[] = [
      {
        id: '1',
        title: 'Revolutionary ChatGPT Prompt Engineering Techniques',
        content: 'I discovered these amazing prompt engineering techniques that have completely transformed how I use ChatGPT...',
        author: 'AIExplorer',
        subreddit: 'PromptEngineering',
        upvotes: 1247,
        comments: 89,
        timestamp: '2 hours ago',
        sentiment: 'positive',
        tags: ['prompt-engineering', 'chatgpt', 'tutorial'],
        trending: true,
        hot: true,
        type: 'tutorial',
        reactions: { likes: 1247, dislikes: 23, fire: 156, lightning: 89 },
        views: 15420,
        created_utc: Math.floor(Date.now() / 1000) - 7200
      },
      {
        id: '2',
        title: 'Stable Diffusion 3.0: Mind-Blowing Results',
        content: 'Just tried the new Stable Diffusion 3.0 and the results are absolutely incredible...',
        author: 'ArtCreator',
        subreddit: 'StableDiffusion',
        upvotes: 892,
        comments: 67,
        timestamp: '4 hours ago',
        sentiment: 'positive',
        tags: ['stable-diffusion', 'ai-art', 'showcase'],
        trending: true,
        hot: false,
        type: 'showcase',
        media: {
          type: 'image',
          url: '/api/placeholder/800/600',
          thumbnail: '/api/placeholder/400/300'
        },
        reactions: { likes: 892, dislikes: 12, fire: 234, lightning: 67 },
        views: 9876,
        created_utc: Math.floor(Date.now() / 1000) - 14400
      }
    ];

    let filtered = mockDiscussions;
    
    if (params.subreddit) {
      filtered = filtered.filter(d => d.subreddit === params.subreddit);
    }
    
    if (params.type) {
      filtered = filtered.filter(d => d.type === params.type);
    }
    
    if (params.trending) {
      filtered = filtered.filter(d => d.trending);
    }
    
    if (params.hot) {
      filtered = filtered.filter(d => d.hot);
    }

    return {
      discussions: filtered.slice(0, params.limit || 50),
      total: filtered.length
    };
  }

  private getMockTrendingTopics(): TrendingTopic[] {
    return [
      { topic: 'GPT-5', mentions: 1247, sentiment: 0.8, trend: 'up', subreddits: ['OpenAI', 'ChatGPT', 'MachineLearning'] },
      { topic: 'Prompt Engineering', mentions: 892, sentiment: 0.9, trend: 'up', subreddits: ['PromptEngineering', 'ChatGPT'] },
      { topic: 'Stable Diffusion 3.0', mentions: 567, sentiment: 0.7, trend: 'up', subreddits: ['StableDiffusion', 'AIArt'] },
      { topic: 'AI Ethics', mentions: 445, sentiment: 0.3, trend: 'stable', subreddits: ['MachineLearning', 'artificial'] },
      { topic: 'Local LLM', mentions: 334, sentiment: 0.6, trend: 'down', subreddits: ['LocalLLaMA', 'MachineLearning'] }
    ];
  }

  private getMockAnalytics(): CommunityAnalytics {
    return {
      totalPosts: 5,
      totalComments: 513,
      trendingTopics: 5,
      activeSubreddits: 4,
      sentimentBreakdown: {
        positive: 3,
        neutral: 1,
        negative: 1
      }
    };
  }
}

export const communityService = new CommunityService();
