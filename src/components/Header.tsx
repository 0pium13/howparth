import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Updated navigation with 4 main items
  const navItems = [
    { name: 'AI', path: '/ai', subItems: [
      { name: 'Blogs', path: '/ai/blogs' },
      { name: 'Strategy', path: '/ai/strategy' },
      { name: 'Quality', path: '/ai/quality' }
    ]},
    { name: 'Support', path: '/support' },
    { name: 'Chat', path: '/chat' }
  ];

  const profileMenuItems = [
    { name: 'Settings', icon: Settings, path: '/profile/settings' },
    { name: 'Billing', icon: CreditCard, path: '/profile/billing' },
    { name: 'Logout', icon: LogOut, action: handleLogout }
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-gray-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Link
              to="/"
              className="text-2xl font-black text-white tracking-wider hover:text-gray-300 transition-colors duration-300"
            >
              HOWPARTH
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="relative group"
              >
                {item.subItems ? (
                  // Dropdown menu for AI section
                  <div className="relative">
                    <button
                      className={`flex items-center space-x-1 text-sm font-medium tracking-wider transition-colors duration-300 ${
                        isActive(item.path) ? 'text-secondary' : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                      >
                        <div className="py-2">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                isActive(subItem.path)
                                  ? 'text-secondary bg-gray-800/50'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ) : (
                  // Regular navigation item
                  <Link
                    to={item.path}
                    className={`relative text-sm font-medium tracking-wider transition-colors duration-300 ${
                      isActive(item.path) ? 'text-secondary' : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {item.name}
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Right side - Profile/Auth */}
          <div className="flex items-center space-x-4">
            
            {/* Search Icon - Mobile Only */}
            <button className="lg:hidden p-2 text-gray-400 hover:text-gray-300 transition-colors duration-300">
              <Search className="w-5 h-5" />
            </button>

            {/* Profile Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-xl"
                    >
                      <div className="py-2">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-700/50">
                          <p className="text-sm font-medium text-white">{user?.username}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>

                        {/* Menu Items */}
                        {profileMenuItems.map((menuItem) => (
                          <div key={menuItem.name}>
                            {menuItem.action ? (
                              <button
                                onClick={menuItem.action}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/30 transition-colors duration-200"
                              >
                                <menuItem.icon className="w-4 h-4" />
                                <span>{menuItem.name}</span>
                              </button>
                            ) : (
                              <Link
                                to={menuItem.path}
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/30 transition-colors duration-200"
                              >
                                <menuItem.icon className="w-4 h-4" />
                                <span>{menuItem.name}</span>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Auth buttons for non-authenticated users
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <Link
                    to="/login"
                    className="text-sm font-medium tracking-wider text-gray-400 hover:text-gray-300 transition-colors duration-300"
                  >
                    LOGIN
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium tracking-wider rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300"
                  >
                    SIGN UP
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-300 transition-colors duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-gray-800/50"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.subItems ? (
                      // Mobile dropdown for AI section
                      <div className="space-y-2">
                        <div className="px-4 py-2 text-sm font-medium text-gray-400">
                          {item.name}
                        </div>
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className={`block px-8 py-2 text-sm transition-colors duration-200 ${
                              isActive(subItem.path)
                                ? 'text-secondary bg-gray-800/30'
                                : 'text-gray-300 hover:text-white hover:bg-gray-800/20'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          isActive(item.path)
                            ? 'text-secondary bg-gray-800/30'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/20'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
