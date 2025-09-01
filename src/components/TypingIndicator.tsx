import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-1 p-3 rounded-2xl bg-[var(--bubble-assistant)] max-w-[120px] ${className}`}>
      <motion.div
        className="w-2 h-2 bg-[var(--text-secondary)] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="w-2 h-2 bg-[var(--text-secondary)] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      />
      <motion.div
        className="w-2 h-2 bg-[var(--text-secondary)] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4
        }}
      />
    </div>
  );
};

export default TypingIndicator;
