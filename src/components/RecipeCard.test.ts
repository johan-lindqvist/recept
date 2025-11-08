import { describe, it, expect, vi } from 'vitest';
import { createRecipeCard } from './RecipeCard';
import type { Recipe } from '@/types/Recipe';

// Mock Lucide icons
vi.mock('lucide', () => ({
  createElement: vi.fn((icon: any) => {
    const svg = document.createElement('svg');
    svg.setAttribute('data-icon', icon.name || 'icon');
    return svg;
  }),
  icons: {
    Clock: { name: 'clock' },
    ChefHat: { name: 'chef-hat' },
    Gauge: { name: 'gauge' },
    Users: { name: 'users' },
  },
}));

describe('createRecipeCard', () => {
  it('should create a recipe card with all fields', () => {
    const recipe: Recipe = {
      slug: 'test-recipe',
      frontmatter: {
        title: 'Test Recipe',
        description: 'A delicious test recipe',
        prepTime: '15 minutes',
        cookTime: '30 minutes',
        servings: 4,
        difficulty: 'Medium',
        tags: ['test', 'example'],
      },
      content: 'Recipe content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    // Check structure
    expect(card.className).toBe('recipe-card');
    expect(card.tagName).toBe('DIV');

    // Check title
    const title = card.querySelector('h2');
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe('Test Recipe');

    // Check description
    const description = card.querySelector('.description');
    expect(description).toBeTruthy();
    expect(description?.textContent).toBe('A delicious test recipe');

    // Check meta information
    const meta = card.querySelector('.meta');
    expect(meta).toBeTruthy();
    expect(meta?.textContent).toContain('15 minutes');
    expect(meta?.textContent).toContain('30 minutes');
    expect(meta?.textContent).toContain('4 port.');
    expect(meta?.textContent).toContain('Medium');

    // Check click handler
    card.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should create a recipe card without optional fields', () => {
    const recipe: Recipe = {
      slug: 'minimal-recipe',
      frontmatter: {
        title: 'Minimal Recipe',
      },
      content: 'Minimal content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    // Check title exists
    const title = card.querySelector('h2');
    expect(title?.textContent).toBe('Minimal Recipe');

    // Check description doesn't exist
    const description = card.querySelector('.description');
    expect(description).toBeNull();

    // Check meta still exists but is empty or minimal
    const meta = card.querySelector('.meta');
    expect(meta).toBeTruthy();
  });

  it('should handle partial meta information', () => {
    const recipe: Recipe = {
      slug: 'partial-recipe',
      frontmatter: {
        title: 'Partial Recipe',
        prepTime: '10 minutes',
        difficulty: 'Easy',
      },
      content: 'Partial content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    const meta = card.querySelector('.meta');
    expect(meta).toBeTruthy();
    expect(meta?.textContent).toContain('10 minutes');
    expect(meta?.textContent).toContain('Easy');
    expect(meta?.textContent).not.toContain('30 minutes');
  });

  it('should be clickable', () => {
    const recipe: Recipe = {
      slug: 'clickable-recipe',
      frontmatter: {
        title: 'Clickable Recipe',
      },
      content: 'Content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    // Click multiple times
    card.click();
    card.click();
    card.click();

    expect(onClick).toHaveBeenCalledTimes(3);
  });
});
