import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 
  | 'default' | 'love' | 'sunset' | 'ocean' | 'forest' | 'night' | 'pastel' 
  | 'neon' | 'aurora' | 'fire' | 'galaxy' | 'mint' | 'rose' | 'gold';

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: ThemeType[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: ThemeType[] = [
  'default', 'love', 'sunset', 'ocean', 'forest', 'night', 'pastel',
  'neon', 'aurora', 'fire', 'galaxy', 'mint', 'rose', 'gold'
];

export const themeNames: Record<ThemeType, string> = {
  default: 'Dark',
  love: 'Love',
  sunset: 'Sunset',
  ocean: 'Ocean',
  forest: 'Forest',
  night: 'Night',
  pastel: 'Pastel',
  neon: 'Neon',
  aurora: 'Aurora',
  fire: 'Fire',
  galaxy: 'Galaxy',
  mint: 'Mint',
  rose: 'Rose',
  gold: 'Gold'
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('howparth-theme') as ThemeType;
    if (savedTheme && themes.includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', currentTheme);
    // Save to localStorage
    localStorage.setItem('howparth-theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
