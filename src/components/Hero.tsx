import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, MessageCircle, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      // You can fetch user data here if needed
    }
  }, []);

  const featureIcons = [
    { icon: Brain, label: 'AI', color: 'text-blue-400', route: '/ai-portal' },
    { icon: Zap, label: 'Support', color: 'text-blue-400', route: '/contact' },
    { icon: MessageCircle, label: 'Chat', color: 'text-blue-400', route: '/chat' },
    { icon: User, label: 'Profile', color: 'text-blue-400', route: isAuthenticated ? '/profile' : '/login' }
  ];

  const stats = [
    { value: '50+', label: 'AI Tools Mastered' },
    { value: '3+', label: 'Years Experience' },
    { value: '100%', label: 'Client Satisfaction' }
  ];

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ background: 'linear-gradient(to bottom, #000000, #1c0f2b, #07030d)' }}>
      {/* Main Hero Content */}
      <div className="flex flex-col justify-center items-center text-center px-6">
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-wider text-white mb-12 font-sans"
        >
          HOWPARTH
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-400 mb-16 max-w-4xl leading-relaxed font-light text-center font-sans"
        >
          {isAuthenticated && user ? (
            <>
              Welcome, <span className="text-purple-400 font-medium">{user.username}</span>!{' '}
              Ready to transform ideas into reality with cutting-edge{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">artificial intelligence</span>
            </>
          ) : (
            <>
              Transforming ideas into reality with cutting-edge{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-medium">artificial intelligence</span>
            </>
          )}
        </motion.p>

        {/* Feature Icons - Bottom Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center space-x-8 md:space-x-12 lg:space-x-16 mb-20"
        >
          {featureIcons.map((feature, index) => (
            <div key={`bottom-${feature.label}`} className="flex flex-col items-center">
              <button
                onClick={() => navigate(feature.route)}
                className="w-12 h-12 rounded-full bg-purple-900/50 border border-purple-400/30 flex items-center justify-center mb-2 hover:bg-purple-800/70 transition-colors cursor-pointer"
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </button>
              <span className="text-white text-xs md:text-sm font-medium tracking-wider text-center font-sans">{feature.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={() => navigate('/projects')}
          className="px-8 py-4 text-white border border-white rounded-md hover:bg-white hover:text-black transition-colors flex items-center space-x-2 mb-24 font-sans text-sm tracking-wider cursor-pointer"
        >
          <span>EXPLORE MY WORK</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center space-x-12 md:space-x-16 lg:space-x-20"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-secondary mb-1 font-sans">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-400 tracking-wider text-center font-sans">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
