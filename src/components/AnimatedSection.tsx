import React, { useLayoutEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedText from './AnimatedText';
import FloatingEmojis from './FloatingEmojis';
import { Brain, Sparkles, Zap, Target, Award, Users } from 'lucide-react';

const AnimatedSection: React.FC = () => {
  const ref = React.useRef(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: '-100px 0px -100px 0px'
  });

  useLayoutEffect(() => {
    const measure = () => {
      if (marqueeRef.current) {
        // Use scrollWidth instead of offsetWidth and round to integer
        const fullWidth = Math.ceil(marqueeRef.current.scrollWidth / 2);
        document.documentElement.style.setProperty('--marquee-width', `${fullWidth}px`);
        

      }
    };
    
    // Wait one tick so browser paints the duplicated content
    requestAnimationFrame(measure);
    
    // Handle resize events
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const sections = [
    {
      icon: <Brain className="w-10 h-10 md:w-12 md:h-12" />,
      title: "I specialize in AI-driven content creation",
      description: "Leveraging cutting-edge artificial intelligence to create compelling, engaging content that resonates with your audience and drives results.",
      animation: "slideUp" as const,
      delay: 0.2
    },
    {
      icon: <Sparkles className="w-10 h-10 md:w-12 md:h-12" />,
      title: "From concept to execution, I deliver premium results",
      description: "Every project is crafted with precision, from initial brainstorming to final delivery, ensuring exceptional quality and client satisfaction.",
      animation: "slideRight" as const,
      delay: 0.4
    },
    {
      icon: <Zap className="w-10 h-10 md:w-12 md:h-12" />,
      title: "Leveraging the power of artificial intelligence",
      description: "Combining human creativity with AI capabilities to produce innovative solutions that push boundaries and exceed expectations.",
      animation: "slideLeft" as const,
      delay: 0.6
    },
    {
      icon: <Target className="w-10 h-10 md:w-12 md:h-12" />,
      title: "Data-driven strategies for maximum impact",
      description: "Every decision is backed by analytics and insights, ensuring your content reaches the right audience at the right time for optimal engagement.",
      animation: "slideUp" as const,
      delay: 0.8
    },
    {
      icon: <Award className="w-10 h-10 md:w-12 md:h-12" />,
      title: "Award-winning quality and innovation",
      description: "Consistently delivering exceptional results that exceed expectations and set new standards in AI-powered content creation.",
      animation: "slideRight" as const,
      delay: 1.0
    },
    {
      icon: <Users className="w-10 h-10 md:w-12 md:h-12" />,
      title: "Client-focused collaboration and support",
      description: "Building lasting partnerships through transparent communication, regular updates, and dedicated support throughout your project journey.",
      animation: "slideLeft" as const,
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
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            ref={ref}
            className="text-center mb-16 md:mb-20 lg:mb-24 pt-8 md:pt-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 md:mb-8">
              <AnimatedText
                text="AI-POWERED"
                type="word"
                animation="slideUp"
                className="text-3xl md:text-5xl lg:text-6xl font-black text-secondary tracking-[0.1em] md:tracking-[0.2em] leading-tight"
                stagger={0.1}
                delay={0.2}
              />
              <AnimatedText
                text="CREATIVE"
                type="word"
                animation="slideUp"
                className="text-3xl md:text-5xl lg:text-6xl font-normal text-purple-400 tracking-[0.1em] md:tracking-[0.2em] leading-tight"
                stagger={0.1}
                delay={0.4}
              />
              <AnimatedText
                text="SOLUTIONS"
                type="word"
                animation="slideUp"
                className="text-3xl md:text-5xl lg:text-6xl font-black text-secondary tracking-[0.1em] md:tracking-[0.2em] leading-tight"
                stagger={0.1}
                delay={0.5}
              />
            </div>
            <div className="mb-8 md:mb-12">
              <AnimatedText
                text="Where creativity meets"
                type="word"
                animation="fadeIn"
                className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto font-light tracking-wide px-4 leading-relaxed"
                stagger={0.05}
                delay={0.8}
              />
              <AnimatedText
                text="artificial intelligence to create"
                type="word"
                animation="fadeIn"
                className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto font-light tracking-wide px-4 leading-relaxed"
                stagger={0.05}
                delay={1.0}
              />
              <AnimatedText
                text="extraordinary experiences"
                type="word"
                animation="fadeIn"
                className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto font-light tracking-wide px-4 leading-relaxed"
                stagger={0.05}
                delay={1.2}
              />
            </div>
          </motion.div>

          {/* Animated Sections */}
          <div className="space-y-16 md:space-y-20 lg:space-y-24">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-8 md:gap-10 lg:gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 100 }}
                animate={{
                  opacity: isInView ? 1 : 0,
                  y: isInView ? 0 : 100
                }}
                transition={{
                  duration: 0.8,
                  delay: section.delay,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                {/* Icon */}
                <motion.div
                  className="flex-shrink-0"
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-accent/20 border border-accent/30 rounded-2xl flex items-center justify-center text-secondary shadow-2xl">
                    {section.icon}
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <AnimatedText
                    text={section.title}
                    type="word"
                    animation={section.animation}
                    className="text-3xl md:text-4xl font-black text-secondary mb-6 tracking-[0.15em] leading-tight"
                    stagger={0.1}
                    delay={section.delay + 0.3}
                  />
                  <AnimatedText
                    text={section.description}
                    type="word"
                    animation="fadeIn"
                    className="text-lg md:text-xl text-gray-400 leading-relaxed font-light tracking-wide"
                    stagger={0.05}
                    delay={section.delay + 0.6}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium Login Button */}
          <motion.div
            className="text-center mt-24"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isInView ? 1 : 0,
              scale: isInView ? 1 : 0.8
            }}
            transition={{
              duration: 0.8,
              delay: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg tracking-wider rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>LOGIN</span>
              <motion.div
                className="ml-3"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </Link>
          </motion.div>

          {/* Moving Greetings Line */}
          <motion.div
            className="mt-32 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <div className="relative w-full overflow-hidden">
              <div
                ref={marqueeRef}
                className="marquee flex space-x-16 text-3xl md:text-5xl font-black text-white tracking-tight whitespace-nowrap"
              >
                <span className="text-outline-white">SAY नमस्कार</span>
                <span className="text-outline-white">SAY BONJOUR</span>
                <span className="text-outline-white">SAY HOLA</span>
                <span className="text-outline-white">SAY నమస్తే</span>
                <span className="text-outline-white">SAY CIAO</span>
                <span className="text-outline-white">SAY HALLO</span>
                <span className="text-outline-white">SAY مرحبا</span>
                <span className="text-outline-white">SAY HELLO</span>
                <span className="text-outline-white">SAY こんにちは</span>
                <span className="text-outline-white">SAY Здравствуйте</span>
                <span className="text-outline-white">SAY नमस्कार</span>
                <span className="text-outline-white">SAY BONJOUR</span>
                <span className="text-outline-white">SAY HOLA</span>
                <span className="text-outline-white">SAY నమస్తే</span>
                <span className="text-outline-white">SAY CIAO</span>
                <span className="text-outline-white">SAY HALLO</span>
                <span className="text-outline-white">SAY مرحبا</span>
                <span className="text-outline-white">SAY HELLO</span>
                <span className="text-outline-white">SAY こんにちは</span>
                <span className="text-outline-white">SAY Здравствуйте</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AnimatedSection;
