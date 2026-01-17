import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('servings adjuster', () => {
    const recipeWithServings: Recipe = {
      slug: 'servings-recipe',
      frontmatter: {
        title: 'Servings Recipe',
        servings: 4,
      },
      content: `## Ingredienser

- 2 dl mjöl
- 4 ägg
- 100 g smör

## Instruktioner

1. Blanda allt`,
    };

    it('should render servings adjuster buttons when servings exist', () => {
      renderWithRouter(recipeWithServings);

      expect(screen.getByLabelText('Minska portioner')).toBeInTheDocument();
      expect(screen.getByLabelText('Öka portioner')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should increase servings when clicking plus button', async () => {
      const user = userEvent.setup();
      renderWithRouter(recipeWithServings);

      const increaseBtn = screen.getByLabelText('Öka portioner');
      await user.click(increaseBtn);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should decrease servings when clicking minus button', async () => {
      const user = userEvent.setup();
      renderWithRouter(recipeWithServings);

      const decreaseBtn = screen.getByLabelText('Minska portioner');
      await user.click(decreaseBtn);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should disable minus button when servings is 1', async () => {
      const user = userEvent.setup();
      const recipeWithOneServing: Recipe = {
        ...recipeWithServings,
        frontmatter: { ...recipeWithServings.frontmatter, servings: 1 },
      };
      renderWithRouter(recipeWithOneServing);

      const decreaseBtn = screen.getByLabelText('Minska portioner');
      expect(decreaseBtn).toBeDisabled();

      // Try clicking - should still be 1
      await user.click(decreaseBtn);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should scale ingredients when servings change', async () => {
      const user = userEvent.setup();
      renderWithRouter(recipeWithServings);

      // Initial ingredients
      expect(screen.getByText('2 dl mjöl')).toBeInTheDocument();
      expect(screen.getByText('4 ägg')).toBeInTheDocument();
      expect(screen.getByText('100 g smör')).toBeInTheDocument();

      // Double servings (4 -> 8)
      const increaseBtn = screen.getByLabelText('Öka portioner');
      await user.click(increaseBtn);
      await user.click(increaseBtn);
      await user.click(increaseBtn);
      await user.click(increaseBtn);

      // Check scaled ingredients
      expect(screen.getByText('4 dl mjöl')).toBeInTheDocument();
      expect(screen.getByText('8 ägg')).toBeInTheDocument();
      expect(screen.getByText('200 g smör')).toBeInTheDocument();
    });

    it('should not render servings adjuster when no servings in recipe', () => {
      const recipeWithoutServings: Recipe = {
        slug: 'no-servings',
        frontmatter: {
          title: 'No Servings Recipe',
        },
        content: '## Ingredienser\n\n- 1 dl mjöl',
      };
      renderWithRouter(recipeWithoutServings);

      expect(screen.queryByLabelText('Minska portioner')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Öka portioner')).not.toBeInTheDocument();
    });
  });
});
