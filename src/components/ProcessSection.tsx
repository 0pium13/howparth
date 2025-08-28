import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import AnimatedText from './AnimatedText';
import { Brain, Layers, Target, ArrowUpRight } from 'lucide-react';

const ProcessSection: React.FC = () => {
  const ref = React.useRef(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '-100px 0px -100px 0px'
  });

  // Generate multiple light rays with varying properties
  const generateLightRays = (cardIndex: number) => {
    const rays = [];
    for (let i = 0; i < 8; i++) {
      rays.push({
        id: i,
        x: Math.random() * 100, // Random horizontal position
        width: Math.random() * 2 + 0.5, // Random width (0.5-2.5px)
        opacity: Math.random() * 0.6 + 0.2, // Random opacity (0.2-0.8)
        duration: Math.random() * 1.5 + 1, // Random duration (1-2.5s)
        delay: Math.random() * 0.3, // Random delay (0-0.3s)
        height: Math.random() * 40 + 60, // Random height (60-100%)
      });
    }
    return rays;
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
    <section className="py-32 bg-primary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 border border-accent/20"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: isInView ? 0.1 : 0, rotate: isInView ? 360 : 0 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 border border-accent/20"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: isInView ? 0.1 : 0, rotate: isInView ? -360 : 0 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

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
            className="text-4xl md:text-6xl font-black text-secondary mb-8 tracking-wider"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {processCards.map((card, index) => (
            <motion.div
              key={card.number}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
              transition={{ duration: 0.8, delay: card.delay }}
              whileHover={{ y: -10 }}
              className="group relative"
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <div className={`bg-accent/5 border border-accent/20 p-12 transition-all duration-500 relative overflow-hidden ${
                hoveredCard === index 
                  ? 'bg-accent/10 border-accent/40 shadow-2xl shadow-accent/20' 
                  : 'hover:bg-accent/10'
              }`}>
                {/* Apple-Style Light Ray Animation */}
                {hoveredCard === index && (
                  <div className="absolute inset-0 pointer-events-none">
                    {generateLightRays(index).map((ray) => (
                      <motion.div
                        key={ray.id}
                        className="process-card-light-ray"
                        style={{
                          left: `${ray.x}%`,
                          width: `${ray.width}px`,
                          height: `${ray.height}%`,
                          opacity: ray.opacity,
                        }}
                        initial={{
                          scaleY: 0,
                          opacity: 0,
                        }}
                        animate={{
                          scaleY: 1,
                          opacity: ray.opacity,
                        }}
                        exit={{
                          scaleY: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: ray.duration,
                          delay: ray.delay,
                          ease: [0.25, 0.46, 0.45, 0.94], // Apple's custom easing
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
                  className="text-6xl font-black text-accent/30 mb-6 tracking-wider"
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
