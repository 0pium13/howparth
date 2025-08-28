import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();
  const { isAuthenticated } = useAuth();
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'WORK', path: '/projects' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <motion.header
      style={{
        opacity: headerOpacity,
        backdropFilter: `blur(${headerBlur}px)`,
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary/95 border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo - Centered on mobile, left on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 lg:flex-shrink-0 lg:order-1 order-2 lg:order-none"
          >
            <Link to="/" className="text-xl md:text-2xl font-black tracking-wider hover:text-gray-300 transition-colors duration-300">
              HOWPARTH
            </Link>
          </motion.div>

          {/* Search Icon - Only visible on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:hidden order-3"
          >
            <button className="p-2 text-secondary hover:text-gray-300 transition-colors duration-300">
              <Search size={20} />
            </button>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex items-center space-x-8 xl:space-x-12"
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
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
              </motion.div>
            ))}
            
            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Link
                to="/login"
                className={`relative text-sm font-medium tracking-wider hover:text-gray-300 transition-colors duration-300 ${
                  isActive('/login') ? 'text-secondary' : 'text-gray-400'
                }`}
              >
                LOGIN
                {isActive('/login') && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          </motion.nav>

          {/* CTA Button or Profile Dropdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden lg:block"
          >
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Link
                to="/contact"
                className="bg-black text-white px-6 py-3 rounded-md font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300"
              >
                START PROJECT
              </Link>
            )}
          </motion.div>

                      {/* Mobile Menu Button or Profile */}
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden order-1"
              >
                <ProfileDropdown isMobile />
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden p-2 text-secondary hover:text-gray-300 transition-colors duration-300 order-1"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            )}
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            height: isOpen ? 'auto' : 0,
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 md:py-6 space-y-3 md:space-y-4 border-t border-border mt-4 md:mt-6">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`block text-lg font-medium tracking-wider hover:text-gray-300 transition-colors duration-300 ${
                    isActive(item.path) ? 'text-secondary' : 'text-gray-400'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            
            {/* Mobile Login/Signup Links */}
            {!isAuthenticated && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Link
                    to="/login"
                    className={`block text-lg font-medium tracking-wider hover:text-gray-300 transition-colors duration-300 ${
                      isActive('/login') ? 'text-secondary' : 'text-gray-400'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    LOGIN
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Link
                    to="/signup"
                    className={`block text-lg font-medium tracking-wider hover:text-gray-300 transition-colors duration-300 ${
                      isActive('/signup') ? 'text-secondary' : 'text-gray-400'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    SIGN UP
                  </Link>
                </motion.div>
              </>
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="pt-4"
            >
              <Link
                to="/contact"
                className="bg-black text-white px-6 py-3 rounded-md font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300 block text-center"
                onClick={() => setIsOpen(false)}
              >
                START PROJECT
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
