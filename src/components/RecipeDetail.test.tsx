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

  it('should render image with default fallback when recipe image not found', () => {
    const { container } = renderWithRouter(mockRecipe);

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    // Since test-recipe image doesn't exist, useRecipeImage hook falls back to default
    expect(img?.src).toContain('images/recipes/default-recipe.svg');
    expect(img?.alt).toBe('Test Recipe');
  });

  it('should parse and render recipe sections correctly', () => {
    const { container } = renderWithRouter(mockRecipe);

    // Check that sections are wrapped in .recipe-section divs
    const sections = container.querySelectorAll('.recipe-section');
    expect(sections).toHaveLength(2);

    // Check section headings
    expect(screen.getByRole('heading', { level: 2, name: 'Ingredients' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Instructions' })).toBeInTheDocument();
  });

  it('should render recipe with multiple sections including Tips', () => {
    const recipeWithTips: Recipe = {
      slug: 'recipe-with-tips',
      frontmatter: {
        title: 'Recipe with Tips',
      },
      content: `## Ingredienser

- 2 ägg
- 1 dl mjöl

## Instruktioner

1. Blanda ingredienserna
2. Stek i smör

## Tips

- Servera varmt
- Går bra att frysa`,
    };

    const { container } = renderWithRouter(recipeWithTips);

    // Check that all three sections are rendered
    const sections = container.querySelectorAll('.recipe-section');
    expect(sections).toHaveLength(3);

    // Check all section headings
    expect(screen.getByRole('heading', { level: 2, name: 'Ingredienser' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Instruktioner' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Tips' })).toBeInTheDocument();

    // Check content is in correct sections
    expect(screen.getByText('2 ägg')).toBeInTheDocument();
    expect(screen.getByText('Blanda ingredienserna')).toBeInTheDocument();
    expect(screen.getByText('Servera varmt')).toBeInTheDocument();
  });

  it('should handle recipes with no sections gracefully', () => {
    const noSectionsRecipe: Recipe = {
      slug: 'no-sections',
      frontmatter: {
        title: 'No Sections Recipe',
      },
      content: 'Just plain text without any sections.',
    };

    const { container } = renderWithRouter(noSectionsRecipe);

    // Should render but with no sections
    const sections = container.querySelectorAll('.recipe-section');
    expect(sections).toHaveLength(0);
  });
});
