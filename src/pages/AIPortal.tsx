import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Target, Zap, Send, Download } from 'lucide-react';

const AIPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('blogs');
  const [isGenerating, setIsGenerating] = useState(false);

  const tabs = [
    { id: 'blogs', name: 'Blogs', icon: FileText },
    { id: 'strategy', name: 'Strategy', icon: Target },
    { id: 'quality', name: 'Quality', icon: Zap }
  ];

  const features = [
    {
      title: 'AI-Powered Content Generation',
      description: 'Generate high-quality blog posts, articles, and content using advanced AI models trained on your research insights.',
      icon: Brain,
      color: 'from-purple-500 to-blue-600'
    },
    {
      title: 'Strategic Content Planning',
      description: 'Create comprehensive content strategies and editorial calendars based on AI analysis and market trends.',
      icon: Target,
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Quality Assurance',
      description: 'Automated quality checks, SEO optimization, and content refinement to ensure top-tier output.',
      icon: Zap,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Content Portal
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Leverage AI trained on your research insights to create compelling content, strategic plans, and quality-assured deliverables.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Creation Section */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-800/50 rounded-xl p-2 flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Creation Interface */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Content Generation</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content Type
                    </label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none">
                      <option>Blog Post</option>
                      <option>Article</option>
                      <option>Social Media Post</option>
                      <option>Email Newsletter</option>
                      <option>Technical Documentation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Topic/Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your topic or title..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none">
                      <option>General</option>
                      <option>Technical</option>
                      <option>Business</option>
                      <option>Developers</option>
                      <option>Executives</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tone & Style
                    </label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none">
                      <option>Professional</option>
                      <option>Conversational</option>
                      <option>Technical</option>
                      <option>Casual</option>
                      <option>Academic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Additional Instructions
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Any specific requirements, keywords, or instructions..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    onClick={() => setIsGenerating(true)}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Generate Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Generated Content</h3>
                  <button className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export</span>
                  </button>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-96 overflow-y-auto">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">AI is generating your content...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-300">
                      <p className="text-gray-500 italic">
                        Your generated content will appear here. Click "Generate Content" to get started.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quality Metrics */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">95%</div>
                    <div className="text-sm text-gray-400">Quality Score</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">A+</div>
                    <div className="text-sm text-gray-400">SEO Grade</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">4.8</div>
                    <div className="text-sm text-gray-400">Readability</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Content */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Recent Content</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: item * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-purple-400 font-medium">Blog Post</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <h3 className="text-xl font-bold mb-3">AI Agent Orchestration Best Practices</h3>
                <p className="text-gray-400 mb-4 line-clamp-3">
                  Comprehensive guide to implementing effective multi-agent systems with proper orchestration patterns and communication protocols.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">AI</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Orchestration</span>
                  </div>
                  <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    View →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIPortal;
