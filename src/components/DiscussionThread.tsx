import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  ThumbsUp,
  Zap,
  Lightbulb,
  AlertCircle,
  Clock,
  Tag,
  Pin,
  TrendingUp
} from 'lucide-react';
import ExpertBadge from './ExpertBadge';

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

interface DiscussionThreadProps {
  discussion: Discussion;
}

const DiscussionThread: React.FC<DiscussionThreadProps> = ({ discussion }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const totalReactions = discussion.reactions.mindBlown + discussion.reactions.helpful + 
                        discussion.reactions.innovative + discussion.reactions.needsWork;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={discussion.author.avatar}
            alt={discussion.author.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">{discussion.author.name}</h3>
              {discussion.author.isExpert && <ExpertBadge />}
              <span className="text-sm text-gray-400">⭐ {discussion.author.reputation}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatDate(discussion.createdAt)}</span>
              {discussion.updatedAt !== discussion.createdAt && (
                <>
                  <span>•</span>
                  <span>edited {formatDate(discussion.updatedAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {discussion.isPinned && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <Pin className="w-3 h-3" />
              <span>Pinned</span>
            </div>
          )}
          {discussion.isTrending && (
            <div className="flex items-center gap-1 text-purple-400 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </div>
          )}
          <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-3 text-white hover:text-purple-400 transition-colors duration-200 cursor-pointer">
          {discussion.title}
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          {discussion.content}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {discussion.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-500/30"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {discussion.views.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {discussion.replies}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {discussion.likes}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">
            {discussion.category}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isLiked 
                ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
                : 'hover:bg-gray-800 text-gray-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">Like</span>
          </button>

          {/* Reply Button */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors duration-200">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Reply</span>
          </button>

          {/* Reactions */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors duration-200"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">React</span>
            </button>
            
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg p-2 flex gap-2"
              >
                <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200" title="Mind Blown">
                  <Zap className="w-4 h-4 text-yellow-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200" title="Helpful">
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200" title="Innovative">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200" title="Needs Work">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isBookmarked 
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                : 'hover:bg-gray-800 text-gray-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors duration-200">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reaction Summary */}
      {totalReactions > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {discussion.reactions.mindBlown > 0 && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                {discussion.reactions.mindBlown}
              </span>
            )}
            {discussion.reactions.helpful > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 text-green-400" />
                {discussion.reactions.helpful}
              </span>
            )}
            {discussion.reactions.innovative > 0 && (
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-blue-400" />
                {discussion.reactions.innovative}
              </span>
            )}
            {discussion.reactions.needsWork > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-orange-400" />
                {discussion.reactions.needsWork}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DiscussionThread;
