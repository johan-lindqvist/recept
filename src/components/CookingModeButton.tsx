import { useState, useEffect } from 'react';
import { ChefHat } from 'lucide-react';

interface CookingModeButtonProps {
  onClick: () => void;
  variant?: 'header' | 'fab';
}

export function CookingModeButton({ onClick, variant = 'header' }: CookingModeButtonProps) {
  const [isVisible, setIsVisible] = useState(variant === 'header');

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
        aria-label="Börja laga"
      >
        <ChefHat size={24} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="cooking-mode-btn"
      onClick={onClick}
    >
      <ChefHat size={20} />
      <span>Börja laga</span>
    </button>
  );
}
