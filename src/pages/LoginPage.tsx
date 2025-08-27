import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BackgroundTexture from '../components/BackgroundTexture';
import ThreeDParticles from '../components/ThreeDParticles';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate authentication logic
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative">
      <BackgroundTexture />
      <ThreeDParticles />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-dark-purple/20 backdrop-blur-lg rounded-lg shadow-xl border border-border relative z-10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500/20 before:to-blue-500/20 before:rounded-lg before:blur-xl before:-z-10 before:scale-110"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl font-bold text-white mb-6 text-center tracking-wider"
        >
          Login to HOWPARTH
        </motion.h2>
        
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <label className="block">
              <span className="text-white text-sm font-medium tracking-wider">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full p-3 rounded-md bg-black/50 border border-border text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </label>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <label className="block">
              <span className="text-white text-sm font-medium tracking-wider">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full p-3 rounded-md bg-black/50 border border-border text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your password"
              />
            </label>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            type="submit"
            className="w-full py-3 mt-6 font-semibold text-white rounded-md border-2 border-accent hover:bg-accent hover:text-primary transition-all duration-300 tracking-wider"
          >
            Sign In
          </motion.button>
        </motion.form>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 text-sm text-gray-400 text-center"
        >
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent underline hover:text-accent-secondary transition-colors duration-300">
            Sign Up
          </Link>
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-6 text-center"
        >
          <Link
            to="/"
            className="text-gray-500 hover:text-white transition-colors duration-300 text-sm tracking-wider"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
