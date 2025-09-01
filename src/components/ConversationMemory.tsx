import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Star,
  Users,
  Calendar,
  FileText,
  Zap,
  Lightbulb,
  Award
} from 'lucide-react';

interface UserProfile {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  previousProjects: string[];
  preferredTools: string[];
  learningProgress: {
    topics: Record<string, number>;
    tools: Record<string, number>;
    projects: string[];
  };
  conversationHistory: {
    totalConversations: number;
    averageSessionLength: number;
    favoriteTopics: string[];
    commonQuestions: string[];
  };
}

interface ConversationMemoryProps {
  conversation: any;
  userProfile?: UserProfile;
}

const ConversationMemory: React.FC<ConversationMemoryProps> = ({ 
  conversation, 
  userProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'learning' | 'insights'>('profile');
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultUserProfile: UserProfile = {
    skillLevel: 'beginner',
    interests: ['AI tools', 'Content creation', 'Automation'],
    previousProjects: ['Personal blog', 'Social media content'],
    preferredTools: ['ChatGPT', 'Canva'],
    learningProgress: {
      topics: {
        'multi-agent': 25,
        'saas': 40,
        'voice-ai': 15,
        'automation': 60
      },
      tools: {
        'ChatGPT': 80,
        'Midjourney': 45,
        'RunwayML': 20,
        'Zapier': 70
      },
      projects: ['AI content calendar', 'Voice cloning setup']
    },
    conversationHistory: {
      totalConversations: 12,
      averageSessionLength: 15,
      favoriteTopics: ['Content creation', 'AI tools', 'Automation'],
      commonQuestions: ['How to use ChatGPT effectively?', 'Best AI tools for beginners?']
    }
  };

  const profile = userProfile || defaultUserProfile;

  const skillLevelColors = {
    beginner: 'from-green-500 to-green-600',
    intermediate: 'from-yellow-500 to-orange-600',
    advanced: 'from-purple-500 to-blue-600'
  };

  const getSkillLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <BookOpen className="w-4 h-4" />;
      case 'intermediate': return <Target className="w-4 h-4" />;
      case 'advanced': return <Award className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'learning', label: 'Learning', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Lightbulb }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h3 className="text-lg font-bold text-purple-400 mb-2">Conversation Memory</h3>
        <p className="text-sm text-gray-400">Your AI learning journey with Parth</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Skill Level */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Skill Level</h4>
                  <div className={`w-8 h-8 bg-gradient-to-r ${skillLevelColors[profile.skillLevel]} rounded-full flex items-center justify-center`}>
                    {getSkillLevelIcon(profile.skillLevel)}
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-400 capitalize mb-2">
                  {profile.skillLevel}
                </div>
                <p className="text-sm text-gray-400">
                  {profile.skillLevel === 'beginner' && 'Starting your AI journey with Parth'}
                  {profile.skillLevel === 'intermediate' && 'Building solid AI foundations'}
                  {profile.skillLevel === 'advanced' && 'Mastering advanced AI concepts'}
                </p>
              </div>

              {/* Interests */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Areas of Interest</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Tools */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Preferred Tools</h4>
                <div className="space-y-2">
                  {profile.preferredTools.map((tool, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{tool}</span>
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Conversation Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {profile.conversationHistory.totalConversations}
                  </div>
                  <div className="text-sm text-gray-400">Total Sessions</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {profile.conversationHistory.averageSessionLength}m
                  </div>
                  <div className="text-sm text-gray-400">Avg. Duration</div>
                </div>
              </div>

              {/* Favorite Topics */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Favorite Topics</h4>
                <div className="space-y-2">
                  {profile.conversationHistory.favoriteTopics.map((topic, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className="text-sm text-gray-300">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Questions */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Common Questions</h4>
                <div className="space-y-2">
                  {profile.conversationHistory.commonQuestions.map((question, index) => (
                    <div key={index} className="text-sm text-gray-400 italic">
                      "{question}"
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Topic Progress */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Topic Progress</h4>
                <div className="space-y-3">
                  {Object.entries(profile.learningProgress.topics).map(([topic, progress]) => (
                    <div key={topic} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 capitalize">{topic.replace('-', ' ')}</span>
                        <span className="text-sm text-purple-400">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tool Mastery */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Tool Mastery</h4>
                <div className="space-y-3">
                  {Object.entries(profile.learningProgress.tools).map(([tool, mastery]) => (
                    <div key={tool} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{tool}</span>
                        <span className="text-sm text-blue-400">{mastery}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${mastery}%` }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Projects */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Completed Projects</h4>
                <div className="space-y-2">
                  {profile.learningProgress.projects.map((project, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-sm text-gray-300">{project}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* AI Insights */}
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">AI Insights</h4>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>• You're making great progress with automation tools</p>
                  <p>• Consider exploring multi-agent systems next</p>
                  <p>• Your content creation skills are developing well</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Recommended Next Steps</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2" />
                    <div>
                      <div className="text-sm font-medium text-white">Explore MCP Protocols</div>
                      <div className="text-xs text-gray-400">Based on your interest in automation</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                    <div>
                      <div className="text-sm font-medium text-white">Try Voice Cloning</div>
                      <div className="text-xs text-gray-400">Perfect for your content creation workflow</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2" />
                    <div>
                      <div className="text-sm font-medium text-white">Build a SaaS MVP</div>
                      <div className="text-xs text-gray-400">Leverage your automation skills</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Path */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <h4 className="font-semibold text-white mb-3">Your Learning Path</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-sm text-gray-300">AI Fundamentals ✓</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-sm text-gray-300">Content Creation ✓</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-sm text-gray-300">Automation Workflows</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                    <span className="text-sm text-gray-500">Multi-Agent Systems</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConversationMemory;
