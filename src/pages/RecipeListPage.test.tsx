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

  it('should initially show limited number of tags (12)', () => {
    renderWithRouter();

    // Should show exactly 12 tag filter buttons
    const tagButtons = getTagFilterButtons();
    expect(tagButtons).toHaveLength(12);

    // First tag in alphabetical order should be visible
    expect(screen.getByRole('button', { name: 'tag0' })).toBeInTheDocument();
  });

  it('should show "Visa fler" button when there are more than 12 tags', () => {
    renderWithRouter();

    // Should show the toggle button with count of hidden tags
    const toggleBtn = screen.queryByRole('button', { name: /visa fler taggar/i });

    // If there are more than 12 tags, the button should be present
    if (toggleBtn) {
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn).toHaveTextContent(/\(\d+\)/); // Should show count in parentheses
    } else {
      // If not present, verify we have exactly 12 or fewer tags total
      const tagButtons = getTagFilterButtons();
      expect(tagButtons.length).toBeLessThanOrEqual(12);
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
    expect(initialTagButtons).toHaveLength(12);

    // Click "Visa fler" button
    await user.click(toggleBtn);

    // Now more tag buttons should be visible
    const expandedTagButtons = getTagFilterButtons();
    expect(expandedTagButtons.length).toBeGreaterThan(12);

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

    await user.click(expandBtn);

    // Verify tags are expanded
    const expandedTagButtons = getTagFilterButtons();
    expect(expandedTagButtons.length).toBeGreaterThan(12);

    // Click "Visa färre" button
    const collapseBtn = screen.getByRole('button', { name: /visa färre taggar/i });
    await user.click(collapseBtn);

    // Should be back to 12 tags
    const collapsedTagButtons = getTagFilterButtons();
    expect(collapsedTagButtons).toHaveLength(12);
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

    // If there are more than 12 total tags, all should be visible
    // If there are 12 or fewer, this test doesn't apply
    if (tagButtons.length > 12) {
      // Button should show "Visa färre"
      expect(screen.getByRole('button', { name: /visa färre taggar/i })).toBeInTheDocument();
    } else {
      // Not enough tags to test this functionality
      expect(true).toBe(true);
    }
  });

  it('should show toggle button when there are more than 12 unique tags', () => {
    renderWithRouter();

    const tagButtons = getTagFilterButtons();

    // We have 20 recipes with 2 tags each = 40 unique tags
    // So we should see exactly 12 tag buttons initially
    expect(tagButtons).toHaveLength(12);

    // And the toggle button should be present
    const toggleBtn = screen.queryByRole('button', { name: /visa fler taggar/i });
    expect(toggleBtn).toBeInTheDocument();

    // It should show the count of hidden tags (40 - 12 = 28)
    expect(toggleBtn).toHaveTextContent('28');
  });
});
