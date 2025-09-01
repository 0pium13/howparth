import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import analytics from '../utils/analytics';

const FloatingEmojis: React.FC = () => {
  const [draggedEmoji, setDraggedEmoji] = useState<number | null>(null);
  const [particlePositions, setParticlePositions] = useState<{ [key: number]: { x: number; y: number } }>({});
  
  // Emojis that represent AI, creativity, and tech themes
  const emojis = [
    '🤖', '🧠', '⚡', '✨', '🎨', '🚀', '💡', '🔥', '🌟', '🎯',
    '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎮', '🎲', '🎪', '🎨'
  ];

  // Generate random emoji particles
  const emojiParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 100,
    size: Math.random() * 20 + 10, // 10-30px
    duration: Math.random() * 15 + 10, // 10-25 seconds
    delay: Math.random() * 5,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
      {emojiParticles.map((particle) => {
        const currentPosition = particlePositions[particle.id] || { x: particle.x, y: particle.y };
        
        return (
          <motion.div
            key={particle.id}
            className="absolute text-2xl select-none cursor-grab active:cursor-grabbing"
            role="button"
            aria-label={`Interactive ${particle.emoji} emoji - drag to move`}
            tabIndex={0}
            style={{
              left: `${currentPosition.x}%`,
              top: `${currentPosition.y}%`,
              fontSize: `${particle.size}px`,
              zIndex: draggedEmoji === particle.id ? 100 : Math.floor(particle.z / 10) - 10,
              transform: `translateZ(${particle.z}px)`,
            }}
            animate={draggedEmoji === particle.id ? {} : {
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              rotate: [particle.rotation, particle.rotation + 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={draggedEmoji === particle.id ? {} : {
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.5,
              rotate: particle.rotation + 720,
              transition: { duration: 0.3 }
            }}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{
              left: 0,
              right: window.innerWidth - particle.size,
              top: 0,
              bottom: window.innerHeight - particle.size,
            }}
            onDragStart={() => {
              setDraggedEmoji(particle.id);
              analytics.trackEmojiInteraction(particle.emoji, 'drag_start');
            }}
            onDragEnd={(event, info: PanInfo) => {
              setDraggedEmoji(null);
              // Update the particle position in state
              const newX = (info.point.x / window.innerWidth) * 100;
              const newY = (info.point.y / window.innerHeight) * 100;
              setParticlePositions(prev => ({
                ...prev,
                [particle.id]: { x: newX, y: newY }
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Trigger drag simulation for keyboard users
                const rect = e.currentTarget.getBoundingClientRect();
                const newX = (rect.left / window.innerWidth) * 100;
                const newY = (rect.top / window.innerHeight) * 100;
                setParticlePositions(prev => ({
                  ...prev,
                  [particle.id]: { x: newX, y: newY }
                }));
              }
            }}
            whileDrag={{
              scale: 1.8,
              rotate: particle.rotation + 1080,
              zIndex: 100,
            }}
          >
            {particle.emoji}
          </motion.div>
        );
      })}
      
      {/* Additional floating elements for depth */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`depth-${i}`}
          className="absolute w-4 h-4 bg-white/10 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            zIndex: Math.floor(Math.random() * 20) - 10,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 8,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingEmojis;
