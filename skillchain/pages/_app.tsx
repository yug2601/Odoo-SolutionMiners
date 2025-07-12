import type { AppProps } from 'next/app';
import React, { useState, useEffect, createContext } from 'react';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';

// Theme context
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export { ThemeContext };