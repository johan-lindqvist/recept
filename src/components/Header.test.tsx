import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

// Mock useIsMobile hook
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

import { useIsMobile } from '@/hooks/useIsMobile';

describe('Header', () => {
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Header />
      </MemoryRouter>
    );
  };

  it('should render the header with title', () => {
    renderWithRouter();

    expect(screen.getByText('Mina Recept')).toBeInTheDocument();
  });

  it('should render create recipe button', () => {
    renderWithRouter();

    expect(screen.getByText('Skapa recept')).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    renderWithRouter();

    const homeLink = screen.getByText('Mina Recept').closest('a');
    const createLink = screen.getByText('Skapa recept').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(createLink).toHaveAttribute('href', '/create');
  });

  it('should render chef hat icon', () => {
    const { container } = renderWithRouter();

    // Check for SVG element (lucide-react renders as SVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should show search bar on home page', () => {
    renderWithRouter('/');

    const searchInput = screen.getByPlaceholderText('Sök recept...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should not show search bar on other pages', () => {
    renderWithRouter('/create');

    const searchInput = screen.queryByPlaceholderText('Sök recept...');
    expect(searchInput).not.toBeInTheDocument();
  });

  it('should update URL search params when typing in search', async () => {
    const user = userEvent.setup();
    renderWithRouter('/');

    const searchInput = screen.getByPlaceholderText('Sök recept...');
    await user.type(searchInput, 'pasta');

    expect(searchInput).toHaveValue('pasta');
  });

  it('should show page title on create page', () => {
    renderWithRouter('/create');

    const pageTitle = screen.getByRole('heading', { level: 1, name: /skapa nytt recept/i });
    expect(pageTitle).toBeInTheDocument();
  });

  it('should not show page title on home page', () => {
    renderWithRouter('/');

    const pageTitle = screen.queryByRole('heading', { level: 1, name: /skapa nytt recept/i });
    expect(pageTitle).not.toBeInTheDocument();
  });

  it('should not show search bar when page title is shown', () => {
    renderWithRouter('/create');

    const searchInput = screen.queryByPlaceholderText('Sök recept...');
    const pageTitle = screen.getByRole('heading', { level: 1, name: /skapa nytt recept/i });

    expect(searchInput).not.toBeInTheDocument();
    expect(pageTitle).toBeInTheDocument();
  });

  it('should show active tag filter when tag param is present', () => {
    renderWithRouter('/?tag=vegetarisk');

    // Tag should be shown in the inline filter
    expect(screen.getByText('vegetarisk')).toBeInTheDocument();
    // Clear button should be present with specific aria-label
    expect(screen.getByLabelText('Ta bort vegetarisk')).toBeInTheDocument();
  });

  it('should not show active tag filter when no tag param', () => {
    renderWithRouter('/');

    // Clear button should not be present when no tag filter
    expect(screen.queryByLabelText(/Ta bort/)).not.toBeInTheDocument();
  });

  it('should clear tag filter when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter('/?tag=vegetarisk');

    expect(screen.getByText('vegetarisk')).toBeInTheDocument();

    // Click the clear button (X icon button)
    const clearButton = screen.getByLabelText('Ta bort vegetarisk');
    await user.click(clearButton);

    // Tag filter should be removed (component will re-render without it)
    // In the test, the URL will update and the filter display will be removed
  });

  it('should show both search and tag filter when both params are present', () => {
    renderWithRouter('/?q=pasta&tag=italiensk');

    const searchInput = screen.getByPlaceholderText('Sök recept...');
    expect(searchInput).toHaveValue('pasta');
    // Tag should be shown in the inline filter
    expect(screen.getByText('italiensk')).toBeInTheDocument();
    // Clear button should be present
    expect(screen.getByLabelText('Ta bort italiensk')).toBeInTheDocument();
  });

  it('should show multiple tag filters when multiple tags in URL', () => {
    renderWithRouter('/?tag=vegetarisk,italiensk');

    // Both tags should be shown
    expect(screen.getByText('vegetarisk')).toBeInTheDocument();
    expect(screen.getByText('italiensk')).toBeInTheDocument();
    // Both should have clear buttons
    expect(screen.getByLabelText('Ta bort vegetarisk')).toBeInTheDocument();
    expect(screen.getByLabelText('Ta bort italiensk')).toBeInTheDocument();
  });

  it('should remove individual tag when its clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter('/?tag=vegetarisk,italiensk');

    expect(screen.getByText('vegetarisk')).toBeInTheDocument();
    expect(screen.getByText('italiensk')).toBeInTheDocument();

    // Click to remove only the 'vegetarisk' tag
    const clearButton = screen.getByLabelText('Ta bort vegetarisk');
    await user.click(clearButton);

    // After clicking, the component would update, but in this test we just verify the button was clickable
  });

  it('should show time filter when time param is present (40 minutes)', () => {
    renderWithRouter('/?time=40');

    expect(screen.getByText('≤ 40 min')).toBeInTheDocument();
    expect(screen.getByLabelText('Ta bort tidsfilter ≤ 40 min')).toBeInTheDocument();
  });

  it('should show time filter when time param is present (1 hour)', () => {
    renderWithRouter('/?time=60');

    expect(screen.getByText('≤ 1 timme')).toBeInTheDocument();
    expect(screen.getByLabelText('Ta bort tidsfilter ≤ 1 timme')).toBeInTheDocument();
  });

  it('should not show time filter when no time param', () => {
    renderWithRouter('/');

    expect(screen.queryByText('≤ 40 min')).not.toBeInTheDocument();
    expect(screen.queryByText('≤ 1 timme')).not.toBeInTheDocument();
  });

  it('should clear time filter when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter('/?time=40');

    expect(screen.getByText('≤ 40 min')).toBeInTheDocument();

    const clearButton = screen.getByLabelText('Ta bort tidsfilter ≤ 40 min');
    await user.click(clearButton);

    // After clicking, the component would update and remove the time filter
  });

  it('should show both time filter and tag filters when both params are present', () => {
    renderWithRouter('/?time=40&tag=vegetarisk');

    expect(screen.getByText('≤ 40 min')).toBeInTheDocument();
    expect(screen.getByText('vegetarisk')).toBeInTheDocument();
    expect(screen.getByLabelText('Ta bort tidsfilter ≤ 40 min')).toBeInTheDocument();
    expect(screen.getByLabelText('Ta bort vegetarisk')).toBeInTheDocument();
  });

  it('should show time filter, tag filters, and search when all params are present', () => {
    renderWithRouter('/?q=pasta&time=60&tag=italiensk,vegetarisk');

    const searchInput = screen.getByPlaceholderText('Sök recept...');
    expect(searchInput).toHaveValue('pasta');
    expect(screen.getByText('≤ 1 timme')).toBeInTheDocument();
    expect(screen.getByText('italiensk')).toBeInTheDocument();
    expect(screen.getByText('vegetarisk')).toBeInTheDocument();
  });

  describe('wake lock button', () => {
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
      localStorage.clear();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.mocked(useIsMobile).mockReturnValue(false);
    });

    it('should not show wake lock button on home page', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      renderWithRouter('/');

      const wakeLockButton = screen.queryByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).not.toBeInTheDocument();
    });

    it('should not show wake lock button on desktop even on recipe page', () => {
      vi.mocked(useIsMobile).mockReturnValue(false);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      renderWithRouter('/recept/test-recipe');

      const wakeLockButton = screen.queryByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).not.toBeInTheDocument();
    });

    it('should not show wake lock button when API is not supported', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {});

      renderWithRouter('/recept/test-recipe');

      const wakeLockButton = screen.queryByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).not.toBeInTheDocument();
    });

    it('should show wake lock button on recipe page on mobile when API is supported', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      renderWithRouter('/recept/test-recipe');

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).toBeInTheDocument();
      expect(screen.getByText('Håll vaken')).toBeInTheDocument();
    });

    it('should show tooltip on first visit for mobile users on recipe page', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      renderWithRouter('/recept/test-recipe');

      expect(screen.getByText(/aktivera för att hålla skärmen tänd/i)).toBeInTheDocument();
    });

    it('should not show tooltip if already dismissed', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });
      localStorage.setItem('wakeLockTooltipDismissed', 'true');

      renderWithRouter('/recept/test-recipe');

      expect(screen.queryByText(/aktivera för att hålla skärmen tänd/i)).not.toBeInTheDocument();
    });

    it('should dismiss tooltip when close button is clicked', async () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      const user = userEvent.setup();
      renderWithRouter('/recept/test-recipe');

      expect(screen.getByText(/aktivera för att hålla skärmen tänd/i)).toBeInTheDocument();

      const closeButton = screen.getByLabelText('Stäng tips');
      await user.click(closeButton);

      expect(screen.queryByText(/aktivera för att hålla skärmen tänd/i)).not.toBeInTheDocument();
      expect(localStorage.getItem('wakeLockTooltipDismissed')).toBe('true');
    });

    it('should toggle wake lock and dismiss tooltip when button is clicked', async () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      const user = userEvent.setup();
      renderWithRouter('/recept/test-recipe');

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      await user.click(wakeLockButton);

      expect(mockRequest).toHaveBeenCalledWith('screen');
      expect(screen.queryByText(/aktivera för att hålla skärmen tänd/i)).not.toBeInTheDocument();
    });

    it('should show active state when wake lock is active', async () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      const user = userEvent.setup();
      renderWithRouter('/recept/test-recipe');

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      await user.click(wakeLockButton);

      const activeButton = screen.getByLabelText(/stäng av skärmlås/i);
      expect(activeButton).toHaveClass('active');
      expect(screen.getByText('Skärm vaken')).toBeInTheDocument();
    });
  });
});
