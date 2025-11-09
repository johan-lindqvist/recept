import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderRecipeDetail } from './RecipeDetail';
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
    Gauge: { name: 'gauge' },
    Users: { name: 'users' },
  },
}));

describe('renderRecipeDetail', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('should render recipe details with all fields', () => {
    const recipe: Recipe = {
      slug: 'test-recipe',
      frontmatter: {
        title: 'Test Recipe',
        description: 'A delicious test recipe',
        totalTime: '45 minutes',
        servings: 4,
        difficulty: 'Medium',
        tags: ['test', 'example'],
      },
      content: `## Ingredients

- 1 cup flour
- 2 eggs

## Instructions

1. Mix ingredients
2. Cook`,
    };

    renderRecipeDetail(recipe, container);

    // Check title
    const title = container.querySelector('h1');
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe('Test Recipe');

    // Check description
    const description = container.querySelector('.recipe-description');
    expect(description).toBeTruthy();
    expect(description?.textContent).toBe('A delicious test recipe');

    // Check meta information
    const meta = container.querySelector('.meta');
    expect(meta).toBeTruthy();
    expect(meta?.textContent).toContain('Total tid');
    expect(meta?.textContent).toContain('45 minutes');
    expect(meta?.textContent).toContain('Portioner');
    expect(meta?.textContent).toContain('4');

    // Check content
    const content = container.querySelector('.recipe-content');
    expect(content).toBeTruthy();
    expect(content?.innerHTML).toContain('<h2>Ingredients</h2>');
    expect(content?.innerHTML).toContain('<h2>Instructions</h2>');
    expect(content?.innerHTML).toContain('1 cup flour');
    expect(content?.innerHTML).toContain('Mix ingredients');
  });

  it('should render recipe without optional fields', () => {
    const recipe: Recipe = {
      slug: 'minimal-recipe',
      frontmatter: {
        title: 'Minimal Recipe',
      },
      content: 'Just simple text content.',
    };

    renderRecipeDetail(recipe, container);

    // Check title
    const title = container.querySelector('h1');
    expect(title?.textContent).toBe('Minimal Recipe');

    // Check meta (should exist but may be empty)
    const meta = container.querySelector('.meta');
    expect(meta).toBeTruthy();

    // Check content
    const content = container.querySelector('.recipe-content');
    expect(content).toBeTruthy();
    expect(content?.textContent).toContain('Just simple text content');
  });

  it('should clear previous content when rendering', () => {
    container.innerHTML = '<p>Old content</p>';

    const recipe: Recipe = {
      slug: 'new-recipe',
      frontmatter: {
        title: 'New Recipe',
      },
      content: 'New content',
    };

    renderRecipeDetail(recipe, container);

    expect(container.textContent).not.toContain('Old content');
    expect(container.textContent).toContain('New Recipe');
  });

  it('should render markdown content as HTML', () => {
    const recipe: Recipe = {
      slug: 'markdown-recipe',
      frontmatter: {
        title: 'Markdown Recipe',
      },
      content: `**Bold text** and *italic text*

- List item 1
- List item 2`,
    };

    renderRecipeDetail(recipe, container);

    const content = container.querySelector('.recipe-content');
    expect(content?.innerHTML).toContain('<strong>Bold text</strong>');
    expect(content?.innerHTML).toContain('<em>italic text</em>');
    expect(content?.innerHTML).toContain('<li>List item 1</li>');
    expect(content?.innerHTML).toContain('<li>List item 2</li>');
  });
});
