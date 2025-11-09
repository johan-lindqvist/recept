import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecipeDetail } from './RecipeDetail';
import type { Recipe } from '@/types/Recipe';

describe('RecipeDetail', () => {
  const mockRecipe: Recipe = {
    slug: 'test-recipe',
    frontmatter: {
      title: 'Test Recipe',
      description: 'A delicious test recipe',
      totalTime: '45 minutes',
      servings: 4,
      tags: ['test', 'example'],
    },
    content: `## Ingredients

- 1 cup flour
- 2 eggs

## Instructions

1. Mix ingredients
2. Cook`,
  };

  const renderWithRouter = (recipe: Recipe) => {
    return render(
      <BrowserRouter>
        <RecipeDetail recipe={recipe} />
      </BrowserRouter>
    );
  };

  it('should render recipe details with all fields', () => {
    renderWithRouter(mockRecipe);

    // Check title
    expect(screen.getByRole('heading', { level: 1, name: 'Test Recipe' })).toBeInTheDocument();

    // Check description
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();

    // Check meta labels
    expect(screen.getByText('Total tid')).toBeInTheDocument();
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(screen.getByText('Portioner')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    // Check content is rendered (markdown converted to HTML)
    expect(screen.getByText('1 cup flour')).toBeInTheDocument();
    expect(screen.getByText('2 eggs')).toBeInTheDocument();
    expect(screen.getByText('Mix ingredients')).toBeInTheDocument();
  });

  it('should render without optional fields', () => {
    const minimalRecipe: Recipe = {
      slug: 'minimal-recipe',
      frontmatter: {
        title: 'Minimal Recipe',
      },
      content: 'Just simple text content.',
    };

    renderWithRouter(minimalRecipe);

    expect(screen.getByRole('heading', { level: 1, name: 'Minimal Recipe' })).toBeInTheDocument();
    expect(screen.getByText('Just simple text content.')).toBeInTheDocument();
    expect(screen.queryByText('Total tid')).not.toBeInTheDocument();
    expect(screen.queryByText('Portioner')).not.toBeInTheDocument();
  });

  it('should render markdown content as HTML', () => {
    const markdownRecipe: Recipe = {
      slug: 'markdown-recipe',
      frontmatter: {
        title: 'Markdown Recipe',
      },
      content: `**Bold text** and *italic text*

- List item 1
- List item 2`,
    };

    renderWithRouter(markdownRecipe);

    // Check that markdown is converted
    const content = screen.getByText((content, element) => {
      return element?.tagName === 'STRONG' && content.includes('Bold text');
    });
    expect(content).toBeInTheDocument();
  });

  it('should handle image error with fallback', () => {
    const { container } = renderWithRouter(mockRecipe);

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.src).toContain('/recept/images/recipes/test-recipe.svg');
    expect(img?.alt).toBe('Test Recipe');
  });

  it('should render back button', () => {
    renderWithRouter(mockRecipe);

    const backButton = screen.getByRole('button', { name: /tillbaka till alla recept/i });
    expect(backButton).toBeInTheDocument();
  });
});
