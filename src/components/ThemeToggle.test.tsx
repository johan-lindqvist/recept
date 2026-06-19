import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to the new theme and offers to switch to the classic one', () => {
    render(<ThemeToggle />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('new');
    expect(screen.getByText('Klassiskt')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Byt till klassiskt tema')
    ).toBeInTheDocument();
  });

  it('switches to the old theme on click and persists the choice', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(document.documentElement.getAttribute('data-theme')).toBe('old');
    expect(localStorage.getItem('theme')).toBe('old');
    expect(screen.getByText('Nytt')).toBeInTheDocument();
    expect(screen.getByLabelText('Byt till nytt tema')).toBeInTheDocument();
  });

  it('toggles back to the new theme on a second click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    await user.click(button);
    await user.click(button);

    expect(document.documentElement.getAttribute('data-theme')).toBe('new');
    expect(localStorage.getItem('theme')).toBe('new');
    expect(screen.getByText('Klassiskt')).toBeInTheDocument();
  });

  it('restores a previously saved theme from localStorage', () => {
    localStorage.setItem('theme', 'old');

    render(<ThemeToggle />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('old');
    expect(screen.getByText('Nytt')).toBeInTheDocument();
  });
});
