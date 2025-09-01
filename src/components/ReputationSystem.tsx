import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  Star, 
  Zap, 
  Lightbulb, 
  Users, 
  TrendingUp,
  Crown,
  Medal,
  Shield,
  Rocket
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  isEarned: boolean;
  progress?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
}

const ReputationSystem: React.FC = () => {
  const badges: Badge[] = [
    {
      id: '1',
      name: 'Prompt Master',
      description: 'Created 50+ high-quality prompts',
      icon: Zap,
      color: 'text-yellow-400',
      isEarned: true
    },
    {
      id: '2',
      name: 'AI Innovator',
      description: 'Shared 10+ innovative AI solutions',
      icon: Lightbulb,
      color: 'text-blue-400',
      isEarned: true
    },
    {
      id: '3',
      name: 'Community Helper',
      description: 'Helped 100+ community members',
      icon: Users,
      color: 'text-green-400',
      isEarned: true
    },
    {
      id: '4',
      name: 'Early Adopter',
      description: 'Joined during beta phase',
      icon: Rocket,
      color: 'text-purple-400',
      isEarned: true
    },
    {
      id: '5',
      name: 'Content Creator',
      description: 'Published 25+ discussions',
      icon: Crown,
      color: 'text-red-400',
      isEarned: false,
      progress: 15
    },
    {
      id: '6',
      name: 'Trending Star',
      description: 'Had 5+ trending discussions',
      icon: TrendingUp,
      color: 'text-orange-400',
      isEarned: false,
      progress: 2
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first discussion',
      points: 50,
      isCompleted: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: '2',
      name: 'Helpful Hand',
      description: 'Receive 10 helpful reactions',
      points: 100,
      isCompleted: true,
      progress: 10,
      maxProgress: 10
    },
    {
      id: '3',
      name: 'Discussion Master',
      description: 'Start 20 discussions',
      points: 200,
      isCompleted: false,
      progress: 12,
      maxProgress: 20
    },
    {
      id: '4',
      name: 'Community Pillar',
      description: 'Reach 1000 reputation points',
      points: 500,
      isCompleted: false,
      progress: 847,
      maxProgress: 1000
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', reputation: 2847, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { rank: 2, name: 'Emily Watson', reputation: 3421, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { rank: 3, name: 'Alex Rodriguez', reputation: 1956, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { rank: 4, name: 'Mike Johnson', reputation: 1847, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { rank: 5, name: 'David Wilson', reputation: 1654, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' }
  ];

  const currentUserReputation = 847;
  const nextLevelReputation = 1000;
  const progressPercentage = (currentUserReputation / nextLevelReputation) * 100;

  return (
    <div className="space-y-6">
      {/* Reputation Progress */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Your Reputation
        </h3>
        
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-white mb-2">{currentUserReputation}</div>
          <div className="text-sm text-gray-400">reputation points</div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Level 8</span>
            <span>Level 9 ({nextLevelReputation} points)</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
            />
          </div>
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-400">
            {nextLevelReputation - currentUserReputation} points to next level
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Badges
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                badge.isEarned
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <badge.icon className={`w-4 h-4 ${badge.color}`} />
                <span className={`text-sm font-semibold ${
                  badge.isEarned ? 'text-white' : 'text-gray-400'
                }`}>
                  {badge.name}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
              {!badge.isEarned && badge.progress && (
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-purple-500 h-1 rounded-full"
                    style={{ width: `${(badge.progress / 100) * 100}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Achievements
        </h3>
        
        <div className="space-y-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                achievement.isCompleted
                  ? 'bg-green-600/20 border-green-500/30'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {achievement.isCompleted ? (
                    <Medal className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Shield className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm font-semibold ${
                    achievement.isCompleted ? 'text-white' : 'text-gray-300'
                  }`}>
                    {achievement.name}
                  </span>
                </div>
                <span className="text-xs text-purple-400 font-medium">
                  +{achievement.points} pts
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Progress: {achievement.progress}/{achievement.maxProgress}</span>
                <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Top Contributors
        </h3>
        
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {user.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                      {user.rank}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-white truncate">{user.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>⭐ {user.reputation}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                #{user.rank}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReputationSystem;
