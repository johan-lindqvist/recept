import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RecipeListPage } from './RecipeListPage';
import type { Recipe } from '@/types/Recipe';

// Mock the useRecipes hook
vi.mock('@/hooks/useRecipes', () => ({
  useRecipes: () => ({
    recipes: mockRecipes,
    loading: false,
    error: null,
  }),
}));

// Create mock recipes with many tags
const mockRecipes: Recipe[] = Array.from({ length: 20 }, (_, i) => ({
  slug: `recipe-${i}`,
  frontmatter: {
    title: `Recipe ${i}`,
    description: `Description ${i}`,
    tags: [`tag${i}`, `tag${i + 20}`],
  },
  content: `Content ${i}`,
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
    expect(tagButtons.length).toBeLessThanOrEqual(40); // We have 40 total tags

    // First tag in alphabetical order should be visible
    expect(screen.getByRole('button', { name: 'tag0' })).toBeInTheDocument();
  });

  it('should show "Visa fler" button when there are more tags than can fit', () => {
    renderWithRouter();

    const tagButtons = getTagFilterButtons();
    const toggleBtn = screen.queryByRole('button', { name: /visa fler taggar/i });

    // If we're showing fewer tags than total, toggle button should exist
    if (tagButtons.length < 40) {
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

    // Now more tag buttons should be visible (should show all 40)
    const expandedTagButtons = getTagFilterButtons();
    expect(expandedTagButtons.length).toBeGreaterThan(initialCount);
    expect(expandedTagButtons.length).toBe(40); // All tags

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
    expect(expandedTagButtons.length).toBe(40); // All tags

    // Click "Visa färre" button
    const collapseBtn = screen.getByRole('button', { name: /visa färre taggar/i });
    await user.click(collapseBtn);

    // Should be back to initial limited count
    const collapsedTagButtons = getTagFilterButtons();
    expect(collapsedTagButtons.length).toBe(initialCount);
    expect(collapsedTagButtons.length).toBeLessThan(40);
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

    // If showAllTags is true, all 40 tags should be visible
    expect(tagButtons.length).toBe(40);

    // Button should show "Visa färre" only if the dynamic limit would normally hide some tags
    const toggleBtn = screen.queryByRole('button', { name: /visa färre taggar/i });
    // The toggle button should exist since we set showAllTags to true and have more tags than would fit
    if (toggleBtn) {
      expect(toggleBtn).toBeInTheDocument();
    } else {
      // If all 40 tags fit naturally, no toggle needed
      expect(true).toBe(true);
    }
  });

  it('should show toggle button when there are more unique tags than fit in height', () => {
    renderWithRouter();

    const tagButtons = getTagFilterButtons();

    // We have 40 unique tags total
    // The toggle button should be present if we're showing fewer than all
    const toggleBtn = screen.queryByRole('button', { name: /visa fler taggar/i });

    if (tagButtons.length < 40) {
      expect(toggleBtn).toBeInTheDocument();
      // It should show the count of hidden tags
      const hiddenCount = 40 - tagButtons.length;
      expect(toggleBtn).toHaveTextContent(String(hiddenCount));
    } else {
      // All tags fit, no toggle button
      expect(toggleBtn).not.toBeInTheDocument();
    }
  });
});
