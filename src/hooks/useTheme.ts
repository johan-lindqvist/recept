import { useState, useEffect, useCallback } from 'react';

export type Theme = 'new' | 'old';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: Theme = 'new';

/** Background color per theme, kept in sync with the CSS theme blocks. */
const THEME_COLORS: Record<Theme, string> = {
  new: '#faf6f0',
  old: '#1a202c',
};

/**
 * Read the saved theme from localStorage, defaulting to the new (light) theme.
 * Matches the inline bootstrap script in index.html that applies the theme
 * before first paint.
 */
function getInitialTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'old' ? 'old' : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Hook to manage the active visual theme ('new' = warm light, 'old' = classic
 * dark). Persists the choice in localStorage and applies it via the
 * `data-theme` attribute on the document element, which drives the CSS
 * variable palette in style.css.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors (e.g. private mode); theme still applies for the session.
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', THEME_COLORS[theme]);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'new' ? 'old' : 'new'));
  }, []);

  return { theme, toggleTheme };
}
