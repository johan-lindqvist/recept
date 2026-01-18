import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile/tablet device.
 * Uses screen width to determine if we're in a mobile context.
 * The wake lock feature is only useful on mobile devices anyway.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check for mobile/tablet screen width
      const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches;
      setIsMobile(isSmallScreen);
    };

    checkIsMobile();

    // Re-check on resize (for orientation changes, etc.)
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
