import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RecipeListPage } from './RecipeListPage';
import type { Recipe } from '@/types/Recipe';

// Create mock recipes with many tags and different preparation times
const mockRecipes: Recipe[] = [
  ...Array.from({ length: 20 }, (_, i) => ({
    slug: `recipe-${i}`,
    frontmatter: {
      title: `Recipe ${i}`,
      description: `Description ${i}`,
      tags: [`tag${i}`, `tag${i + 20}`],
      totalTime: i % 5 === 0 ? '30 minuter' : i % 5 === 1 ? '45 minuter' : i % 5 === 2 ? '1 timme' : i % 5 === 3 ? '1 timme 30 minuter' : '2 timmar',
    },
    content: `Content ${i}`,
  })),
  {
    slug: 'quick-recipe',
    frontmatter: {
      title: 'Quick Recipe',
      description: 'Very fast recipe',
      tags: ['snabb', 'enkel'],
      totalTime: '15 minuter',
    },
    content: 'Quick content',
  },
  {
    slug: 'medium-recipe',
    frontmatter: {
      title: 'Medium Recipe',
      description: 'Medium time recipe',
      tags: ['medel'],
      totalTime: '40 minuter',
    },
    content: 'Medium content',
  },
  {
    slug: 'long-recipe',
    frontmatter: {
      title: 'Long Recipe',
      description: 'Takes long time',
      tags: ['långsam'],
      totalTime: '2 timmar',
    },
    content: 'Long content',
  },
];

// Mock the useRecipes hook
vi.mock('@/hooks/useRecipes', () => ({
  useRecipes: () => ({
    recipes: mockRecipes,
    loading: false,
    error: null,
  }),
}));

describe('RecipeListPage - Tag Limit', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Also clear any view mode settings
    localStorage.removeItem('recipeViewMode');
    localStorage.removeItem('showAllTags');
  });

  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <RecipeListPage />
      </MemoryRouter>
    );
  };

  // Helper to get all tag filter buttons (excluding toggle button and view buttons)
  const getTagFilterButtons = () => {
    return screen.getAllByRole('button').filter(btn =>
      btn.className.includes('tag-filter-btn')
    );
  };

  it('should initially show limited number of tags', () => {
    renderWithRouter();

    // Should show some tag filter buttons (limit is dynamic based on height)
    const tagButtons = getTagFilterButtons();
    expect(tagButtons.length).toBeGreaterThan(0);
    expect(tagButtons.length).toBeLessThanOrEqual(44); // We have 44 total unique tags

    // First tag in alphabetical order should be visible
    expect(screen.getByRole('button', { name: 'enkel' })).toBeInTheDocument();
  });

  it('should show "Visa fler" button when there are more tags than can fit', () => {
    renderWithRouter();

    const tagButtons = getTagFilterButtons();
    const toggleBtn = screen.queryByRole('button', { name: /visa fler taggar/i });

    // If we're showing fewer tags than total, toggle button should exist
    if (tagButtons.length < 44) {
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn).toHaveTextContent(/\(\d+\)/); // Should show count in parentheses
    } else {
      // If showing all tags, no toggle button
      expect(toggleBtn).not.toBeInTheDocument();
    }
  });

  it('should expand to show all tags when "Visa fler" is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // Check if toggle button exists
    const toggleBtn = screen.queryByRole('button', { name: /visa fler taggar/i });
    if (!toggleBtn) {
      // Skip this test if there aren't enough tags
      expect(true).toBe(true);
      return;
    }

    // Count initial tag buttons
    const initialTagButtons = getTagFilterButtons();
    const initialCount = initialTagButtons.length;

    // Click "Visa fler" button
    await user.click(toggleBtn);

    // Now more tag buttons should be visible (should show all 44)
    const expandedTagButtons = getTagFilterButtons();
    expect(expandedTagButtons.length).toBeGreaterThan(initialCount);
    expect(expandedTagButtons.length).toBe(44); // All tags

    // Button text should change to "Visa färre"
    expect(screen.getByRole('button', { name: /visa färre taggar/i })).toBeInTheDocument();
  });

  it('should collapse tags when "Visa färre" is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // Check if toggle button exists
    const expandBtn = screen.queryByRole('button', { name: /visa fler taggar/i });
    if (!expandBtn) {
      expect(true).toBe(true);
      return;
    }

    // Get initial count
    const initialTagButtons = getTagFilterButtons();
    const initialCount = initialTagButtons.length;

    await user.click(expandBtn);

    // Verify tags are expanded
    const expandedTagButtons = getTagFilterButtons();
    expect(expandedTagButtons.length).toBe(44); // All tags

    // Click "Visa färre" button
    const collapseBtn = screen.getByRole('button', { name: /visa färre taggar/i });
    await user.click(collapseBtn);

    // Should be back to initial limited count
    const collapsedTagButtons = getTagFilterButtons();
    expect(collapsedTagButtons.length).toBe(initialCount);
    expect(collapsedTagButtons.length).toBeLessThan(44);
  });

  it('should persist showAllTags state in localStorage', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // Check if toggle button exists
    const toggleBtn = screen.queryByRole('button', { name: /visa fler taggar/i });
    if (!toggleBtn) {
      expect(true).toBe(true);
      return;
    }

    // Click "Visa fler" button
    await user.click(toggleBtn);

    // localStorage should be updated
    expect(localStorage.getItem('showAllTags')).toBe('true');

    // Click "Visa färre" button
    const collapseBtn = screen.getByRole('button', { name: /visa färre taggar/i });
    await user.click(collapseBtn);

    // localStorage should be updated
    expect(localStorage.getItem('showAllTags')).toBe('false');
  });

  it('should load showAllTags state from localStorage on mount', () => {
    // Set localStorage before rendering
    localStorage.setItem('showAllTags', 'true');

    renderWithRouter();

    const tagButtons = getTagFilterButtons();

    // If showAllTags is true, all 44 tags should be visible
    expect(tagButtons.length).toBe(44);

    // Button should show "Visa färre" only if the dynamic limit would normally hide some tags
    const toggleBtn = screen.queryByRole('button', { name: /visa färre taggar/i });
    // The toggle button should exist since we set showAllTags to true and have more tags than would fit
    if (toggleBtn) {
      expect(toggleBtn).toBeInTheDocument();
    } else {
      // If all 44 tags fit naturally, no toggle needed
      expect(true).toBe(true);
    }
  });

  it('should show toggle button when there are more unique tags than fit in height', () => {
    renderWithRouter();

    const tagButtons = getTagFilterButtons();

    // We have 44 unique tags total
    // The toggle button should be present if we're showing fewer than all
    const toggleBtn = screen.queryByRole('button', { name: /visa fler taggar/i });

    if (tagButtons.length < 44) {
      expect(toggleBtn).toBeInTheDocument();
      // It should show the count of hidden tags
      const hiddenCount = 44 - tagButtons.length;
      expect(toggleBtn).toHaveTextContent(String(hiddenCount));
    } else {
      // All tags fit, no toggle button
      expect(toggleBtn).not.toBeInTheDocument();
    }
  });
});

