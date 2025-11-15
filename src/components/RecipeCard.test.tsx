import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RecipeCardGrid } from './RecipeCardGrid';
import { RecipeCardList } from './RecipeCardList';
import type { Recipe } from '@/types/Recipe';

describe('RecipeCardGrid', () => {
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
    render(<RecipeCardGrid recipe={mockRecipe} onClick={onClick} />);

    // Check title
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();

    // Check description
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();

    // Check time
    expect(screen.getByText('45 minutes')).toBeInTheDocument();

    // Check servings
    expect(screen.getByText('4 port.')).toBeInTheDocument();

    // Check tags
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<RecipeCardGrid recipe={mockRecipe} onClick={onClick} />);

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

    render(<RecipeCardGrid recipe={minimalRecipe} onClick={vi.fn()} />);

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
    render(<RecipeCardGrid recipe={manyTagsRecipe} onClick={onClick} />);

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

  it('should call onTagClick when a tag is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onTagClick = vi.fn();

    render(
      <RecipeCardGrid
        recipe={mockRecipe}
        onClick={onClick}
        onTagClick={onTagClick}
      />
    );

    // Click on a tag
    const testTag = screen.getByText('test');
    await user.click(testTag);

    // Should call onTagClick with the tag name
    expect(onTagClick).toHaveBeenCalledTimes(1);
    expect(onTagClick).toHaveBeenCalledWith('test');

    // Should not trigger card click
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should show active state on the active tag', () => {
    const onClick = vi.fn();
    const onTagClick = vi.fn();

    render(
      <RecipeCardGrid
        recipe={mockRecipe}
        onClick={onClick}
        onTagClick={onTagClick}
        activeTags={['test']}
      />
    );

    // The active tag should have the 'active' class
    const testTag = screen.getByText('test');
    expect(testTag).toHaveClass('active');

    // The other tag should not have the 'active' class
    const exampleTag = screen.getByText('example');
    expect(exampleTag).not.toHaveClass('active');
  });

  it('should show active state on multiple active tags', () => {
    const onClick = vi.fn();
    const onTagClick = vi.fn();

    render(
      <RecipeCardGrid
        recipe={mockRecipe}
        onClick={onClick}
        onTagClick={onTagClick}
        activeTags={['test', 'example']}
      />
    );

    // Both tags should have the 'active' class
    const testTag = screen.getByText('test');
    expect(testTag).toHaveClass('active');

    const exampleTag = screen.getByText('example');
    expect(exampleTag).toHaveClass('active');
  });

  it('should add clickable class when onTagClick is provided', () => {
    const onTagClick = vi.fn();

    render(
      <RecipeCardGrid
        recipe={mockRecipe}
        onClick={vi.fn()}
        onTagClick={onTagClick}
      />
    );

    // Tags should have clickable class
    const testTag = screen.getByText('test');
    expect(testTag).toHaveClass('clickable');
  });

  it('should not have clickable class when onTagClick is not provided', () => {
    render(<RecipeCardGrid recipe={mockRecipe} onClick={vi.fn()} />);

    // Tags should not have clickable class
    const testTag = screen.getByText('test');
    expect(testTag).not.toHaveClass('clickable');
  });
});

describe('RecipeCardList', () => {
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

  it('should render list card with all fields', () => {
    const onClick = vi.fn();
    render(<RecipeCardList recipe={mockRecipe} onClick={onClick} />);

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(screen.getByText('4 port.')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });

  it('should show all tags without expansion', () => {
    const manyTagsRecipe: Recipe = {
      ...mockRecipe,
      frontmatter: {
        ...mockRecipe.frontmatter,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      },
    };

    render(<RecipeCardList recipe={manyTagsRecipe} onClick={vi.fn()} />);

    // All tags should be visible (no expansion button in list view)
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
    expect(screen.getByText('tag4')).toBeInTheDocument();
    expect(screen.getByText('tag5')).toBeInTheDocument();
    expect(screen.queryByText(/mer/)).not.toBeInTheDocument();
  });
});
