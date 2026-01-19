import { useState, useEffect } from 'react';
import { ChefHat, X } from 'lucide-react';

const HINT_STORAGE_KEY = 'cookingModeHintDismissed';

interface CookingModeButtonProps {
  onClick: () => void;
  variant?: 'header' | 'fab';
  showHint?: boolean;
}

export function CookingModeButton({ onClick, variant = 'header', showHint = false }: CookingModeButtonProps) {
  const [isVisible, setIsVisible] = useState(variant === 'header');
  const [hintVisible, setHintVisible] = useState(false);

  // Check if hint should be shown (only for header variant on first visit)
  useEffect(() => {
    if (variant !== 'header' || !showHint) return;

    const dismissed = localStorage.getItem(HINT_STORAGE_KEY);
    if (!dismissed) {
      // Small delay so the hint appears after page loads
      const timer = setTimeout(() => setHintVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [variant, showHint]);

  const dismissHint = () => {
    setHintVisible(false);
    localStorage.setItem(HINT_STORAGE_KEY, 'true');
  };

  const handleClick = () => {
    if (hintVisible) {
      dismissHint();
    }
    onClick();
  };

  // For FAB variant, show when scrolled past the header
  useEffect(() => {
    if (variant !== 'fab') return;

    const handleScroll = () => {
      const scrollThreshold = 300; // Show FAB after scrolling 300px
      setIsVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [variant]);

  if (variant === 'fab') {
    return (
      <button
        type="button"
        className={`cooking-mode-fab ${isVisible ? 'visible' : ''}`}
        onClick={onClick}
        aria-label="Tillagningsläge"
      >
        <ChefHat size={24} />
      </button>
    );
  }

  return (
    <div className="cooking-mode-btn-container">
      <button
        type="button"
        className="cooking-mode-btn"
        onClick={handleClick}
      >
        <ChefHat size={20} />
        <span>Tillagningsläge</span>
      </button>
      {hintVisible && (
        <div className="cooking-mode-hint">
          <p>Följ receptet steg för steg och bocka av ingredienser medan du lagar mat!</p>
          <button
            type="button"
            className="cooking-mode-hint-close"
            onClick={dismissHint}
            aria-label="Stäng tips"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
