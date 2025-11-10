import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/types/Recipe';

describe('RecipeCard', () => {
  const mockRecipe: Recipe = {
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

  it('should render recipe card with all fields', () => {
    const onClick = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onClick={onClick} />);

    // Check title
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();

    // Check description
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();

    // Check time (meta is rendered twice - once for grid view, once for list view overlay)
    expect(screen.getAllByText('45 minutes').length).toBeGreaterThan(0);

    // Check servings (meta is rendered twice - once for grid view, once for list view overlay)
    expect(screen.getAllByText('4 port.').length).toBeGreaterThan(0);

    // Check tags
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<RecipeCard recipe={mockRecipe} onClick={onClick} />);

    const card = screen.getByText('Test Recipe').closest('.recipe-card');
    expect(card).toBeInTheDocument();

    await user.click(card!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render without optional fields', () => {
    const minimalRecipe: Recipe = {
      slug: 'minimal-recipe',
      frontmatter: {
        title: 'Minimal Recipe',
      },
      content: 'Minimal content',
    };

    render(<RecipeCard recipe={minimalRecipe} onClick={vi.fn()} />);

    expect(screen.getByText('Minimal Recipe')).toBeInTheDocument();
    expect(screen.queryByText(/port./)).not.toBeInTheDocument();
  });

  it('should expand tags when more button is clicked', async () => {
    const user = userEvent.setup();
    const manyTagsRecipe: Recipe = {
      ...mockRecipe,
      frontmatter: {
        ...mockRecipe.frontmatter,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      },
    };

    const onClick = vi.fn();
    render(<RecipeCard recipe={manyTagsRecipe} onClick={onClick} />);

    // Initially should show first 3 tags and "+2 mer"
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.getByText('+2 mer')).toBeInTheDocument();
    expect(screen.queryByText('tag4')).not.toBeInTheDocument();

    // Click "+2 mer"
    await user.click(screen.getByText('+2 mer'));

    // Should not trigger card click
    expect(onClick).not.toHaveBeenCalled();

    // Should now show all tags and "visa färre"
    expect(screen.getByText('tag4')).toBeInTheDocument();
    expect(screen.getByText('tag5')).toBeInTheDocument();
    expect(screen.getByText('visa färre')).toBeInTheDocument();
    expect(screen.queryByText('+2 mer')).not.toBeInTheDocument();

    // Click "visa färre"
    await user.click(screen.getByText('visa färre'));

    // Should collapse back
    expect(screen.getByText('+2 mer')).toBeInTheDocument();
    expect(screen.queryByText('tag4')).not.toBeInTheDocument();
  });
});
