import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'claude';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme');
      if (saved === 'dark' || saved === 'claude') {
        return saved;
      }
    }
    return 'dark'; // Default theme
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove old theme attribute
    root.removeAttribute('data-theme');
    
    // Apply new theme
    requestAnimationFrame(() => {
      root.setAttribute('data-theme', theme);
    });
    
    // Save to localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
