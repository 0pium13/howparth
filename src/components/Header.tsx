import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Users,
  LogOut, 
  Settings, 
  CreditCard,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);


  // Simple navigation items - no tooltips, no hover effects
  const navItems = [
    {
      name: 'Community',
      href: '/community',
      icon: Users
    },
    {
      name: 'Support',
      href: '/support',
      icon: HelpCircle
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageCircle
    }
  ];

  const profileMenuItems = [
    { name: 'View Profile', href: '/profile', icon: User },
    { name: 'API Keys', href: '/profile/keys', icon: CreditCard },
    { name: 'Edit Username', href: '/profile/edit', icon: Settings },
    { name: 'Logout', action: logout, icon: LogOut }
  ];



  const handleProfileMenuClick = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
    }
    setIsProfileMenuOpen(false);
  };

  const handleNavItemClick = (item: any) => {
    navigate(item.href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center ml-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-white cursor-pointer flex items-center justify-start"
              onClick={() => navigate('/')}
            >
              HOWPARTH
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8" role="navigation">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <button
                  onClick={() => handleNavItemClick(item)}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </motion.div>
            ))}

            {/* Profile Menu */}
            {user ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
                  >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/20 rounded-md shadow-lg"
                    >
                      {profileMenuItems.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleProfileMenuClick(item)}
                          className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors duration-200"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center space-x-4"
              >
                <button
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-gray-300 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Sign Up
                </button>
              </motion.div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
                          <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-gray-300 transition-colors duration-200 p-2"
              >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 backdrop-blur-md border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <div key={item.name}>
                  <button
                    onClick={() => handleNavItemClick(item)}
                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-200 w-full text-left py-2"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                </div>
              ))}

              {user ? (
                <div>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-200 w-full text-left py-2"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="ml-6 mt-2 space-y-2">
                      {profileMenuItems.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleProfileMenuClick(item)}
                          className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-200 py-1"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-white hover:text-gray-300 hover:scale-105 transition-all duration-200 py-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 hover:shadow-lg text-white py-2 rounded-md transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
