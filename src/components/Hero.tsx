import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Zap, Sparkles, Target } from 'lucide-react';
import { createSolarScrollHandler, createIntersectionObserver } from '../utils/performance';
import { initializeSmoothGradient } from '../utils/smoothGradientController';

const Hero: React.FC = () => {
  const [logoRevealed, setLogoRevealed] = useState(false);
  const controls = useAnimation();
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoRevealed(true);
      controls.start('visible');
    }, 2000);

    return () => clearTimeout(timer);
  }, [controls]);

  // Initialize enhanced smooth gradient controller
  useEffect(() => {
    initializeSmoothGradient();
  }, []);

  // Optimized scroll trigger for solar background (fallback)
  useEffect(() => {
    const solarScrollHandler = createSolarScrollHandler();
    
    // Initial call function that doesn't require event parameter
    const initialSolarUpdate = () => {
      const scrollPercent = Math.min(window.scrollY / 500, 1);
      const solar = document.querySelector('.solar-background') as HTMLElement;
      
      if (solar) {
        solar.style.opacity = (scrollPercent * 0.6).toString();
        solar.style.transform = `translateX(-50%) translateY(${20 - scrollPercent * 30}vh)`;
      }
    };
    
    window.addEventListener('scroll', solarScrollHandler, { passive: true });
    
    // Initial call
    initialSolarUpdate();

    return () => {
      window.removeEventListener('scroll', solarScrollHandler);
    };
  }, []);

  // Intersection Observer for performance
  useEffect(() => {
    if (!heroRef.current) return;

    const observer = createIntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    });

    observer.observe(heroRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-primary hero-section animate-on-scroll">
      {/* Enhanced Solar Background */}
      <div className="solar-background">
        <div className="solar-layer-1"></div>
        <div className="solar-layer-2"></div>
        <div className="solar-layer-3"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 max-w-8xl mx-auto hero-content">
        {/* Animated Logo - Moved down with more spacing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: logoRevealed ? 1 : 0,
            scale: logoRevealed ? 1 : 0.8
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="mb-24"
        >
          <motion.div
            className="text-6xl md:text-8xl lg:text-9xl font-black text-secondary tracking-wider"
            animate={{
              textShadow: logoRevealed ? [
                "0 0 20px rgba(255,255,255,0.1)",
                "0 0 40px rgba(255,255,255,0.2)",
                "0 0 20px rgba(255,255,255,0.1)"
              ] : "0 0 0px rgba(255,255,255,0)"
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            HOWPARTH
          </motion.div>
        </motion.div>



        {/* Subtitle - Below headline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-xl md:text-2xl lg:text-3xl text-gray-400 mb-20 max-w-4xl mx-auto leading-relaxed font-light text-center relative z-10"
        >
          Transforming ideas into reality with cutting-edge{' '}
          <span className="text-secondary font-medium">artificial intelligence</span>
        </motion.p>

        {/* Feature Icons - Below subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex justify-center items-center space-x-12 mb-20 relative z-10"
        >
          {[
            { icon: <Brain className="w-8 h-8" />, text: "AI/ML" },
            { icon: <Zap className="w-8 h-8" />, text: "Innovation" },
            { icon: <Sparkles className="w-8 h-8" />, text: "Creativity" },
            { icon: <Target className="w-8 h-8" />, text: "Precision" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-3"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="p-4 bg-accent/20 backdrop-blur-sm rounded-full text-secondary border border-accent/30">
                {item.icon}
              </div>
              <span className="text-sm text-gray-400 font-medium tracking-wider">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mb-20 relative z-10"
        >
          <Link to="/projects">
            <button className="explore-work-btn">
              <span>EXPLORE MY WORK</span>
              <svg className="btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 15l5-5-5-5M5 10h10" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
          </Link>
        </motion.div>

        {/* Stats - At bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.1 }}
          className="flex justify-center items-center space-x-16 relative z-10"
        >
          {[
            { number: "50+", label: "AI Tools Mastered" },
            { number: "3+", label: "Years Experience" },
            { number: "100%", label: "Client Satisfaction" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-black text-secondary">{stat.number}</div>
              <div className="text-sm text-gray-400 tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
