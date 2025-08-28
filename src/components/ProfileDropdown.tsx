import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Edit3, 
  Camera,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface ProfileDropdownProps {
  isMobile?: boolean;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isMobile = false }) => {
  const { user, logout, updateUsername } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingUsername && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingUsername]);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate('/');
    } catch (error) {
      showError('Failed to logout', 'Please try again');
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      setIsEditingUsername(false);
      setNewUsername(user?.username || '');
      return;
    }

    try {
      await updateUsername(newUsername);
      showSuccess('Username updated successfully');
      setIsEditingUsername(false);
    } catch (error) {
      showError('Failed to update username', error instanceof Error ? error.message : 'Please try again');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showError('Invalid file type', 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showError('File too large', 'Please select an image smaller than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    
    try {
      // Convert to base64 for demo (in production, upload to server)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        // await updateProfile({ avatar: base64 });
        showSuccess('Avatar updated successfully');
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showError('Failed to upload avatar', 'Please try again');
      setIsUploadingAvatar(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  };

  if (isMobile) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(user?.username || 'U')
            )}
          </div>
          <span className="text-white font-medium text-sm hidden sm:block">
            {user?.username}
          </span>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(user?.username || 'U')
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                      <Camera className="w-3 h-3 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditingUsername ? (
                      <div className="flex items-center space-x-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUsernameUpdate();
                            if (e.key === 'Escape') {
                              setIsEditingUsername(false);
                              setNewUsername(user?.username || '');
                            }
                          }}
                          className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={handleUsernameUpdate}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingUsername(false);
                            setNewUsername(user?.username || '');
                          }}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium text-sm truncate">
                          {user?.username}
                        </span>
                        <button
                          onClick={() => setIsEditingUsername(true)}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                {[
                  {
                    icon: <User className="w-4 h-4" />,
                    label: 'View Profile',
                    onClick: () => {
                      setIsOpen(false);
                      navigate('/profile');
                    },
                  },
                  {
                    icon: <Settings className="w-4 h-4" />,
                    label: 'Settings',
                    onClick: () => {
                      setIsOpen(false);
                      navigate('/settings');
                    },
                  },
                  {
                    icon: <LogOut className="w-4 h-4" />,
                    label: 'Log Out',
                    onClick: handleLogout,
                    className: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
                  },
                ].map((item, index) => (
                  <motion.button
                    key={item.label}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={item.onClick}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200 ${item.className || ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(user?.username || 'U')
          )}
        </div>
        <span className="text-white font-medium text-sm">
          {user?.username}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user?.username || 'U')
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  {isEditingUsername ? (
                    <div className="flex items-center space-x-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUsernameUpdate();
                          if (e.key === 'Escape') {
                            setIsEditingUsername(false);
                            setNewUsername(user?.username || '');
                          }
                        }}
                        className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleUsernameUpdate}
                        className="p-1 text-green-400 hover:text-green-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingUsername(false);
                          setNewUsername(user?.username || '');
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium text-sm truncate">
                        {user?.username}
                      </span>
                      <button
                        onClick={() => setIsEditingUsername(true)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              {[
                {
                  icon: <User className="w-4 h-4" />,
                  label: 'View Profile',
                  onClick: () => {
                    setIsOpen(false);
                    navigate('/profile');
                  },
                },
                {
                  icon: <Settings className="w-4 h-4" />,
                  label: 'Settings',
                  onClick: () => {
                    setIsOpen(false);
                    navigate('/settings');
                  },
                },
                {
                  icon: <LogOut className="w-4 h-4" />,
                  label: 'Log Out',
                  onClick: handleLogout,
                  className: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
                },
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={item.onClick}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200 ${item.className || ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
