import React from 'react';
import { X, Check } from 'lucide-react';
import { useTheme, themeNames, ThemeType } from '../contexts/ThemeContext';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, themes } = useTheme();

  if (!isOpen) return null;

  const themeColors: Record<ThemeType, string> = {
    default: '#7c3aed',
    love: '#ff6b9d',
    sunset: '#ff6b35',
    ocean: '#00d4ff',
    forest: '#00ff88',
    night: '#6366f1',
    pastel: '#f0abfc',
    neon: '#00ff41',
    aurora: '#00ffcc',
    fire: '#ff4500',
    galaxy: '#9d4edd',
    mint: '#98fb98',
    rose: '#ff1493',
    gold: '#ffd700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] rounded-2xl p-6 max-w-md w-full mx-4 glass">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[var(--text-primary)] text-xl font-semibold">
            Choose Theme
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Close theme selector"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => {
                setTheme(theme);
                onClose();
              }}
              className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                currentTheme === theme 
                  ? 'border-[var(--accent-primary)] bg-[var(--bg-tertiary)]' 
                  : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:border-[var(--accent-primary)]'
              }`}
              aria-label={`Select ${themeNames[theme]} theme`}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: themeColors[theme] }}
                />
                <span className="text-[var(--text-primary)] font-medium">
                  {themeNames[theme]}
                </span>
              </div>
              
              {currentTheme === theme && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
          <h3 className="text-[var(--text-primary)] font-medium mb-2">Preview</h3>
          <div className="flex space-x-2">
            <div className="flex-1">
              <div className="bg-[var(--bubble-user)] text-white p-2 rounded-lg text-sm mb-2">
                User message
              </div>
              <div className="bg-[var(--bubble-assistant)] text-[var(--text-primary)] p-2 rounded-lg text-sm">
                AI response
              </div>
            </div>
            <img
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzdjM2FlZDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjM1IiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik0xMDAgMTIwIEMgNjAgMTIwLCA0MCAxNjAsIDQwIDIwMCBMIDE2MCAyMDAgQyAxNjAgMTYwLCAxNDAgMTIwLCAxMDAgMTIwIFoiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iOTAiIGN5PSI3NSIgcj0iNCIgZmlsbD0iIzdjM2FlZCIvPgogIDxjaXJjbGUgY3g9IjExMCIgY3k9Ijc1IiByPSI0IiBmaWxsPSIjN2MzYWVkIi8+CiAgPHBhdGggZD0iTSA4NSA5MCBRIDEwMCAxMDAsIDExNSA5MCIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0gNjUgNTAgUSAxMDAgMzAsIDEzNSA1MCBRIDEzMCA3MCwgMTAwIDYwIFEgNzAgNzAsIDY1IDUwIFoiIGZpbGw9IiMxZjI5MzciLz4KICA8ZWxsaXBzZSBjeD0iOTAiIGN5PSI3NSIgcng9IjEyIiByeT0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8ZWxsaXBzZSBjeD0iMTEwIiBjeT0iNzUiIHJ4PSIxMiIgcnk9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdjM2FlZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjEwMiIgeTE9Ijc1IiB4Mj0iOTgiIHkyPSI3NSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI4IiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSIzMCIgcj0iOCIgZmlsbD0iI2Y1OWUwYiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzAiIGN5PSIxNzAiIHI9IjgiIGZpbGw9IiNlZjQ0NDQiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjE3MCIgY3k9IjE3MCIgcj0iOCIgZmlsbD0iIzNiODJmNiIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPgo="
              alt="Parth"
              className="w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] object-cover"
              onError={(e) => {
                e.currentTarget.style.backgroundColor = themeColors[currentTheme];
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectorModal;
