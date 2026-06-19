import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
// The layout being tested lives in the real stylesheet, so it must be loaded.
import '@/style.css';

// Force the desktop layout for a deterministic header.
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

const renderAt = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Header />
    </MemoryRouter>
  );

const searchBarHeight = (container: HTMLElement) => {
  const wrapper = container.querySelector('.search-input-wrapper');
  if (!wrapper) throw new Error('.search-input-wrapper not found');
  return wrapper.getBoundingClientRect().height;
};

describe('Header layout (browser)', () => {
  it('keeps the search bar height stable when a filter tag is added', () => {
    const { container: withoutTag } = renderAt('/');
    const heightWithoutTag = searchBarHeight(withoutTag);

    const { container: withTag } = renderAt('/?tag=bakning');
    // The filter pill should be present in this state.
    expect(withTag.querySelector('.inline-tag-filter')).not.toBeNull();
    const heightWithTag = searchBarHeight(withTag);

    // Adding the inline filter pill must not grow the search bar row
    // (and therefore must not resize the sticky header).
    expect(heightWithTag).toBeCloseTo(heightWithoutTag, 0);
  });
});
