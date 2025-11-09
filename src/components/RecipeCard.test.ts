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
        totalTime: '45 minutes',
        servings: 4,
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
    expect(meta?.textContent).toContain('45 minutes');
    expect(meta?.textContent).toContain('4 port.');

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
        totalTime: '10 minutes',
      },
      content: 'Partial content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    const meta = card.querySelector('.meta');
    expect(meta).toBeTruthy();
    expect(meta?.textContent).toContain('10 minutes');
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

  it('should display tags as labels', () => {
    const recipe: Recipe = {
      slug: 'tagged-recipe',
      frontmatter: {
        title: 'Tagged Recipe',
        tags: ['vegetarian', 'quick', 'easy'],
      },
      content: 'Content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    const tagsContainer = card.querySelector('.recipe-tags');
    expect(tagsContainer).toBeTruthy();

    const tagLabels = card.querySelectorAll('.tag-label:not(.tag-more)');
    expect(tagLabels.length).toBe(3);
    expect(tagLabels[0]?.textContent).toBe('vegetarian');
    expect(tagLabels[1]?.textContent).toBe('quick');
    expect(tagLabels[2]?.textContent).toBe('easy');
  });

  it('should show "+X mer" button when there are more than 3 tags', () => {
    const recipe: Recipe = {
      slug: 'many-tags-recipe',
      frontmatter: {
        title: 'Many Tags Recipe',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      },
      content: 'Content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    const tagLabels = card.querySelectorAll('.tag-label:not(.tag-more)');
    expect(tagLabels.length).toBe(3);

    const moreLabel = card.querySelector('.tag-more');
    expect(moreLabel).toBeTruthy();
    expect(moreLabel?.textContent).toBe('+2 mer');
  });

  it('should expand tags when clicking "+X mer" button', () => {
    const recipe: Recipe = {
      slug: 'expandable-tags-recipe',
      frontmatter: {
        title: 'Expandable Tags Recipe',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      },
      content: 'Content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    // Initially should show 3 tags
    let tagLabels = card.querySelectorAll('.tag-label:not(.tag-more)');
    expect(tagLabels.length).toBe(3);

    // Click the "+2 mer" button
    const moreLabel = card.querySelector('.tag-more') as HTMLElement;
    moreLabel.click();

    // Should not trigger card click
    expect(onClick).not.toHaveBeenCalled();

    // Should now show all 5 tags
    tagLabels = card.querySelectorAll('.tag-label:not(.tag-more)');
    expect(tagLabels.length).toBe(5);

    // Should show "visa färre" button
    const lessLabel = card.querySelector('.tag-more');
    expect(lessLabel?.textContent).toBe('visa färre');

    // Click "visa färre" to collapse
    (lessLabel as HTMLElement).click();

    // Should be back to 3 tags
    tagLabels = card.querySelectorAll('.tag-label:not(.tag-more)');
    expect(tagLabels.length).toBe(3);

    // Should show "+2 mer" again
    const newMoreLabel = card.querySelector('.tag-more');
    expect(newMoreLabel?.textContent).toBe('+2 mer');
  });

  it('should not show tags section when recipe has no tags', () => {
    const recipe: Recipe = {
      slug: 'no-tags-recipe',
      frontmatter: {
        title: 'No Tags Recipe',
      },
      content: 'Content',
    };

    const onClick = vi.fn();
    const card = createRecipeCard(recipe, onClick);

    const tagsContainer = card.querySelector('.recipe-tags');
    expect(tagsContainer).toBeNull();
  });
});
