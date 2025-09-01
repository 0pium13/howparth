import React from 'react';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  seen?: boolean;
  timestamp?: string;
  profilePhoto?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  content, 
  role, 
  seen = false, 
  timestamp,
  profilePhoto = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzdjM2FlZDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjM1IiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik0xMDAgMTIwIEMgNjAgMTIwLCA0MCAxNjAsIDQwIDIwMCBMIDE2MCAyMDAgQyAxNjAgMTYwLCAxNDAgMTIwLCAxMDAgMTIwIFoiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iOTAiIGN5PSI3NSIgcj0iNCIgZmlsbD0iIzdjM2FlZCIvPgogIDxjaXJjbGUgY3g9IjExMCIgY3k9Ijc1IiByPSI0IiBmaWxsPSIjN2MzYWVkIi8+CiAgPHBhdGggZD0iTSA4NSA5MCBRIDEwMCAxMDAsIDExNSA5MCIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0gNjUgNTAgUSAxMDAgMzAsIDEzNSA1MCBRIDEzMCA3MCwgMTAwIDYwIFEgNzAgNzAsIDY1IDUwIFoiIGZpbGw9IiMxZjI5MzciLz4KICA8ZWxsaXBzZSBjeD0iOTAiIGN5PSI3NSIgcng9IjEyIiByeT0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8ZWxsaXBzZSBjeD0iMTEwIiBjeT0iNzUiIHJ4PSIxMiIgcnk9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdjM2FlZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjEwMiIgeTE9Ijc1IiB4Mj0iOTgiIHkyPSI3NSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI4IiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSIzMCIgcj0iOCIgZmlsbD0iI2Y1OWUwYiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzAiIGN5PSIxNzAiIHI9IjgiIGZpbGw9IiNlZjQ0NDQiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjE3MCIgY3k9IjE3MCIgcj0iOCIgZmlsbD0iIzNiODJmNiIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPgo="
}) => {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end space-x-2 max-w-[70%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isUser && (
          <img
            src={profilePhoto}
            alt="Parth"
            className="w-6 h-6 rounded-full object-cover border border-[var(--border-color)] shadow-sm"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237c3aed'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
            }}
          />
        )}
        
        <div className="relative">
          <div
            className={`px-4 py-3 rounded-2xl max-w-full break-words ${
              isUser
                ? 'bg-[var(--bubble-user)] text-white rounded-br-md'
                : 'bg-[var(--bubble-assistant)] text-[var(--text-primary)] rounded-bl-md'
            }`}
          >
            <div className="whitespace-pre-wrap">{content}</div>
          </div>
          
          {/* Seen Receipt */}
          {isUser && seen && (
            <div className="flex items-center justify-end mt-1 space-x-1">
              <span className="text-xs text-[var(--text-secondary)]">✔</span>
              <span className="text-xs text-[var(--text-secondary)]">Seen</span>
            </div>
          )}
          
          {/* Timestamp */}
          {timestamp && (
            <div className={`text-xs text-[var(--text-secondary)] mt-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}>
              {timestamp}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
