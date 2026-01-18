import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile/tablet device.
 * Uses a combination of screen width and touch capability.
 * Returns false on desktop devices.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check for touch capability and reasonable mobile screen width
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches;

      // Consider mobile if has touch AND is not a large screen
      // This catches phones and tablets but excludes touch-enabled laptops
      setIsMobile(hasTouchScreen && isSmallScreen);
    };

    checkIsMobile();

    // Re-check on resize (for orientation changes, etc.)
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
