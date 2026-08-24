import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContextValue';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The inline head script resolves saved/system preference before first paint.
  // Reading that class here guarantees React and the loader start on the same theme.
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
