import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  /** Manual switch from the header toggle */
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  /** Car lights — always mirrors the theme: dark mode = lights on, light mode = lights off */
  lightsOn: boolean;
  setLightsOn: (on: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  // single source of truth: the lights are on exactly when the page is dark
  const lightsOn = theme === 'dark';

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), []);
  const setLightsOn = useCallback((on: boolean) => setThemeState(on ? 'dark' : 'light'), []);

  // Apply the theme to <html>; a short-lived class makes every colour glide instead of snapping
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    const t = window.setTimeout(() => root.classList.remove('theme-transition'), 700);
    return () => window.clearTimeout(t);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, lightsOn, setLightsOn }),
    [theme, setTheme, toggleTheme, lightsOn, setLightsOn]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
