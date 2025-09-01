import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  User, 
  MessageCircle, 
  LogIn, 
  Brain,
  Zap,
  Users,
  Menu
} from 'lucide-react';

const HomepageNav: React.FC = () => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const navigate = useNavigate();
  
  const serviceItems = [
    {
      icon: <Brain className="w-6 h-6" />,
      label: "AI",
      path: "/blog"
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: "Support",
      path: "/support"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: "Chat",
      path: "/chat"
    },
    {
      icon: <User className="w-6 h-6" />,
      label: "Profile",
      path: "/profile/settings"
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

          {/* Menu Icon with Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <button
              ref={buttonRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 text-gray-400 hover:text-secondary transition-colors duration-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  {/* Navigation Items */}
                  <div className="py-2">
                    {navItems.map((item, index) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium tracking-wider hover:bg-white/10 transition-all duration-200 ${
                          isActive(item.path) 
                            ? 'text-secondary bg-white/5 border-r-2 border-secondary' 
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <span className="text-gray-400 group-hover:text-secondary transition-colors duration-200">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-white/10 mx-4"></div>
                  
                  {/* Quick Actions */}
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Quick Actions
                    </div>
                    <div className="flex items-center justify-around px-4 py-2">
                      <button className="text-xs text-gray-400 hover:text-secondary transition-colors duration-200">
                        Settings
                      </button>
                      <button className="text-xs text-gray-400 hover:text-secondary transition-colors duration-200">
                        Help
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>


        </div>
      </div>

      {/* Secondary Navigation Bar - Services */}
      <div className="border-t border-border/30 w-full">
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
                className="flex flex-col items-center space-y-1 group cursor-pointer flex-shrink-0 hover:scale-105 transition-transform duration-200"
                onClick={() => navigate(item.path)}
            >
                <div className="p-2 text-purple-400">
                    {item.icon}
                </div>
                <span className="text-xs font-medium tracking-wider text-white">
                    {item.label}
                </span>
 
            </motion.div>
        ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomepageNav;
