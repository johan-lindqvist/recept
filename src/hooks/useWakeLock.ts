import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to manage Screen Wake Lock API for keeping the screen awake.
 * Useful when users are cooking and need to reference the recipe.
 *
 * @returns Object with:
 *   - isActive: whether wake lock is currently active
 *   - isSupported: whether the browser supports wake lock
 *   - toggle: function to toggle wake lock on/off
 *   - error: any error that occurred
 */
export function useWakeLock() {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  // Request wake lock
  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      setError('Wake Lock API stöds inte i denna webbläsare');
      return false;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsActive(true);
      setError(null);

      // Listen for release events (e.g., when tab becomes hidden)
      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false);
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Okänt fel';
      setError(message);
      setIsActive(false);
      return false;
    }
  }, []);

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Okänt fel';
        setError(message);
      }
    }
  }, []);

  // Toggle wake lock
  const toggle = useCallback(async () => {
    if (isActive) {
      await releaseWakeLock();
    } else {
      await requestWakeLock();
    }
  }, [isActive, requestWakeLock, releaseWakeLock]);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, requestWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  return {
    isActive,
    isSupported,
    toggle,
    error,
  };
}
