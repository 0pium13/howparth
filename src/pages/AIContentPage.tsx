import React from 'react';
import { motion } from 'framer-motion';

const AIContentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            AI CONTENT
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transform your ideas into reality with cutting-edge AI content creation tools.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Placeholder content */}
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">AI Writing</h3>
            <p className="text-gray-400">Generate compelling content with advanced AI writing tools.</p>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Image Generation</h3>
            <p className="text-gray-400">Create stunning visuals with AI-powered image generation.</p>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Video Creation</h3>
            <p className="text-gray-400">Produce professional videos using AI technology.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIContentPage;
