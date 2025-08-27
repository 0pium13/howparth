import React from 'react';
import { motion, useInView } from 'framer-motion';
import AnimatedText from './AnimatedText';

const OutlineTextSection: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
    margin: '-100px 0px -100px 0px'
  });

  return (
    <section className="py-32 bg-primary relative overflow-hidden">
      {/* Purple Wave Lines */}
      <div className="purple-waves-container relative">
        <div className="purple-wave-1"></div>
        <div className="purple-wave-2"></div>
        
        {/* THINK BEYOND Text - Positioned between the waves */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* 3D Purple Glow Behind Text */}
          <motion.div
            className="absolute w-96 h-32 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              zIndex: -1,
            }}
          />
          
          {/* Additional Subtle Glow Layers */}
          <motion.div
            className="absolute w-80 h-24 bg-purple-400/15 rounded-full blur-2xl"
            animate={{
              scale: [1.1, 0.9, 1.1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{
              zIndex: -2,
            }}
          />
          
          <motion.div
            className="absolute w-72 h-20 bg-purple-300/10 rounded-full blur-xl"
            animate={{
              scale: [0.9, 1.1, 0.9],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            style={{
              zIndex: -3,
            }}
          />
          
          <AnimatedText
            text="THINK BEYOND."
            type="word"
            animation="slideUp"
            className="text-3xl md:text-4xl font-bold text-secondary tracking-wider relative z-10"
            stagger={0.1}
            delay={1.0}
          />
        </motion.div>
      </div>

      <div className="max-w-8xl mx-auto px-8">
        <div className="flex flex-col xl:flex-row items-start justify-between gap-16 xl:gap-24">
          {/* Large Outline Text */}
          <motion.div
            ref={ref}
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
            transition={{ duration: 0.8 }}
          >
            <AnimatedText
              text="AI TRANSFORMS IDEAS INTO REALITY"
              type="word"
              animation="slideUp"
              className="outline-text"
              stagger={0.1}
              delay={0.2}
            />
          </motion.div>

          {/* Supporting Text */}
          <motion.div
            className="xl:w-80 2xl:w-96 flex-shrink-0 self-end xl:self-start relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Sword Cutting Motion Lines */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isInView ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {/* First Cutting Line */}
              <motion.div
                className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ 
                  x: isInView ? '100%' : '-100%',
                  opacity: isInView ? [0, 1, 0] : 0
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: 1.0,
                  ease: "easeInOut"
                }}
                style={{
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
                }}
              />
              
              {/* Second Cutting Line */}
              <motion.div
                className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ 
                  x: isInView ? '100%' : '-100%',
                  opacity: isInView ? [0, 1, 0] : 0
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: 1.4,
                  ease: "easeInOut"
                }}
                style={{
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
                }}
              />
              
              {/* Glow Effect Behind Lines */}
              <motion.div
                className="absolute top-1/4 left-0 w-full h-1 bg-purple-400/20 blur-sm"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ 
                  x: isInView ? '100%' : '-100%',
                  opacity: isInView ? [0, 0.3, 0] : 0
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: 1.1,
                  ease: "easeInOut"
                }}
              />
              
              <motion.div
                className="absolute top-3/4 left-0 w-full h-1 bg-purple-400/20 blur-sm"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ 
                  x: isInView ? '100%' : '-100%',
                  opacity: isInView ? [0, 0.3, 0] : 0
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: 1.5,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            <AnimatedText
              text="IT'S NOT JUST ABOUT CREATING CONTENT — IT'S ABOUT MAKING IT INTELLIGENT."
              type="word"
              animation="slideUp"
              className="text-lg text-gray-400 leading-relaxed font-light tracking-wide relative z-10"
              stagger={0.05}
              delay={0.6}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OutlineTextSection;
