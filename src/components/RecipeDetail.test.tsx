import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RecipeDetail } from './RecipeDetail';
import type { Recipe } from '@/types/Recipe';

// Mock useIsMobile hook
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

import { useIsMobile } from '@/hooks/useIsMobile';

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

    // Check tags
    expect(screen.getByText('Taggar')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();

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
    expect(screen.queryByText('Taggar')).not.toBeInTheDocument();
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

    it('should render preset portion buttons when servings exist', () => {
      renderWithRouter(recipeWithServings);

      expect(screen.getByLabelText('2 portioner')).toBeInTheDocument();
      expect(screen.getByLabelText('4 portioner')).toBeInTheDocument();
      expect(screen.getByLabelText('8 portioner')).toBeInTheDocument();
      expect(screen.getByLabelText('10 portioner')).toBeInTheDocument();
      expect(screen.getByLabelText('Ange eget antal portioner')).toBeInTheDocument();
    });

    it('should highlight the active preset button', () => {
      renderWithRouter(recipeWithServings);

      const btn4 = screen.getByLabelText('4 portioner');
      expect(btn4).toHaveClass('active');
    });

    it('should change servings when clicking a preset button', async () => {
      const user = userEvent.setup();
      renderWithRouter(recipeWithServings);

      const btn8 = screen.getByLabelText('8 portioner');
      await user.click(btn8);

      expect(btn8).toHaveClass('active');
      // Ingredients should be scaled (4 -> 8 = 2x)
      expect(screen.getByText('4 dl mjöl')).toBeInTheDocument();
    });

    it('should scale ingredients when servings change', async () => {
      const user = userEvent.setup();
      renderWithRouter(recipeWithServings);

      // Initial ingredients (4 servings)
      expect(screen.getByText('2 dl mjöl')).toBeInTheDocument();
      expect(screen.getByText('4 ägg')).toBeInTheDocument();
      expect(screen.getByText('100 g smör')).toBeInTheDocument();

      // Change to 8 servings (2x)
      await user.click(screen.getByLabelText('8 portioner'));

      // Check scaled ingredients
      expect(screen.getByText('4 dl mjöl')).toBeInTheDocument();
      expect(screen.getByText('8 ägg')).toBeInTheDocument();
      expect(screen.getByText('200 g smör')).toBeInTheDocument();
    });

    it('should allow entering a custom portion value', async () => {
      const user = userEvent.setup();
      renderWithRouter(recipeWithServings);

      // Click the custom button to show input
      const customBtn = screen.getByLabelText('Ange eget antal portioner');
      await user.click(customBtn);

      // Enter a custom value
      const input = screen.getByLabelText('Ange antal portioner');
      await user.clear(input);
      await user.type(input, '6');
      await user.keyboard('{Enter}');

      // Ingredients should be scaled (4 -> 6 = 1.5x)
      expect(screen.getByText('3 dl mjöl')).toBeInTheDocument();
      expect(screen.getByText('6 ägg')).toBeInTheDocument();
      expect(screen.getByText('150 g smör')).toBeInTheDocument();
    });

    it('should show custom value in button when not a preset', async () => {
      const user = userEvent.setup();
      renderWithRouter(recipeWithServings);

      // Enter custom value of 6
      const customBtn = screen.getByLabelText('Ange eget antal portioner');
      await user.click(customBtn);
      const input = screen.getByLabelText('Ange antal portioner');
      await user.clear(input);
      await user.type(input, '6');
      await user.keyboard('{Enter}');

      // Custom button should now show "6"
      expect(screen.getByText('6')).toBeInTheDocument();
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

      expect(screen.queryByLabelText('2 portioner')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('4 portioner')).not.toBeInTheDocument();
    });
  });

  describe('wake lock button', () => {
    const mockRelease = vi.fn().mockResolvedValue(undefined);
    const mockWakeLockSentinel = {
      released: false,
      type: 'screen' as const,
      release: mockRelease,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onrelease: null,
      dispatchEvent: vi.fn(),
    };

    const mockRequest = vi.fn().mockResolvedValue(mockWakeLockSentinel);

    beforeEach(() => {
      vi.clearAllMocks();
      mockRelease.mockResolvedValue(undefined);
      mockRequest.mockResolvedValue(mockWakeLockSentinel);
      localStorage.clear();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.mocked(useIsMobile).mockReturnValue(false);
    });

    it('should not show wake lock button on desktop', () => {
      vi.mocked(useIsMobile).mockReturnValue(false);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      renderWithRouter(mockRecipe);

      const wakeLockButton = screen.queryByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).not.toBeInTheDocument();
    });

    it('should not show wake lock button when API is not supported', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {});

      renderWithRouter(mockRecipe);

      const wakeLockButton = screen.queryByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).not.toBeInTheDocument();
    });

    it('should show wake lock button on mobile when API is supported', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      renderWithRouter(mockRecipe);

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      expect(wakeLockButton).toBeInTheDocument();
      expect(screen.getByText('Håll vaken')).toBeInTheDocument();
    });

    it('should show tooltip on first visit for mobile users', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      renderWithRouter(mockRecipe);

      expect(screen.getByText(/aktivera för att hålla skärmen tänd/i)).toBeInTheDocument();
    });

    it('should not show tooltip if already dismissed', () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });
      localStorage.setItem('wakeLockTooltipDismissed', 'true');

      renderWithRouter(mockRecipe);

      expect(screen.queryByText(/aktivera för att hålla skärmen tänd/i)).not.toBeInTheDocument();
    });

    it('should dismiss tooltip when close button is clicked', async () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      const user = userEvent.setup();
      renderWithRouter(mockRecipe);

      expect(screen.getByText(/aktivera för att hålla skärmen tänd/i)).toBeInTheDocument();

      const closeButton = screen.getByLabelText('Stäng tips');
      await user.click(closeButton);

      expect(screen.queryByText(/aktivera för att hålla skärmen tänd/i)).not.toBeInTheDocument();
      expect(localStorage.getItem('wakeLockTooltipDismissed')).toBe('true');
    });

    it('should toggle wake lock and dismiss tooltip when button is clicked', async () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      const user = userEvent.setup();
      renderWithRouter(mockRecipe);

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      await user.click(wakeLockButton);

      expect(mockRequest).toHaveBeenCalledWith('screen');
      expect(screen.queryByText(/aktivera för att hålla skärmen tänd/i)).not.toBeInTheDocument();
    });

    it('should show active state when wake lock is active', async () => {
      vi.mocked(useIsMobile).mockReturnValue(true);
      vi.stubGlobal('navigator', {
        wakeLock: { request: mockRequest },
      });

      const user = userEvent.setup();
      renderWithRouter(mockRecipe);

      const wakeLockButton = screen.getByLabelText(/håll skärmen vaken/i);
      await user.click(wakeLockButton);

      const activeButton = screen.getByLabelText(/stäng av skärmlås/i);
      expect(activeButton).toHaveClass('active');
      expect(screen.getByText('Skärm vaken')).toBeInTheDocument();
    });
  });
});
