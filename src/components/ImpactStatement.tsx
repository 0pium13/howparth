import React from 'react';
import { motion, useInView } from 'framer-motion';

const ImpactStatement: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
    margin: '-100px 0px -100px 0px'
  });

  return (
    <section className="impact-statement">
      <div className="impact-container">
        {/* Purple Lines */}
        <div className="impact-lines">
          <div className="line-purple-1"></div>
          <div className="line-purple-2"></div>
        </div>

        {/* Main Content */}
        <motion.div
          ref={ref}
          className="impact-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="impact-text">
            IT'S NOT JUST ABOUT{' '}
            <span className="highlight-gradient">CREATING CONTENT</span>
            {' '}— IT'S ABOUT MAKING IT{' '}
            <span className="highlight-gradient">INTELLIGENT</span>
          </h2>
        </motion.div>

        {/* Visual Elements */}
        <div className="impact-visual">
          <motion.div
            className="floating-orb"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.8 }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
          <div className="grid-overlay"></div>
        </div>
      </div>
    </section>
  );
};

export default ImpactStatement;
