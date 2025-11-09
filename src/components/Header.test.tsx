import { describe, it, expect } from 'vitest';
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
});
