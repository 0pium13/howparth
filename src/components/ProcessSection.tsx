import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import AnimatedText from './AnimatedText';
import FloatingEmojis from './FloatingEmojis';
import { Brain, Layers, Target, ArrowUpRight } from 'lucide-react';

const ProcessSection: React.FC = () => {
  const ref = React.useRef(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '-100px 0px -100px 0px'
  });

  // Ultra-premium particle system generator
  const generatePremiumParticles = (cardIndex: number, mouseX: number, mouseY: number) => {
    const particles = [];
    const particleCount = 24; // Increased for more sophisticated effect
    
    for (let i = 0; i < particleCount; i++) {
      // Calculate distance from mouse for intensity variation
      const distanceFromMouse = Math.sqrt(
        Math.pow((mouseX - 50) / 50, 2) + Math.pow((mouseY - 50) / 50, 2)
      );
      const intensityMultiplier = Math.max(0.3, 1 - distanceFromMouse);
      
      particles.push({
        id: i,
        x: Math.random() * 100, // Random horizontal position
        width: (Math.random() * 0.8 + 0.2) * intensityMultiplier, // Ultra-thin to medium (0.2-1px)
        opacity: (Math.random() * 0.45 + 0.15) * intensityMultiplier, // 15% to 60% transparency
        duration: Math.random() * 0.8 + 0.8, // 0.8-1.6s for varied timing
        delay: Math.random() * 0.4, // Staggered emergence (0-0.4s)
        height: Math.random() * 50 + 50, // 50-100% height
        curve: Math.random() * 0.3 - 0.15, // Slight curve variation (-0.15 to 0.15)
        pulse: Math.random() * 0.2 + 0.9, // Pulse variation (0.9-1.1)
        acceleration: Math.random() * 0.3 + 0.85, // Non-linear motion (0.85-1.15)
        trail: Math.random() > 0.7, // 30% chance for particle trail
        glow: Math.random() * 0.4 + 0.6, // Glow intensity (0.6-1.0)
      });
    }
    return particles;
  };

  // Physics-based easing functions for premium motion
  const premiumEasing = {
    emergence: [0.25, 0.46, 0.45, 0.94] as const, // Apple's custom easing
    travel: [0.4, 0.0, 0.2, 1.0] as const, // Smooth acceleration
    dissolution: [0.0, 0.0, 0.2, 1.0] as const, // Elegant fade-out
  };

  const processCards = [
    {
      number: "01",
      title: "ANALYZE",
      description: "Deep-dive analysis of your creative needs using advanced AI algorithms to understand project requirements.",
      icon: <Brain className="w-8 h-8" />,
      delay: 0.2
    },
    {
      number: "02",
      title: "STRATEGIZE",
      description: "Develop comprehensive AI-driven strategies that align with your goals and leverage cutting-edge technology.",
      icon: <Layers className="w-8 h-8" />,
      delay: 0.4
    },
    {
      number: "03",
      title: "CREATE",
      description: "Leveraging 50+ AI tools including Midjourney, ChatGPT, and DaVinci Resolve to craft premium content.",
      icon: <Target className="w-8 h-8" />,
      delay: 0.6
    },
    {
      number: "04",
      title: "REFINE",
      description: "Iterative improvement process ensuring every detail meets the highest standards of quality and creativity.",
      icon: <ArrowUpRight className="w-8 h-8" />,
      delay: 0.8
    },
    {
      number: "05",
      title: "DEPLOY",
      description: "Final delivery of AI-powered solutions that exceed expectations and drive real results for your business.",
      icon: <Brain className="w-8 h-8" />,
      delay: 1.0
    },
    {
      number: "06",
      title: "OPTIMIZE",
      description: "Continuous improvement and optimization of AI systems to ensure maximum performance and efficiency.",
      icon: <Layers className="w-8 h-8" />,
      delay: 1.2
    }
  ];

  return (
    <section className="py-16 bg-primary relative overflow-hidden">
      {/* Purple Glow Chunks */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-purple-500/25 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              zIndex: Math.floor(Math.random() * 10),
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.25, 0.4, 0.25],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Background blur effects */}
      <motion.div
        className="absolute inset-0 bg-accent/5 backdrop-blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 1 }}
      />

      {/* Floating geometric elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-secondary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Floating Emojis in 3D Space */}
      <FloatingEmojis />

      <div className="max-w-8xl mx-auto px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          className="text-center mb-24"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
          transition={{ duration: 0.8 }}
        >
          <AnimatedText
            text="PROCESS"
            type="word"
            animation="slideUp"
            className="text-4xl md:text-6xl font-black bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent mb-8 tracking-wider"
            stagger={0.1}
            delay={0.2}
          />
        </motion.div>

        {/* Process Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 process-grid max-w-6xl mx-auto justify-items-center">
          {processCards.map((card, index) => (
            <motion.div
              key={card.number}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
              transition={{ duration: 0.8, delay: card.delay }}
              whileHover={{ y: -10 }}
              className="group relative w-full h-96"
              style={{ maxWidth: '582px' }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setMousePosition({ x, y });
              }}
            >
              <div className={`process-card-premium bg-accent/5 border border-accent/20 p-12 transition-all duration-500 relative overflow-hidden w-full h-full ${
                hoveredCard === index 
                  ? 'bg-accent/10 border-accent/40 shadow-2xl shadow-accent/20' 
                  : 'hover:bg-accent/10'
              }`}
              style={{
                '--mouse-x': `${mousePosition.x}%`,
                '--mouse-y': `${mousePosition.y}%`,
              } as React.CSSProperties}>
                {/* Ambient glow layer */}
                <div className="ambient-glow" />
                {/* Ultra-Premium Particle System */}
                {hoveredCard === index && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Ambient glow layer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: premiumEasing.emergence }}
                    />
                    
                    {/* Primary particle system */}
                    {generatePremiumParticles(index, mousePosition.x, mousePosition.y).map((particle) => (
                      <motion.div
                        key={particle.id}
                        className="absolute bottom-0 premium-particle"
                        style={{
                          left: `${particle.x}%`,
                          width: `${particle.width}px`,
                          height: `${particle.height}%`,
                          opacity: particle.opacity,
                          filter: `blur(${particle.width * 0.3}px)`,
                          boxShadow: `0 0 ${particle.glow * 6}px rgba(255, 255, 255, ${particle.opacity * 0.8})`,
                        }}
                        initial={{
                          scaleY: 0,
                          opacity: 0,
                          x: particle.curve * 20,
                        }}
                        animate={{
                          scaleY: 1,
                          opacity: particle.opacity,
                          x: 0,
                        }}
                        exit={{
                          scaleY: 0,
                          opacity: 0,
                          x: particle.curve * -20,
                        }}
                        transition={{
                          duration: particle.duration,
                          delay: particle.delay,
                          ease: premiumEasing.travel,
                        }}
                      >
                        {/* Particle trail effect */}
                        {particle.trail && (
                          <motion.div
                            className="absolute top-0 left-0 w-full h-full bg-white/20"
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 0.3 }}
                            exit={{ scaleY: 0, opacity: 0 }}
                            transition={{
                              duration: particle.duration * 0.6,
                              delay: particle.delay + 0.1,
                              ease: premiumEasing.dissolution,
                            }}
                          />
                        )}
                      </motion.div>
                    ))}
                    
                    {/* Secondary micro-particles for depth */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={`micro-${i}`}
                        className="absolute bottom-0 w-px bg-white/10"
                        style={{
                          left: `${Math.random() * 100}%`,
                          height: `${Math.random() * 30 + 20}%`,
                        }}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 0.1 }}
                        exit={{ scaleY: 0, opacity: 0 }}
                        transition={{
                          duration: 0.6 + Math.random() * 0.4,
                          delay: 0.2 + Math.random() * 0.3,
                          ease: premiumEasing.emergence,
                        }}
                      />
                    ))}
                  </div>
                )}
                {/* Number */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.8 }}
                  transition={{ duration: 0.5, delay: card.delay + 0.2 }}
                  className="text-6xl font-black mb-6 tracking-wider relative z-10 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                  style={{ transform: 'rotate(0deg)' }}
                >
                  {card.number}
                </motion.div>

                {/* Icon */}
                <motion.div
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: isInView ? 1 : 0, rotate: isInView ? 0 : -180 }}
                  transition={{ duration: 0.8, delay: card.delay + 0.3 }}
                  className="w-16 h-16 bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-8 group-hover:bg-secondary/20 transition-all duration-300"
                >
                  {card.icon}
                </motion.div>

                {/* Title */}
                <AnimatedText
                  text={card.title}
                  type="word"
                  animation="slideUp"
                  className="text-2xl md:text-3xl font-black text-secondary mb-6 tracking-wider"
                  stagger={0.1}
                  delay={card.delay + 0.4}
                />

                {/* Description */}
                <AnimatedText
                  text={card.description}
                  type="word"
                  animation="fadeIn"
                  className="text-base md:text-lg text-gray-400 leading-relaxed"
                  stagger={0.05}
                  delay={card.delay + 0.6}
                />

                {/* Hover Effect Line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                  style={{ width: '100%' }}
                />
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default ProcessSection;
