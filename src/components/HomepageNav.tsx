import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  User, 
  MessageCircle, 
  LogIn, 
  Search,
  Sparkles,
  Brain,
  Zap,
  Target,
  Award,
  Users
} from 'lucide-react';

const HomepageNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      icon: <Home className="w-6 h-6" />,
      label: "Home",
      path: "/",
      description: "Welcome to HOWPARTH"
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: "Projects",
      path: "/projects",
      description: "View my work"
    },
    {
      icon: <User className="w-6 h-6" />,
      label: "About",
      path: "/about",
      description: "Learn about me"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: "Contact",
      path: "/contact",
      description: "Get in touch"
    },
    {
      icon: <LogIn className="w-6 h-6" />,
      label: "Login",
      path: "/login",
      description: "Access portal"
    }
  ];

  const serviceItems = [
    {
      icon: <Brain className="w-6 h-6" />,
      label: "AI Content",
      description: "AI-powered content creation"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      label: "Creative",
      description: "Creative solutions"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: "Automation",
      description: "Workflow automation"
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: "Strategy",
      description: "Strategic planning"
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: "Quality",
      description: "Premium quality"
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: "Support",
      description: "Client support"
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="bg-primary/95 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      {/* Primary Navigation Bar */}
      <div className="max-w-8xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link to="/" className="text-2xl font-black tracking-wider text-secondary hover:text-gray-300 transition-colors duration-300">
              HOWPARTH
            </Link>
          </motion.div>

          {/* Main Navigation Links */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex items-center space-x-8"
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`relative text-sm font-medium tracking-wider hover:text-gray-300 transition-colors duration-300 ${
                    isActive(item.path) ? 'text-secondary' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          {/* Search and Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center space-x-4"
          >
            <button className="p-2 text-gray-400 hover:text-secondary transition-colors duration-300">
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/contact"
              className="bg-secondary text-primary px-4 py-2 rounded-md font-semibold text-sm tracking-wider hover:bg-gray-300 transition-colors duration-300"
            >
              START PROJECT
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Secondary Navigation Bar - Services */}
      <div className="border-t border-border/30">
        <div className="max-w-8xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-center space-x-8 md:space-x-12 py-3 overflow-x-auto"
          >
            {serviceItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                className="flex flex-col items-center space-y-1 group cursor-pointer flex-shrink-0"
              >
                <div className="p-2 text-gray-400 group-hover:text-secondary transition-colors duration-300">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-secondary transition-colors duration-300 tracking-wider">
                  {item.label}
                </span>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-primary/95 backdrop-blur-lg border border-border rounded-lg px-3 py-2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                  {item.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomepageNav;
