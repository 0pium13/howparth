import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';

const ExpertBadge: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold rounded-full border border-yellow-400/50 shadow-lg"
    >
      <Crown className="w-3 h-3" />
      <span>EXPERT</span>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Star className="w-3 h-3" />
      </motion.div>
    </motion.div>
  );
};

export default ExpertBadge;
