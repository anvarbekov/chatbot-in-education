'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('medium');
  const [language, setLanguage] = useState('uz');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.theme) setTheme(settings.theme);
        if (settings.fontSize) setFontSize(settings.fontSize);
        if (settings.language) setLanguage(settings.language);
        if (settings.sidebarCollapsed !== undefined) setSidebarCollapsed(settings.sidebarCollapsed);
        if (settings.notificationsEnabled !== undefined) setNotificationsEnabled(settings.notificationsEnabled);
        if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
        if (settings.autoPlay !== undefined) setAutoPlay(settings.autoPlay);
      }
    } catch {}
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('light-theme', !prefersDark);
      root.classList.toggle('dark-theme', prefersDark);
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
  }, [theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm-base', 'text-md-base', 'text-lg-base');
    if (fontSize === 'small') root.classList.add('text-sm-base');
    else if (fontSize === 'large') root.classList.add('text-lg-base');
    else root.classList.add('text-md-base');
  }, [fontSize]);

  const saveSettings = (newSettings) => {
    try {
      const current = JSON.parse(localStorage.getItem('app_settings') || '{}');
      localStorage.setItem('app_settings', JSON.stringify({ ...current, ...newSettings }));
    } catch {}
  };

  const updateTheme = (val) => { setTheme(val); saveSettings({ theme: val }); };
  const updateFontSize = (val) => { setFontSize(val); saveSettings({ fontSize: val }); };
  const updateLanguage = (val) => { setLanguage(val); saveSettings({ language: val }); };
  const updateSidebarCollapsed = (val) => { setSidebarCollapsed(val); saveSettings({ sidebarCollapsed: val }); };
  const updateNotifications = (val) => { setNotificationsEnabled(val); saveSettings({ notificationsEnabled: val }); };
  const updateSound = (val) => { setSoundEnabled(val); saveSettings({ soundEnabled: val }); };
  const updateAutoPlay = (val) => { setAutoPlay(val); saveSettings({ autoPlay: val }); };

  const resetSettings = () => {
    updateTheme('dark');
    updateFontSize('medium');
    updateLanguage('uz');
    updateSidebarCollapsed(false);
    updateNotifications(true);
    updateSound(true);
    updateAutoPlay(false);
    localStorage.removeItem('app_settings');
  };

  return (
    <ThemeContext.Provider value={{
      theme, setTheme: updateTheme,
      fontSize, setFontSize: updateFontSize,
      language, setLanguage: updateLanguage,
      sidebarCollapsed, setSidebarCollapsed: updateSidebarCollapsed,
      notificationsEnabled, setNotificationsEnabled: updateNotifications,
      soundEnabled, setSoundEnabled: updateSound,
      autoPlay, setAutoPlay: updateAutoPlay,
      resetSettings,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
