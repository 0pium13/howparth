import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiscussionModal from '../components/DiscussionModal';
import { communityService, Discussion, TrendingTopic } from '../services/communityService';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  MessageCircle, 
  Share2, 
  Copy, 
  Clock, 
  Zap, 
  Star,
  Volume2,
  ThumbsUp,
  Flame,
  Eye,
  Bookmark
} from 'lucide-react';

// Types are now imported from communityService

const CommunityHub: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceSearch, setVoiceSearch] = useState(false);
  const [discoveryScore] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load more discussions function
  const loadMoreDiscussions = useCallback(async () => {
    try {
      const moreData = await communityService.fetchDiscussions({ 
        limit: 20
      });
      setDiscussions(prev => [...prev, ...moreData.discussions]);
    } catch (error) {
      console.error('Error loading more discussions:', error);
    }
  }, []);

  // Mock data - in real app, this would come from your scraper API
  const mockDiscussions: Discussion[] = useMemo(() => [
        {
          id: '1',
      title: 'Revolutionary ChatGPT Prompt Engineering Techniques',
      content: 'I discovered these amazing prompt engineering techniques that have completely transformed how I use ChatGPT. The key is understanding the structure and being specific about the output format...',
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
      content: 'Just tried the new Stable Diffusion 3.0 and the results are absolutely incredible. The image quality and detail are on another level...',
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
        },
        {
          id: '3',
      title: 'OpenAI GPT-5 Rumors: What We Know So Far',
      content: 'There are some interesting rumors circulating about GPT-5. While nothing is confirmed, here\'s what the community has pieced together...',
      author: 'TechWatcher',
      subreddit: 'OpenAI',
      upvotes: 2156,
      comments: 234,
      timestamp: '6 hours ago',
      sentiment: 'neutral',
      tags: ['openai', 'gpt-5', 'discussion'],
      trending: true,
      hot: true,
      type: 'discussion',
      reactions: { likes: 2156, dislikes: 45, fire: 567, lightning: 234 },
      views: 23456,
      created_utc: Math.floor(Date.now() / 1000) - 21600
    }
  ], []);

  const mockTrendingTopics: TrendingTopic[] = useMemo(() => [
    { topic: 'GPT-5', mentions: 1247, sentiment: 0.8, trend: 'up', subreddits: ['OpenAI', 'ChatGPT', 'MachineLearning'] },
    { topic: 'Prompt Engineering', mentions: 892, sentiment: 0.9, trend: 'up', subreddits: ['PromptEngineering', 'ChatGPT'] },
    { topic: 'Stable Diffusion 3.0', mentions: 567, sentiment: 0.7, trend: 'up', subreddits: ['StableDiffusion', 'AIArt'] },
    { topic: 'AI Ethics', mentions: 445, sentiment: 0.3, trend: 'stable', subreddits: ['MachineLearning', 'artificial'] },
    { topic: 'Local LLM', mentions: 334, sentiment: 0.6, trend: 'down', subreddits: ['LocalLLaMA', 'MachineLearning'] }
  ], []);

  useEffect(() => {
    // Load data from API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [discussionsData, trendingData] = await Promise.all([
          communityService.fetchDiscussions({ limit: 50 }),
          communityService.fetchTrendingTopics()
        ]);
        
        setDiscussions(discussionsData.discussions);
        setTrendingTopics(trendingData);
      } catch (error) {
        console.error('Error loading community data:', error);
        // Fallback to mock data
        setDiscussions(mockDiscussions);
        setTrendingTopics(mockTrendingTopics);
      }
      setIsLoading(false);
    };

    loadData();
  }, [mockDiscussions, mockTrendingTopics]);

  // Infinite scroll setup
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreDiscussions();
        }
      },
      { threshold: 0.1 }
    );

    if (scrollRef.current) {
      observerRef.current.observe(scrollRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, loadMoreDiscussions]);

  const handleReaction = async (discussionId: string, reaction: 'like' | 'dislike' | 'fire' | 'lightning') => {
    // Optimistic update
    setDiscussions(prev => prev.map(discussion => {
      if (discussion.id === discussionId) {
        const newReactions = { ...discussion.reactions };
        const currentReaction = discussion.userReaction;
        
        // Remove previous reaction
        if (currentReaction && currentReaction !== reaction) {
          newReactions[currentReaction === 'like' ? 'likes' : currentReaction === 'dislike' ? 'dislikes' : currentReaction]--;
        }
        
        // Add new reaction
        if (currentReaction === reaction) {
          // Remove reaction if clicking same
          newReactions[reaction === 'like' ? 'likes' : reaction === 'dislike' ? 'dislikes' : reaction]--;
          return { ...discussion, reactions: newReactions, userReaction: null };
        } else {
          newReactions[reaction === 'like' ? 'likes' : reaction === 'dislike' ? 'dislikes' : reaction]++;
          return { ...discussion, reactions: newReactions, userReaction: reaction };
        }
      }
      return discussion;
    }));

    // Send to API
    try {
      await communityService.submitReaction(discussionId, reaction);
    } catch (error) {
      console.error('Error submitting reaction:', error);
      // Could revert optimistic update here
    }
  };

  const handleSave = async (discussionId: string) => {
    // Optimistic update
    setDiscussions(prev => prev.map(discussion => 
      discussion.id === discussionId 
        ? { ...discussion, saved: !discussion.saved }
        : discussion
    ));

    // Send to API
    try {
      const discussion = discussions.find(d => d.id === discussionId);
      if (discussion) {
        await communityService.saveDiscussion(discussionId, !discussion.saved);
      }
    } catch (error) {
      console.error('Error saving discussion:', error);
    }
  };

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    setNotifications(prev => [...prev, 'Prompt copied to clipboard!']);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);
  };

  const handleShare = (discussion: Discussion) => {
    const shareData = {
      title: discussion.title,
      text: discussion.content,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).then(() => {
        // Send share event to API
        communityService.shareDiscussion(discussion.id, 'native');
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      navigator.clipboard.writeText(`${discussion.title}\n\n${discussion.content}`);
      setNotifications(prev => [...prev, 'Discussion link copied!']);
      setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);
      
      // Send share event to API
      communityService.shareDiscussion(discussion.id, 'clipboard');
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         discussion.type === selectedFilter ||
                         (selectedFilter === 'trending' && discussion.trending) ||
                         (selectedFilter === 'hot' && discussion.hot);
    
    return matchesSearch && matchesFilter;
  });


  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

    return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">AI Community Hub</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300 font-medium">Live</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white font-medium">Discovery Score: {discoveryScore}</span>
              </div>
              
              <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
                className="p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                {viewMode === 'cards' ? <MessageCircle className="w-5 h-5 text-white" /> : <Zap className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                  type="text"
                  placeholder="Search discussions, prompts, topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                />
                <button
                  onClick={() => setVoiceSearch(!voiceSearch)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded"
                >
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Flame className="w-6 h-6 text-orange-400" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setSearchTerm(topic.topic)}
                  >
                    <div className="flex items-center gap-2">
                      {getTrendIcon(topic.trend)}
                      <span className="text-white text-sm font-medium">#{topic.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{topic.mentions}</span>
                      <div className={`w-2 h-2 rounded-full ${topic.sentiment > 0.5 ? 'bg-green-400' : topic.sentiment < -0.5 ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Filter className="w-6 h-6 text-blue-400" />
                Filters
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'All Discussions', count: discussions.length },
                  { id: 'trending', label: 'Trending', count: discussions.filter(d => d.trending).length },
                  { id: 'hot', label: 'Hot', count: discussions.filter(d => d.hot).length },
                  { id: 'prompt', label: 'Prompts', count: discussions.filter(d => d.type === 'prompt').length },
                  { id: 'tutorial', label: 'Tutorials', count: discussions.filter(d => d.type === 'tutorial').length },
                  { id: 'showcase', label: 'Showcases', count: discussions.filter(d => d.type === 'showcase').length }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                      selectedFilter === filter.id 
                        ? 'bg-white/10 text-white border border-white/20' 
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <span className="text-sm">{filter.label}</span>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{filter.count}</span>
              </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-white/10 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredDiscussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedDiscussion(discussion)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">{discussion.title}</h3>
                            {discussion.trending && <Flame className="w-4 h-4 text-orange-400" />}
                            {discussion.hot && <Zap className="w-4 h-4 text-yellow-400" />}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <span>u/{discussion.author}</span>
                            <span>r/{discussion.subreddit}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {discussion.timestamp}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {discussion.views.toLocaleString()}
                            </span>
            </div>
          </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            discussion.type === 'tutorial' ? 'bg-blue-500/20 text-blue-300' :
                            discussion.type === 'prompt' ? 'bg-green-500/20 text-green-300' :
                            discussion.type === 'showcase' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {discussion.type}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-3">{discussion.content}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReaction(discussion.id, 'like');
                              }}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                                discussion.userReaction === 'like' 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              {discussion.reactions.likes}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReaction(discussion.id, 'fire');
                              }}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                                discussion.userReaction === 'fire' 
                                  ? 'bg-orange-500/20 text-orange-300' 
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              <Flame className="w-4 h-4" />
                              {discussion.reactions.fire}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReaction(discussion.id, 'lightning');
                              }}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                                discussion.userReaction === 'lightning' 
                                  ? 'bg-yellow-500/20 text-yellow-300' 
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              <Zap className="w-4 h-4" />
                              {discussion.reactions.lightning}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-400">
                            <MessageCircle className="w-4 h-4" />
                            {discussion.comments}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(discussion.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              discussion.saved 
                                ? 'bg-yellow-500/20 text-yellow-300' 
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(discussion);
                            }}
                            className="p-2 bg-white/10 text-gray-400 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          
                          {discussion.type === 'prompt' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPrompt(discussion.content);
                              }}
                              className="p-2 bg-white/10 text-gray-400 hover:bg-white/20 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                ))}
                </AnimatePresence>
                
                <div ref={scrollRef} className="h-10"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discussion Modal */}
      <DiscussionModal
        discussion={selectedDiscussion}
        onClose={() => setSelectedDiscussion(null)}
        onReaction={handleReaction}
        onSave={handleSave}
        onShare={handleShare}
        onCopyPrompt={handleCopyPrompt}
      />

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            {notification}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CommunityHub;