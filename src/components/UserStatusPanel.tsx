import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UserStatusPanel: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.5,
        ease: "easeOut"
      }}
      className="max-w-md mx-auto mt-8"
    >
      <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl relative">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">
                Signed in as
              </span>
              <span className="text-sm font-semibold text-purple-400">
                {user.username}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 mt-1">
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 truncate">
                {user.email}
              </span>
            </div>
          </div>
          
          {/* Pulsing accent border */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-purple-500/30"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(168, 85, 247, 0.4)",
                "0 0 0 4px rgba(168, 85, 247, 0)",
                "0 0 0 0 rgba(168, 85, 247, 0)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>
    </motion.div>
  );
};
