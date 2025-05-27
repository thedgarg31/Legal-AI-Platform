import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('legalchat-theme');
    return savedTheme ? JSON.parse(savedTheme) : true; // Default to dark mode
  });

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('legalchat-theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Global theme colors
  const theme = {
    dark: {
      primary: '#1a1a1a',
      secondary: '#2d2d30',
      tertiary: '#3e3e42',
      accent: '#007acc',
      accentHover: '#106ebe',
      text: '#cccccc',
      textSecondary: '#969696',
      border: '#464647',
      success: '#4caf50',
      danger: '#f44336',
      warning: '#ff9800',
      messageOwn: '#007acc',
      messageOther: '#3e3e42',
      sidebar: '#252526',
      header: '#2d2d30',
      card: '#2d2d30',
      cardHover: '#3e3e42'
    },
    light: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#e9ecef',
      accent: '#0066cc',
      accentHover: '#0052a3',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      messageOwn: '#0066cc',
      messageOther: '#e9ecef',
      sidebar: '#f8f9fa',
      header: '#ffffff',
      card: '#ffffff',
      cardHover: '#f8f9fa'
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleTheme,
      theme: currentTheme,
      colors: theme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
