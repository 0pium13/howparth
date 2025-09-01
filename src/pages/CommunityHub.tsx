import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Search,
  Filter,
  Sparkles,
  Brain,
  Newspaper,
  HelpCircle,
  Crown
} from 'lucide-react';
import DiscussionThread from '../components/DiscussionThread';
import LiveActivity from '../components/LiveActivity';
import ExpertBadge from '../components/ExpertBadge';
import ReputationSystem from '../components/ReputationSystem';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
    badges: string[];
    isExpert: boolean;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  replies: number;
  views: number;
  likes: number;
  reactions: {
    mindBlown: number;
    helpful: number;
    innovative: number;
    needsWork: number;
  };
  isPinned: boolean;
  isTrending: boolean;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  reputation: number;
  badges: string[];
  isExpert: boolean;
  recentActivity: string;
  followers: number;
}

const CommunityHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [featuredMembers, setFeaturedMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setDiscussions([
        {
          id: '1',
          title: 'How I Built an AI-Powered Content Calendar That Increased Our Traffic by 300%',
          content: 'I recently implemented a custom AI solution that analyzes trending topics, competitor content, and audience behavior to automatically generate content calendars...',
          author: {
            id: '1',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            reputation: 2847,
            badges: ['Prompt Master', 'AI Innovator', 'Community Helper'],
            isExpert: true
          },
          category: 'Case Studies',
          tags: ['content-marketing', 'ai-automation', 'seo', 'traffic-growth'],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T14:20:00Z',
          replies: 23,
          views: 1247,
          likes: 89,
          reactions: {
            mindBlown: 45,
            helpful: 67,
            innovative: 34,
            needsWork: 2
          },
          isPinned: true,
          isTrending: true
        },
        {
          id: '2',
          title: 'The Ultimate Guide to Fine-tuning GPT-4 for Your Specific Use Case',
          content: 'After months of experimentation with different fine-tuning approaches, I\'ve compiled a comprehensive guide that covers everything from data preparation to deployment...',
          author: {
            id: '2',
            name: 'Alex Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            reputation: 1956,
            badges: ['AI Innovator', 'Early Adopter'],
            isExpert: true
          },
          category: 'AI Tools',
          tags: ['gpt-4', 'fine-tuning', 'machine-learning', 'tutorial'],
          createdAt: '2024-01-14T16:45:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
          replies: 41,
          views: 2156,
          likes: 156,
          reactions: {
            mindBlown: 89,
            helpful: 123,
            innovative: 67,
            needsWork: 8
          },
          isPinned: false,
          isTrending: true
        },
        {
          id: '3',
          title: 'Breaking: OpenAI Releases New Multimodal Model - Here\'s What You Need to Know',
          content: 'OpenAI just announced their latest multimodal model that can process text, images, and audio simultaneously. This could revolutionize how we approach AI applications...',
          author: {
            id: '3',
            name: 'Emily Watson',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            reputation: 3421,
            badges: ['AI Innovator', 'Community Helper', 'Early Adopter'],
            isExpert: true
          },
          category: 'Industry News',
          tags: ['openai', 'multimodal', 'ai-news', 'breakthrough'],
          createdAt: '2024-01-15T08:20:00Z',
          updatedAt: '2024-01-15T08:20:00Z',
          replies: 67,
          views: 3891,
          likes: 234,
          reactions: {
            mindBlown: 167,
            helpful: 89,
            innovative: 123,
            needsWork: 12
          },
          isPinned: true,
          isTrending: true
        }
      ]);

      setFeaturedMembers([
        {
          id: '1',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          expertise: ['Content Marketing', 'AI Automation', 'SEO'],
          reputation: 2847,
          badges: ['Prompt Master', 'AI Innovator', 'Community Helper'],
          isExpert: true,
          recentActivity: 'Shared a case study about AI-powered content calendars',
          followers: 1247
        },
        {
          id: '2',
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          expertise: ['Machine Learning', 'GPT-4', 'Fine-tuning'],
          reputation: 1956,
          badges: ['AI Innovator', 'Early Adopter'],
          isExpert: true,
          recentActivity: 'Published comprehensive GPT-4 fine-tuning guide',
          followers: 892
        },
        {
          id: '3',
          name: 'Emily Watson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          expertise: ['AI Research', 'Multimodal AI', 'Industry Analysis'],
          reputation: 3421,
          badges: ['AI Innovator', 'Community Helper', 'Early Adopter'],
          isExpert: true,
          recentActivity: 'Breaking news about OpenAI\'s new multimodal model',
          followers: 2156
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const categories = [
    { id: 'all', name: 'All Discussions', icon: MessageCircle, color: 'text-blue-400' },
    { id: 'ai-tools', name: 'AI Tools', icon: Brain, color: 'text-purple-400' },
    { id: 'prompts', name: 'Prompts', icon: Sparkles, color: 'text-yellow-400' },
    { id: 'case-studies', name: 'Case Studies', icon: Crown, color: 'text-green-400' },
    { id: 'industry-news', name: 'Industry News', icon: Newspaper, color: 'text-red-400' },
    { id: 'beginner-help', name: 'Beginner Help', icon: HelpCircle, color: 'text-cyan-400' }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesCategory = activeCategory === 'all' || discussion.category.toLowerCase().replace(' ', '-') === activeCategory;
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return (b.reactions.mindBlown + b.reactions.helpful + b.reactions.innovative) - 
               (a.reactions.mindBlown + a.reactions.helpful + a.reactions.innovative);
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popular':
        return b.views - a.views;
      case 'replies':
        return b.replies - a.replies;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI Community Hub
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Connect, learn, and collaborate with AI enthusiasts worldwide. Share insights, discover new tools, and build the future of AI together.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search discussions, topics, or members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="trending">Trending</option>
                <option value="recent">Recent</option>
                <option value="popular">Popular</option>
                <option value="replies">Most Replies</option>
              </select>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Category Tiles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
                    activeCategory === category.id
                      ? 'bg-purple-600/20 border-purple-500/50 text-purple-400'
                      : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <category.icon className={`w-8 h-8 mb-3 ${category.color}`} />
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                </motion.button>
              ))}
            </motion.div>

            {/* Discussions List */}
            <div className="space-y-6">
              {sortedDiscussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <DiscussionThread discussion={discussion} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Featured Members */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Featured Members
              </h3>
              <div className="space-y-4">
                {featuredMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors duration-200">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{member.name}</h4>
                        {member.isExpert && <ExpertBadge />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>⭐ {member.reputation}</span>
                        <span>•</span>
                        <span>{member.followers} followers</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Live Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LiveActivity />
            </motion.div>

            {/* Reputation System */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <ReputationSystem />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
