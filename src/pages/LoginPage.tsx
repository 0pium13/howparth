import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BackgroundTexture from '../components/BackgroundTexture';
import ThreeDParticles from '../components/ThreeDParticles';
import { LoginForm } from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative">
      <BackgroundTexture />
      <ThreeDParticles />
      
      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 text-center"
        >
          <Link
            to="/"
            className="text-gray-500 hover:text-white transition-colors duration-300 text-sm tracking-wider"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
