import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/30';
      case 'error':
        return 'bg-red-900/90 border-red-500/30';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/30';
      case 'info':
        return 'bg-blue-900/90 border-blue-500/30';
      default:
        return 'bg-gray-900/90 border-gray-500/30';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: -50, 
            scale: 0.95,
            x: '100%'
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            x: 0
          }}
          exit={{ 
            opacity: 0, 
            y: -20, 
            scale: 0.95,
            x: '100%'
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3
          }}
          className={`
            fixed top-4 right-4 z-50 max-w-sm w-full
            ${getBackgroundColor()}
            border backdrop-blur-xl rounded-2xl shadow-2xl
            transform transition-all duration-300 ease-out
          `}
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white leading-5">
                  {title}
                </h4>
                {message && (
                  <p className="mt-1 text-sm text-gray-300 leading-5">
                    {message}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose(id), 300);
                }}
                className="flex-shrink-0 ml-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <motion.div
            className="h-1 bg-white/20 rounded-b-2xl"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ 
              duration: duration / 1000, 
              ease: "linear" 
            }}
            style={{ transformOrigin: 'left' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast manager
interface ToastManagerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id, onClose: removeToast };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
