import React, { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation, Easing } from 'framer-motion';

interface AnimatedTextProps {
  text: string | string[];
  type?: 'word' | 'letter' | 'line';
  delay?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'blur';
  duration?: number;
  ease?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  type = 'word',
  delay = 0,
  stagger = 0.1,
  className = '',
  once = true,
  threshold = 0.1,
  animation = 'fadeIn',
  duration = 0.8,
  ease = 'easeOut'
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once, 
    amount: threshold,
    margin: '-100px 0px -100px 0px'
  });
  const controls = useAnimation();

  const textArray = Array.isArray(text) ? text : [text];

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    };

    switch (animation) {
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 }
        };
      case 'slideDown':
        return {
          hidden: { opacity: 0, y: -50 },
          visible: { opacity: 1, y: 0 }
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 }
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: { opacity: 1, x: 0 }
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        };
      case 'blur':
        return {
          hidden: { opacity: 0, filter: 'blur(10px)' },
          visible: { opacity: 1, filter: 'blur(0px)' }
        };
      default:
        return baseVariants;
    }
  };

  const getEasing = (): Easing => {
    switch (ease) {
      case 'easeIn':
        return [0.4, 0, 1, 1];
      case 'easeOut':
        return [0, 0, 0.2, 1];
      case 'easeInOut':
        return [0.4, 0, 0.2, 1];
      default:
        return [0, 0, 0.2, 1];
    }
  };

  const renderWordByWord = (text: string) => {
    const words = text.split(' ');
    
    return (
      <motion.span
        ref={ref}
        className={className}
        initial="hidden"
        animate={controls}
        variants={getAnimationVariants()}
        transition={{ duration, ease: getEasing() }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-2"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{
              duration: 0.5,
              delay: delay + index * stagger,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    );
  };

  const renderLetterByLetter = (text: string) => {
    const letters = text.split('');
    
    return (
      <motion.span
        ref={ref}
        className={className}
        initial="hidden"
        animate={controls}
        variants={getAnimationVariants()}
        transition={{ duration, ease: getEasing() }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{
              duration: 0.3,
              delay: delay + index * stagger,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </motion.span>
    );
  };

  const renderLineByLine = (textArray: string[]) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={controls}
        variants={getAnimationVariants()}
        transition={{ duration, ease: getEasing() }}
      >
        {textArray.map((line, lineIndex) => (
          <motion.div
            key={lineIndex}
            className="overflow-hidden"
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{
              duration: 0.8,
              delay: delay + lineIndex * stagger,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {type === 'word' ? renderWordByWord(line) : renderLetterByLetter(line)}
          </motion.div>
        ))}
      </motion.div>
    );
  };

  if (type === 'line') {
    return renderLineByLine(textArray);
  }

  return textArray.length > 1 ? renderLineByLine(textArray) : 
    (type === 'word' ? renderWordByWord(textArray[0]) : renderLetterByLetter(textArray[0]));
};

export default AnimatedText;
