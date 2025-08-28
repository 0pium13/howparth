import React from 'react';
import { motion } from 'framer-motion';

const AutomationPage: React.FC = () => {
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
            AUTOMATION
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Streamline your workflows with intelligent automation solutions.
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
            <h3 className="text-xl font-semibold text-white mb-4">Workflow Automation</h3>
            <p className="text-gray-400">Automate repetitive tasks and streamline your processes.</p>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Data Processing</h3>
            <p className="text-gray-400">Process and analyze data automatically with AI.</p>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Smart Integrations</h3>
            <p className="text-gray-400">Connect your tools and services seamlessly.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AutomationPage;
