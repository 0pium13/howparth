import React, { useState, useEffect, useRef } from 'react';
import { Settings, MoreVertical, Download } from 'lucide-react';
import ThemeSelectorModal from './ThemeSelectorModal';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  seen?: boolean;
}

interface ChatHeaderProps {
  isTyping: boolean;
  lastSeen?: string;
  profilePhoto?: string;
  messages?: Message[];
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isTyping, 
  lastSeen = "last seen 2m ago",
  profilePhoto = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzdjM2FlZDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjM1IiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik0xMDAgMTIwIEMgNjAgMTIwLCA0MCAxNjAsIDQwIDIwMCBMIDE2MCAyMDAgQyAxNjAgMTYwLCAxNDAgMTIwLCAxMDAgMTIwIFoiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iOTAiIGN5PSI3NSIgcj0iNCIgZmlsbD0iIzdjM2FlZCIvPgogIDxjaXJjbGUgY3g9IjExMCIgY3k9Ijc1IiByPSI0IiBmaWxsPSIjN2MzYWVkIi8+CiAgPHBhdGggZD0iTSA4NSA5MCBRIDEwMCAxMDAsIDExNSA5MCIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0gNjUgNTAgUSAxMDAgMzAsIDEzNSA1MCBRIDEzMCA3MCwgMTAwIDYwIFEgNzAgNzAsIDY1IDUwIFoiIGZpbGw9IiMxZjI5MzciLz4KICA8ZWxsaXBzZSBjeD0iOTAiIGN5PSI3NSIgcng9IjEyIiByeT0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8ZWxsaXBzZSBjeD0iMTEwIiBjeT0iNzUiIHJ4PSIxMiIgcnk9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdjM2FlZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjEwMiIgeTE9Ijc1IiB4Mj0iOTgiIHkyPSI3NSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI4IiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSIzMCIgcj0iOCIgZmlsbD0iI2Y1OWUwYiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzAiIGN5PSIxNzAiIHI9IjgiIGZpbGw9IiNlZjQ0NDQiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjE3MCIgY3k9IjE3MCIgcj0iOCIgZmlsbD0iIzNiODJmNiIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPgo=",
  messages = []
}) => {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getStatusText = () => {
    if (isTyping) return "Parth is typing...";
    return lastSeen;
  };

  const getStatusColor = () => {
    if (isTyping) return "text-[var(--accent-primary)]";
    return "text-[var(--text-secondary)]";
  };

  const exportChat = () => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    const chatContent = messages.map(message => {
      const timestamp = message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sender = message.role === 'user' ? 'You' : 'Parth';
      return `[${timestamp}] ${sender}: ${message.content}`;
    }).join('\n\n');

    const header = `Chat with Parth AI\nExported on ${new Date().toLocaleString()}\n\n`;
    const fullContent = header + chatContent;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-with-parth-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowMenu(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] glass">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={profilePhoto}
              alt="Parth"
              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent-primary)] shadow-lg"
              onError={(e) => {
                // Fallback to default avatar if image fails to load
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237c3aed'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
              }}
            />
            {isTyping && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[var(--accent-primary)] rounded-full border-2 border-[var(--bg-secondary)] animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-[var(--text-primary)] font-semibold text-lg">Parth</h2>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowThemeModal(true)}
            className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Theme settings"
          >
            <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          
          {/* More Options Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-lg z-50 glass">
                <button
                  onClick={exportChat}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors rounded-t-xl"
                >
                  <Download className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-primary)]">Export Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ThemeSelectorModal 
        isOpen={showThemeModal} 
        onClose={() => setShowThemeModal(false)} 
      />
    </>
  );
};

export default ChatHeader;
