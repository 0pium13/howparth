import React from 'react';
import { motion } from 'framer-motion';

interface SectionDividerProps {
  className?: string;
  height?: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ 
  className = "", 
  height = "150px" 
}) => {
  return (
    <div 
      className={`section-divider ${className}`}
      style={{ height }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      />
    </div>
  );
};

export default SectionDivider;
