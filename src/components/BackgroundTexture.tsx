import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BackgroundTexture: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <>
      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          opacity: 0.3,
        }}
      />

      {/* Subtle Grid Lines */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'translate3d(0, 0, 0)',
        }}
      />

      {/* Dynamic Gradient Orbs */}
      {!reducedMotion && (
        <>
          {/* Orb 1 - Purple */}
          <motion.div
            className="fixed pointer-events-none z-0"
            style={{
              width: '600px',
              height: '600px',
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.03) 0%, rgba(124, 58, 237, 0.01) 50%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              top: '10%',
              left: '20%',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Orb 2 - Blue */}
          <motion.div
            className="fixed pointer-events-none z-0"
            style={{
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.02) 0%, rgba(6, 182, 212, 0.005) 50%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
              top: '60%',
              right: '10%',
            }}
            animate={{
              x: [0, -150, 0],
              y: [0, 100, 0],
              rotate: [0, -360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Orb 3 - Mixed */}
          <motion.div
            className="fixed pointer-events-none z-0"
            style={{
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.02) 0%, rgba(6, 182, 212, 0.01) 50%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(50px)',
              bottom: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            animate={{
              x: [0, 80, 0],
              y: [0, -80, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </>
      )}

      {/* Subtle Vignette Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.1) 70%, rgba(0, 0, 0, 0.3) 100%)',
        }}
      />
    </>
  );
};

export default BackgroundTexture;
