import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform, Easing } from 'framer-motion';
import AnimatedText from './AnimatedText';

const SophisticatedProcessSection: React.FC = () => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [linesVisible, setLinesVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textureY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const observerOptions = {
    threshold: [0.1, 0.3, 0.7],
    rootMargin: '-50px 0px'
  };

  const animationVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1] as Easing
      }
    }
  };

  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '-100px 0px -100px 0px'
  });

  // Debounced scroll listener for performance
  const debouncedScrollHandler = useCallback(() => {
    // Performance optimization: only run on scroll if needed
  }, []);

  useEffect(() => {
    if (isInView) {
      // Trigger card animations
      setTimeout(() => setCardsVisible(true), 200);
      // Trigger line animations after cards
      setTimeout(() => setLinesVisible(true), 1500);
    }
  }, [isInView]);

  // Count up animation hook
  const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      if (cardsVisible) {
        let startTime: number;
        let animationFrame: number;
        
        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          
          setCount(Math.floor(progress * end));
          
          if (progress < 1) {
            animationFrame = requestAnimationFrame(animate);
          }
        };
        
        animationFrame = requestAnimationFrame(animate);
        
        return () => {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }
        };
      }
    }, [cardsVisible, end, duration]);
    
    return count;
  };

  const processSteps = [
    {
      number: "01",
      title: "RESEARCH",
      description: "Deep analysis of your creative needs using advanced AI algorithms to understand project requirements and objectives.",
      icon: "neural-network",
      containerShape: "square"
    },
    {
      number: "02",
      title: "STRATEGIZE",
      description: "Develop comprehensive AI-driven strategies that align with your goals and leverage cutting-edge technology solutions.",
      icon: "branching-paths",
      containerShape: "rounded-rectangle"
    },
    {
      number: "03",
      title: "GENERATE",
      description: "Leverage 50+ AI tools including Midjourney, ChatGPT, and DaVinci Resolve to craft premium content.",
      icon: "starburst",
      containerShape: "circle"
    },
    {
      number: "04",
      title: "REFINE",
      description: "Iterative improvement process ensuring every detail meets the highest standards of quality and creativity.",
      icon: "precision-diamond",
      containerShape: "hexagon"
    },
    {
      number: "05",
      title: "DEPLOY",
      description: "Final delivery of AI-powered solutions that exceed expectations and drive real results for your business.",
      icon: "arrow-constellation",
      containerShape: "triangle"
    },
    {
      number: "06",
      title: "OPTIMIZE",
      description: "Continuous improvement and optimization of AI systems to ensure maximum performance and efficiency.",
      icon: "spiral-growth",
      containerShape: "oval"
    }
  ];

  const renderIcon = (iconType: string, containerShape: string, index: number) => {
    const baseClasses = "w-full h-full flex items-center justify-center process-icon gpu-accelerated";
    
    const containerClasses = {
      square: "w-16 h-16",
      "rounded-rectangle": "w-20 h-12 rounded-[20px]",
      circle: "w-16 h-16 rounded-full",
      hexagon: "w-16 h-16",
      triangle: "w-16 h-16",
      oval: "w-20 h-12 rounded-[50%]"
    };

    const iconStyles = {
      "neural-network": (
        <motion.svg 
          className="w-8 h-8" 
          viewBox="0 0 32 32" 
          fill="none"
          initial={{ opacity: 0 }}
          animate={cardsVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
        >
          <motion.circle 
            cx="8" cy="8" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.4, duration: 0.3 }}
          />
          <motion.circle 
            cx="16" cy="8" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.5, duration: 0.3 }}
          />
          <motion.circle 
            cx="24" cy="8" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.6, duration: 0.3 }}
          />
          <motion.circle 
            cx="8" cy="16" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.7, duration: 0.3 }}
          />
          <motion.circle 
            cx="16" cy="16" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.8, duration: 0.3 }}
          />
          <motion.circle 
            cx="24" cy="16" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.9, duration: 0.3 }}
          />
          <motion.circle 
            cx="8" cy="24" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 1.0, duration: 0.3 }}
          />
          <motion.circle 
            cx="16" cy="24" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 1.1, duration: 0.3 }}
          />
          <motion.circle 
            cx="24" cy="24" r="1.5" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 1.2, duration: 0.3 }}
          />
          <motion.line 
            x1="8" y1="8" x2="16" y2="16" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            opacity="0.6"
            initial={{ pathLength: 0 }}
            animate={cardsVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: index * 0.15 + 1.3, duration: 0.5 }}
          />
          <motion.line 
            x1="16" y1="8" x2="24" y2="16" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            opacity="0.6"
            initial={{ pathLength: 0 }}
            animate={cardsVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: index * 0.15 + 1.4, duration: 0.5 }}
          />
          <motion.line 
            x1="8" y1="16" x2="16" y2="24" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            opacity="0.6"
            initial={{ pathLength: 0 }}
            animate={cardsVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: index * 0.15 + 1.5, duration: 0.5 }}
          />
          <motion.line 
            x1="16" y1="16" x2="24" y2="24" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            opacity="0.6"
            initial={{ pathLength: 0 }}
            animate={cardsVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: index * 0.15 + 1.6, duration: 0.5 }}
          />
        </motion.svg>
      ),
      "branching-paths": (
        <motion.svg 
          className="w-8 h-8" 
          viewBox="0 0 32 32" 
          fill="none"
          initial={{ opacity: 0 }}
          animate={cardsVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
        >
          <motion.path 
            d="M16 4 L16 12 M8 12 L24 12 M8 12 L8 20 M24 12 L24 20 M8 20 L8 28 M24 20 L24 28" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            opacity="0.8" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={cardsVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: index * 0.15 + 0.4, duration: 0.8 }}
          />
          {[4, 12, 12, 20, 20, 28, 28].map((y, i) => (
            <motion.circle 
              key={i}
              cx={i === 0 ? 16 : i % 2 === 1 ? 8 : 24} 
              cy={y} 
              r="1.5" 
              fill="currentColor" 
              opacity="0.8"
              initial={{ scale: 0 }}
              animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: index * 0.15 + 0.5 + i * 0.1, duration: 0.3 }}
            />
          ))}
        </motion.svg>
      ),
      "starburst": (
        <motion.svg 
          className="w-8 h-8" 
          viewBox="0 0 32 32" 
          fill="none"
          initial={{ opacity: 0 }}
          animate={cardsVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
        >
          <motion.path 
            d="M16 4 L18 14 L28 16 L18 18 L16 28 L14 18 L4 16 L14 14 Z" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0, rotate: 0 }}
            animate={cardsVisible ? { scale: 1, rotate: 360 } : { scale: 0, rotate: 0 }}
            transition={{ delay: index * 0.15 + 0.4, duration: 0.8 }}
          />
          <motion.circle 
            cx="16" cy="16" r="2" 
            fill="currentColor" 
            opacity="0.6"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.6, duration: 0.3 }}
          />
        </motion.svg>
      ),
      "precision-diamond": (
        <motion.svg 
          className="w-8 h-8" 
          viewBox="0 0 32 32" 
          fill="none"
          initial={{ opacity: 0 }}
          animate={cardsVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
        >
          <motion.path 
            d="M16 4 L24 16 L16 28 L8 16 Z" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0, rotate: 45 }}
            animate={cardsVisible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 45 }}
            transition={{ delay: index * 0.15 + 0.4, duration: 0.6 }}
          />
          <motion.circle 
            cx="16" cy="16" r="1.5" 
            fill="currentColor" 
            opacity="0.6"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.6, duration: 0.3 }}
          />
        </motion.svg>
      ),
      "arrow-constellation": (
        <motion.svg 
          className="w-8 h-8" 
          viewBox="0 0 32 32" 
          fill="none"
          initial={{ opacity: 0 }}
          animate={cardsVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
        >
          <motion.path 
            d="M16 4 L20 12 L16 20 L12 12 Z" 
            fill="currentColor" 
            opacity="0.8"
            initial={{ scale: 0, y: -10 }}
            animate={cardsVisible ? { scale: 1, y: 0 } : { scale: 0, y: -10 }}
            transition={{ delay: index * 0.15 + 0.4, duration: 0.5 }}
          />
          <motion.path 
            d="M4 16 L12 20 L20 20 L28 16" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            opacity="0.6" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={cardsVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: index * 0.15 + 0.6, duration: 0.6 }}
          />
          <motion.circle 
            cx="16" cy="16" r="1.5" 
            fill="currentColor" 
            opacity="0.6"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 0.8, duration: 0.3 }}
          />
        </motion.svg>
      ),
      "spiral-growth": (
        <motion.svg 
          className="w-8 h-8" 
          viewBox="0 0 32 32" 
          fill="none"
          initial={{ opacity: 0 }}
          animate={cardsVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
        >
          <motion.path 
            d="M16 16 Q20 12 24 16 Q20 20 16 16 Q12 12 8 16 Q12 20 16 16" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            opacity="0.8" 
            fill="none"
            initial={{ pathLength: 0 }}
            animate={cardsVisible ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ delay: index * 0.15 + 0.4, duration: 1.2 }}
          />
          <motion.circle 
            cx="16" cy="16" r="1.5" 
            fill="currentColor" 
            opacity="0.6"
            initial={{ scale: 0 }}
            animate={cardsVisible ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.15 + 1.0, duration: 0.3 }}
          />
        </motion.svg>
      )
    };

    const containerStyle = containerShape === "hexagon" 
      ? { clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }
      : containerShape === "triangle"
      ? { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }
      : {};

    return (
      <motion.div 
        className={`${baseClasses} ${containerClasses[containerShape as keyof typeof containerClasses]} bg-accent/20 border border-accent/30`}
        style={containerStyle}
        whileHover={{ 
          rotate: 5, 
          scale: 1.05,
          filter: "drop-shadow(0 0 10px rgba(124, 58, 237, 0.3))"
        }}
        transition={{ duration: 0.3 }}
      >
        {iconStyles[iconType as keyof typeof iconStyles]}
      </motion.div>
    );
  };

  return (
    <section ref={containerRef} className="py-32 bg-primary relative overflow-hidden process-section">
      {/* Background Parallax Elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-20 left-10 w-32 h-32 border border-accent/10 rounded-full" />
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-accent/10" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-accent/10 rounded-full" />
      </motion.div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: textureY }}
      >
        <div className="absolute top-40 right-20 w-20 h-20 border border-accent/5" />
        <div className="absolute bottom-40 left-20 w-12 h-12 border border-accent/5 rounded-full" />
      </motion.div>

      <div className="max-w-8xl mx-auto px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          className="text-center mb-24"
          variants={animationVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <AnimatedText
            text="PROCESS"
            type="word"
            animation="slideUp"
            className="text-4xl md:text-6xl font-black text-secondary mb-8 tracking-wider text-glow"
            stagger={0.1}
            delay={0.2}
          />
          <AnimatedText
            text="A systematic approach to transforming your ideas into AI-powered reality"
            type="word"
            animation="fadeIn"
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light"
            stagger={0.05}
            delay={0.6}
          />
        </motion.div>

        {/* Process Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.number}
              className="process-card gpu-accelerated"
              variants={animationVariants}
              initial="hidden"
              animate={cardsVisible ? "visible" : "hidden"}
              transition={{ delay: index * 0.15 }}
              whileHover={{ 
                y: -8,
                boxShadow: "0 20px 40px rgba(124, 58, 237, 0.2)",
                borderColor: "rgba(124, 58, 237, 0.3)"
              }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <div className="p-8 h-full flex flex-col">
                {/* Step Number */}
                <motion.div
                  className="text-sm text-gray-500 tracking-widest mb-6 process-number"
                  initial={{ opacity: 0, x: -20 }}
                  animate={cardsVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.15 + 0.2, duration: 0.5 }}
                >
                  —{step.number}—
                </motion.div>

                {/* Icon */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={cardsVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.6 }}
                >
                  {renderIcon(step.icon, step.containerShape, index)}
                </motion.div>

                {/* Title */}
                <motion.div
                  className="text-2xl md:text-3xl font-black text-secondary mb-4 tracking-wider process-title text-glow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={cardsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.15 + 0.8, duration: 0.6 }}
                >
                  {step.title.split('').map((letter, letterIndex) => (
                    <motion.span
                      key={letterIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={cardsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ 
                        delay: index * 0.15 + 0.8 + letterIndex * 0.05, 
                        duration: 0.3 
                      }}
                      className="inline-block"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Description */}
                <motion.div
                  className="text-base text-gray-400 leading-relaxed flex-grow process-description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={cardsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.15 + 1.0, duration: 0.6 }}
                >
                  {step.description.split(' ').map((word, wordIndex) => (
                    <motion.span
                      key={wordIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={cardsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ 
                        delay: index * 0.15 + 1.0 + wordIndex * 0.03, 
                        duration: 0.4 
                      }}
                      className="inline-block mr-1"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Animated Line Connections */}
          {linesVisible && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <motion.path
                d="M 140 200 Q 280 150 420 200 Q 560 250 700 200"
                stroke="rgba(124, 58, 237, 0.3)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d="M 140 400 Q 280 350 420 400 Q 560 450 700 400"
                stroke="rgba(124, 58, 237, 0.2)"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
              />
            </svg>
          )}
        </div>
      </div>
    </section>
  );
};

export default SophisticatedProcessSection;