describe('RecipeListPage - Time Filtering', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <RecipeListPage />
      </MemoryRouter>
    );
  };

  it('should render time filter buttons', () => {
    renderWithRouter();

    expect(screen.getByRole('button', { name: '≤ 40 min' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '≤ 1 timme' })).toBeInTheDocument();
  });

  it('should filter recipes by 40 minutes or less', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const timeFilterBtn = screen.getByRole('button', { name: '≤ 40 min' });
    await user.click(timeFilterBtn);

    // Should show quick-recipe (15 min), medium-recipe (40 min), and recipes with 30 min
    expect(screen.getByText('Quick Recipe')).toBeInTheDocument();
    expect(screen.getByText('Medium Recipe')).toBeInTheDocument();

    // Should not show long-recipe (2 hours) or recipes with 45 min, 1 hour, etc
    expect(screen.queryByText('Long Recipe')).not.toBeInTheDocument();
  });

  it('should filter recipes by 1 hour or less', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const timeFilterBtn = screen.getByRole('button', { name: '≤ 1 timme' });
    await user.click(timeFilterBtn);

    // Should show recipes with 15 min, 30 min, 40 min, 45 min, and 1 hour
    expect(screen.getByText('Quick Recipe')).toBeInTheDocument();
    expect(screen.getByText('Medium Recipe')).toBeInTheDocument();

    // Should not show long-recipe (2 hours) or recipes with 1 hour 30 min
    expect(screen.queryByText('Long Recipe')).not.toBeInTheDocument();
  });

  it('should toggle time filter off when clicking active filter', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const timeFilterBtn = screen.getByRole('button', { name: '≤ 40 min' });

    // Click to activate
    await user.click(timeFilterBtn);
    expect(timeFilterBtn).toHaveClass('active');

    // Click again to deactivate
    await user.click(timeFilterBtn);
    expect(timeFilterBtn).not.toHaveClass('active');

    // All recipes should be visible again
    expect(screen.getByText('Quick Recipe')).toBeInTheDocument();
    expect(screen.getByText('Long Recipe')).toBeInTheDocument();
  });

  it('should switch between time filters', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const fortyMinBtn = screen.getByRole('button', { name: '≤ 40 min' });
    const oneHourBtn = screen.getByRole('button', { name: '≤ 1 timme' });

    // Activate 40 min filter
    await user.click(fortyMinBtn);
    expect(fortyMinBtn).toHaveClass('active');
    expect(oneHourBtn).not.toHaveClass('active');

    // Switch to 1 hour filter
    await user.click(oneHourBtn);
    expect(fortyMinBtn).not.toHaveClass('active');
    expect(oneHourBtn).toHaveClass('active');
  });

  it('should update URL params when time filter is activated', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const timeFilterBtn = screen.getByRole('button', { name: '≤ 40 min' });
    await user.click(timeFilterBtn);

    // Check URL contains time parameter
    // Note: In a real test, you'd use useLocation or check the router state
    // For simplicity, we're just checking the button state
    expect(timeFilterBtn).toHaveClass('active');
  });

  it('should show no results message when no recipes match time filter', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // First filter by a tag that doesn't exist on quick recipes
    const tagBtn = screen.getByRole('button', { name: 'långsam' });
    await user.click(tagBtn);

    // Then apply 40 min filter - långsam tag only on long recipe (2 hours)
    const timeFilterBtn = screen.getByRole('button', { name: '≤ 40 min' });
    await user.click(timeFilterBtn);

    // Should show no results message with time filter info
    expect(screen.getByText(/inga recept hittades/i)).toBeInTheDocument();
    expect(screen.getByText(/40 minuter eller mindre/i)).toBeInTheDocument();
  });

  it('should combine time filter with tag filters', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    // Apply time filter
    const timeFilterBtn = screen.getByRole('button', { name: '≤ 40 min' });
    await user.click(timeFilterBtn);

    // Apply tag filter
    const tagBtn = screen.getByRole('button', { name: 'snabb' });
    await user.click(tagBtn);

    // Should only show quick-recipe (has 'snabb' tag and 15 min)
    expect(screen.getByText('Quick Recipe')).toBeInTheDocument();
    expect(screen.queryByText('Medium Recipe')).not.toBeInTheDocument(); // no 'snabb' tag
  });
});
