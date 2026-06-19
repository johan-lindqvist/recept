import { Palette } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

/**
 * Header button that switches between the new (warm light) and old (classic
 * dark) themes. The label shows the theme it will switch to.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const targetLabel = theme === 'new' ? 'Klassiskt' : 'Nytt';
  const label = `Byt till ${targetLabel.toLowerCase()} tema`;

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Palette size={18} />
      <span className="theme-toggle-text">{targetLabel}</span>
    </button>
  );
}
