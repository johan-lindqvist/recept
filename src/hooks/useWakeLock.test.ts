import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWakeLock } from './useWakeLock';

describe('useWakeLock', () => {
  const mockRelease = vi.fn().mockResolvedValue(undefined);
  const mockWakeLockSentinel = {
    released: false,
    type: 'screen' as const,
    release: mockRelease,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onrelease: null,
    dispatchEvent: vi.fn(),
  };

  const mockRequest = vi.fn().mockResolvedValue(mockWakeLockSentinel);

  beforeEach(() => {
    vi.clearAllMocks();
    mockRelease.mockResolvedValue(undefined);
    mockRequest.mockResolvedValue(mockWakeLockSentinel);
  });

  afterEach(() => {
    // Restore original navigator
    vi.unstubAllGlobals();
  });

  describe('when Wake Lock API is not supported', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', {});
    });

    it('should report isSupported as false', () => {
      const { result } = renderHook(() => useWakeLock());

      expect(result.current.isSupported).toBe(false);
      expect(result.current.isActive).toBe(false);
    });

    it('should set error when trying to toggle without support', async () => {
      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.error).toBe('Wake Lock API stöds inte i denna webbläsare');
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('when Wake Lock API is supported', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', {
        wakeLock: {
          request: mockRequest,
        },
      });
    });

    it('should report isSupported as true', () => {
      const { result } = renderHook(() => useWakeLock());

      expect(result.current.isSupported).toBe(true);
      expect(result.current.isActive).toBe(false);
    });

    it('should activate wake lock when toggle is called', async () => {
      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockRequest).toHaveBeenCalledWith('screen');
      expect(result.current.isActive).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should deactivate wake lock when toggle is called while active', async () => {
      const { result } = renderHook(() => useWakeLock());

      // First activate
      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isActive).toBe(true);

      // Then deactivate
      await act(async () => {
        await result.current.toggle();
      });

      expect(mockRelease).toHaveBeenCalled();
      expect(result.current.isActive).toBe(false);
    });

    it('should handle request error', async () => {
      mockRequest.mockRejectedValueOnce(new Error('Permission denied'));

      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBe('Permission denied');
    });

    it('should add release event listener when wake lock is acquired', async () => {
      const { result } = renderHook(() => useWakeLock());

      await act(async () => {
        await result.current.toggle();
      });

      expect(mockWakeLockSentinel.addEventListener).toHaveBeenCalledWith(
        'release',
        expect.any(Function)
      );
    });

    it('should handle visibility change to re-acquire wake lock', async () => {
      const { result } = renderHook(() => useWakeLock());

      // Activate wake lock
      await act(async () => {
        await result.current.toggle();
      });

      expect(result.current.isActive).toBe(true);

      // Simulate release (tab became hidden)
      const releaseCallback = mockWakeLockSentinel.addEventListener.mock.calls.find(
        (call) => call[0] === 'release'
      )?.[1];

      if (releaseCallback) {
        act(() => {
          releaseCallback();
        });
      }

      // Wait for state to update
      await waitFor(() => {
        expect(result.current.isActive).toBe(false);
      });
    });
  });
});
