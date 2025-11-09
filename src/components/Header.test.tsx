import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';

describe('Header', () => {
  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
  };

  it('should render the header with title', () => {
    renderWithRouter();

    expect(screen.getByText('Mina Recept')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderWithRouter();

    expect(screen.getByText('Alla Recept')).toBeInTheDocument();
    expect(screen.getByText('+ Skapa Recept')).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    renderWithRouter();

    const homeLink = screen.getByText('Mina Recept').closest('a');
    const allRecipesLink = screen.getByText('Alla Recept').closest('a');
    const createLink = screen.getByText('+ Skapa Recept').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(allRecipesLink).toHaveAttribute('href', '/');
    expect(createLink).toHaveAttribute('href', '/create');
  });

  it('should render chef hat icon', () => {
    const { container } = renderWithRouter();

    // Check for SVG element (lucide-react renders as SVG)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
