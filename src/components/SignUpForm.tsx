import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, XCircle, User, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface SignUpFormProps {
  onSuccess?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    setIsValid(
      formData.username && 
      formData.email && 
      formData.password && 
      formData.confirmPassword && 
      Object.keys(newErrors).length === 0
    );
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) return;

    setIsLoading(true);
    
    try {
      await signUp({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      showSuccess('Account created!', `Welcome to HOWPARTH, ${formData.username}!`);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (error) {
      showError('Sign up failed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputIcon = (field: string) => {
    if (errors[field]) {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
    if (formData[field as keyof typeof formData] && !errors[field]) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    switch (field) {
      case 'username':
        return <User className="w-5 h-5 text-gray-400" />;
      case 'email':
        return <Mail className="w-5 h-5 text-gray-400" />;
      case 'password':
      case 'confirmPassword':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Join HOWPARTH
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-400"
          >
            Create your account to get started
          </motion.p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getInputIcon('username')}
              </div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                  transition-all duration-200
                  ${errors.username ? 'border-red-500' : 'border-gray-600'}
                  ${formData.username && !errors.username ? 'border-green-500' : ''}
                `}
                placeholder="Choose a username"
                required
              />
            </div>
            <AnimatePresence>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-400"
                >
                  {errors.username}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getInputIcon('email')}
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`
                  w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                  transition-all duration-200
                  ${errors.email ? 'border-red-500' : 'border-gray-600'}
                  ${formData.email && !errors.email ? 'border-green-500' : ''}
                `}
                placeholder="Enter your email"
                required
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-400"
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getInputIcon('password')}
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`
                  w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                  transition-all duration-200
                  ${errors.password ? 'border-red-500' : 'border-gray-600'}
                  ${formData.password && !errors.password ? 'border-green-500' : ''}
                `}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Password strength:</span>
                  <span className={`text-xs font-medium ${getStrengthColor(passwordStrength).replace('bg-', 'text-')}`}>
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        level <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-400"
                >
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getInputIcon('confirmPassword')}
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`
                  w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                  transition-all duration-200
                  ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'}
                  ${formData.confirmPassword && !errors.confirmPassword ? 'border-green-500' : ''}
                `}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm text-red-400"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            type="submit"
            disabled={!isValid || isLoading}
            className={`
              w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white
              transition-all duration-300 transform
              ${isValid && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105'
                : 'bg-gray-700 cursor-not-allowed'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
            `}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
