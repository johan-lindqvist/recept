import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from './useIsMobile';

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return false when screen is large (> 1024px)', () => {
    // Mock window.matchMedia returning false (> 1024px)
    const matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 1024px)');
  });

  it('should return true when screen is small (<= 1024px)', () => {
    // Mock window.matchMedia returning true (<= 1024px)
    const matchMediaMock = vi.fn().mockReturnValue({ matches: true });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 1024px)');
  });
});
