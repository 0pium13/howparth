import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  MessageSquare, 
  Heart, 
  Star, 
  Zap, 
  Users, 
  TrendingUp,
  Clock
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'post' | 'reply' | 'like' | 'follow' | 'badge' | 'trending';
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  isNew: boolean;
}

const LiveActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Mock live activity data
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'post',
        user: {
          name: 'Alex Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        action: 'started a new discussion',
        target: 'Advanced GPT-4 Fine-tuning Techniques',
        timestamp: '2m ago',
        isNew: true
      },
      {
        id: '2',
        type: 'badge',
        user: {
          name: 'Sarah Kim',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        action: 'earned the AI Innovator badge',
        timestamp: '5m ago',
        isNew: true
      },
      {
        id: '3',
        type: 'trending',
        user: {
          name: 'Mike Johnson',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        action: 'discussion is now trending',
        target: 'OpenAI\'s Latest Multimodal Model',
        timestamp: '8m ago',
        isNew: false
      },
      {
        id: '4',
        type: 'reply',
        user: {
          name: 'Emily Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        action: 'replied to',
        target: 'Content Calendar AI Solution',
        timestamp: '12m ago',
        isNew: false
      },
      {
        id: '5',
        type: 'like',
        user: {
          name: 'David Wilson',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        },
        action: 'liked your discussion',
        target: 'GPT-4 Fine-tuning Guide',
        timestamp: '15m ago',
        isNew: false
      }
    ];

    setActivities(mockActivities);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: 'post',
        user: {
          name: 'New User',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
        },
        action: 'joined the community',
        timestamp: 'Just now',
        isNew: true
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
    }, 30000); // Add new activity every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-green-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'follow':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'badge':
        return <Star className="w-4 h-4 text-yellow-400" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-green-400" />
        Live Activity
      </h3>
      
      <div className="space-y-3">
        <AnimatePresence>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                activity.isNew 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="relative">
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                {activity.isNew && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <span className="font-semibold text-sm text-white">
                    {activity.user.name}
                  </span>
                  <span className="text-sm text-gray-400">
                    {activity.action}
                  </span>
                  {activity.target && (
                    <span className="text-sm text-purple-400 font-medium truncate">
                      "{activity.target}"
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{activity.timestamp}</span>
                  {activity.isNew && (
                    <span className="text-green-400 font-medium">NEW</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Live updates every 30s</span>
          </span>
          <button className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
            View All
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveActivity;
