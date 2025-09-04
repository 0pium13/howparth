import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Discussion } from '../services/communityService';
import { 
  X, 
  Share2, 
  Copy, 
  Bookmark, 
  MessageCircle, 
  ThumbsUp, 
  Flame, 
  Zap,
  Eye,
  Clock,
  Maximize
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  upvotes: number;
  replies: Comment[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface DiscussionModalProps {
  discussion: Discussion | null;
  onClose: () => void;
  onReaction: (discussionId: string, reaction: 'like' | 'dislike' | 'fire' | 'lightning') => void;
  onSave: (discussionId: string) => void;
  onShare: (discussion: Discussion) => void;
  onCopyPrompt: (content: string) => void;
}

const DiscussionModal: React.FC<DiscussionModalProps> = ({
  discussion,
  onClose,
  onReaction,
  onSave,
  onShare,
  onCopyPrompt
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Mock comments data
  const mockComments: Comment[] = useMemo(() => [
    {
      id: '1',
      author: 'AIEnthusiast',
      content: 'This is exactly what I was looking for! The prompt engineering techniques you shared are game-changing. I\'ve already tried a few and the results are incredible.',
      timestamp: '1 hour ago',
      upvotes: 45,
      replies: [
        {
          id: '1-1',
          author: 'PromptMaster',
          content: 'I agree! The structured approach really makes a difference. Have you tried combining these with the chain-of-thought method?',
          timestamp: '45 minutes ago',
          upvotes: 12,
          replies: [],
          sentiment: 'positive'
        }
      ],
      sentiment: 'positive'
    },
    {
      id: '2',
      author: 'TechExplorer',
      content: 'Great tutorial! One question though - how do you handle edge cases where the AI doesn\'t follow the prompt structure?',
      timestamp: '2 hours ago',
      upvotes: 23,
      replies: [],
      sentiment: 'neutral'
    },
    {
      id: '3',
      author: 'AICritic',
      content: 'While the techniques are good, I think the examples could be more diverse. Most of them seem focused on creative writing prompts.',
      timestamp: '3 hours ago',
      upvotes: 8,
      replies: [],
      sentiment: 'negative'
    }
  ], []);

  useEffect(() => {
    if (discussion) {
      setComments(mockComments);
    }
  }, [discussion, mockComments]);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'You',
        content: newComment,
        timestamp: 'now',
        upvotes: 0,
        replies: [],
        sentiment: 'neutral'
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!discussion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", damping: 20 }}
          className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">{discussion.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
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
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                discussion.type === 'tutorial' ? 'bg-blue-500/20 text-blue-300' :
                discussion.type === 'prompt' ? 'bg-green-500/20 text-green-300' :
                discussion.type === 'showcase' ? 'bg-purple-500/20 text-purple-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {discussion.type}
              </span>
              
              {discussion.trending && <Flame className="w-5 h-5 text-orange-400" />}
              {discussion.hot && <Zap className="w-5 h-5 text-yellow-400" />}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Media */}
            {discussion.media && (
              <div className="mb-6">
                {discussion.media.type === 'image' ? (
                  <div className="relative group">
                    <img
                      src={discussion.media.url}
                      alt="Discussion media"
                      className="w-full rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Maximize className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      className="w-full rounded-lg"
                      controls
                      poster={discussion.media.thumbnail}
                    >
                      <source src={discussion.media.url} type="video/mp4" />
                    </video>
                  </div>
                )}
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {discussion.content}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {discussion.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/10 text-white text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onReaction(discussion.id, 'like')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    discussion.userReaction === 'like' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {discussion.reactions.likes}
                </button>
                
                <button
                  onClick={() => onReaction(discussion.id, 'fire')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    discussion.userReaction === 'fire' 
                      ? 'bg-orange-500/20 text-orange-300' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  {discussion.reactions.fire}
                </button>
                
                <button
                  onClick={() => onReaction(discussion.id, 'lightning')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    discussion.userReaction === 'lightning' 
                      ? 'bg-yellow-500/20 text-yellow-300' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  {discussion.reactions.lightning}
                </button>
                
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-400 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {discussion.comments}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSave(discussion.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    discussion.saved 
                      ? 'bg-yellow-500/20 text-yellow-300' 
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => onShare(discussion)}
                  className="p-2 bg-white/10 text-gray-400 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                
                {discussion.type === 'prompt' && (
                  <button
                    onClick={() => onCopyPrompt(discussion.content)}
                    className="p-2 bg-white/10 text-gray-400 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="border-t border-white/10 max-h-[40vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
                
                {/* Add Comment */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                    />
                    <button
                      onClick={handleSubmitComment}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>
                
                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-white">u/{comment.author}</span>
                        <span className="text-sm text-gray-400">{comment.timestamp}</span>
                        <div className={`w-2 h-2 rounded-full ${getSentimentColor(comment.sentiment).replace('text-', 'bg-')}`}></div>
                      </div>
                      <p className="text-gray-300 mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          {comment.upvotes}
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors text-sm">
                          Reply
                        </button>
                      </div>
                      
                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-white text-sm">u/{reply.author}</span>
                                <span className="text-xs text-gray-400">{reply.timestamp}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${getSentimentColor(reply.sentiment).replace('text-', 'bg-')}`}></div>
                              </div>
                              <p className="text-gray-300 text-sm">{reply.content}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs">
                                  <ThumbsUp className="w-3 h-3" />
                                  {reply.upvotes}
                                </button>
                                <button className="text-gray-400 hover:text-white transition-colors text-xs">
                                  Reply
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiscussionModal;
