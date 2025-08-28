import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, User } from 'lucide-react';

interface WelcomeToastProps {
  username: string;
  isVisible: boolean;
  onClose: () => void;
}

export const WelcomeToast: React.FC<WelcomeToastProps> = ({ 
  username, 
  isVisible, 
  onClose 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: -100, 
            scale: 0.8,
            x: '-50%'
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            x: '-50%'
          }}
          exit={{ 
            opacity: 0, 
            y: -50, 
            scale: 0.9,
            x: '-50%'
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.5
          }}
          className="fixed top-4 left-1/2 z-50 max-w-sm w-full"
        >
          <div className="bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-xl border border-purple-400/30 rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <motion.div
              className="h-1 bg-white/30"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ 
                duration: 3, 
                ease: "linear" 
              }}
              style={{ transformOrigin: 'left' }}
            />
            
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white leading-5">
                    Welcome back, {username}!
                  </h4>
                  <p className="mt-1 text-xs text-white/80 leading-4">
                    You've been successfully signed in
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
