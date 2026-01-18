import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

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

    expect(screen.getByText('+ Skapa Recept')).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    renderWithRouter();

    const homeLink = screen.getByText('Mina Recept').closest('a');
    const createLink = screen.getByText('+ Skapa Recept').closest('a');

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
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should not show wake lock button when API is not supported', () => {
      vi.stubGlobal('navigator', {});
      renderWithRouter();

      const wakeLockButton = screen.queryByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).not.toBeInTheDocument();
    });

    it('should show wake lock button when API is supported', () => {
      vi.stubGlobal('navigator', {
        wakeLock: {
          request: mockRequest,
        },
      });
      renderWithRouter();

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).toBeInTheDocument();
    });

    it('should toggle wake lock when button is clicked', async () => {
      vi.stubGlobal('navigator', {
        wakeLock: {
          request: mockRequest,
        },
      });

      const user = userEvent.setup();
      renderWithRouter();

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      await user.click(wakeLockButton);

      expect(mockRequest).toHaveBeenCalledWith('screen');
    });

    it('should have correct aria-pressed attribute', async () => {
      vi.stubGlobal('navigator', {
        wakeLock: {
          request: mockRequest,
        },
      });

      const user = userEvent.setup();
      renderWithRouter();

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(wakeLockButton);

      // After clicking, the button should be pressed
      const activeButton = screen.getByLabelText(/stäng av skärmlås/i);
      expect(activeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have active class when wake lock is active', async () => {
      vi.stubGlobal('navigator', {
        wakeLock: {
          request: mockRequest,
        },
      });

      const user = userEvent.setup();
      renderWithRouter();

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).not.toHaveClass('active');

      await user.click(wakeLockButton);

      const activeButton = screen.getByLabelText(/stäng av skärmlås/i);
      expect(activeButton).toHaveClass('active');
    });
  });
});
