import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RandomRecipeDialog } from './RandomRecipeDialog';
import type { Recipe } from '@/types/Recipe';

// Mock useRecipeImage hook
vi.mock('@/hooks/useRecipeImage', () => ({
  useRecipeImage: vi.fn((slug: string) => `/images/recipes/${slug}.jpg`),
}));

const mockRecipes: Recipe[] = [
  {
    slug: 'pasta-carbonara',
    frontmatter: {
      title: 'Pasta Carbonara',
      description: 'Klassisk italiensk pasta',
      tags: ['italiensk', 'pasta'],
    },
    content: '## Ingredienser\n- Pasta\n- Ägg',
  },
  {
    slug: 'vegetarisk-lasagne',
    frontmatter: {
      title: 'Vegetarisk Lasagne',
      description: 'Vegetarisk variant av lasagne',
      tags: ['italiensk', 'vegetarisk'],
    },
    content: '## Ingredienser\n- Lasagneplattor',
  },
  {
    slug: 'svensk-pannkaka',
    frontmatter: {
      title: 'Svenska Pannkakor',
      description: 'Klassiska svenska pannkakor',
      tags: ['svenskt', 'dessert'],
    },
    content: '## Ingredienser\n- Mjöl\n- Ägg',
  },
  {
    slug: 'recipe-without-tags',
    frontmatter: {
      title: 'Recept utan taggar',
    },
    content: '## Ingredienser\n- Något',
  },
];

describe('RandomRecipeDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    recipes: mockRecipes,
  };

  const renderDialog = (props = {}) => {
    return render(
      <MemoryRouter>
        <RandomRecipeDialog {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      renderDialog({ isOpen: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      renderDialog();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Slumpa recept')).toBeInTheDocument();
    });

    it('should render all unique tags as filter buttons', () => {
      renderDialog();

      expect(screen.getByRole('button', { name: 'italiensk' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'pasta' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'vegetarisk' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'svenskt' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'dessert' })).toBeInTheDocument();
    });

    it('should show recipe count', () => {
      renderDialog();

      expect(screen.getByText('4 recept matchar')).toBeInTheDocument();
    });

    it('should render close button', () => {
      renderDialog();

      expect(screen.getByRole('button', { name: 'Stäng' })).toBeInTheDocument();
    });

    it('should render Slumpa button', () => {
      renderDialog();

      expect(screen.getByRole('button', { name: /slumpa!/i })).toBeInTheDocument();
    });
  });

  describe('tag filtering', () => {
    it('should toggle tag selection when clicking a tag', async () => {
      const user = userEvent.setup();
      renderDialog();

      const italianskButton = screen.getByRole('button', { name: 'italiensk' });
      expect(italianskButton).not.toHaveClass('active');
      expect(italianskButton).toHaveAttribute('aria-pressed', 'false');

      await user.click(italianskButton);

      expect(italianskButton).toHaveClass('active');
      expect(italianskButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should update recipe count when tags are selected', async () => {
      const user = userEvent.setup();
      renderDialog();

      expect(screen.getByText('4 recept matchar')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'italiensk' }));

      expect(screen.getByText('2 recept matchar')).toBeInTheDocument();
    });

    it('should use AND logic for multiple tag filters', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'italiensk' }));
      await user.click(screen.getByRole('button', { name: 'vegetarisk' }));

      // Only "Vegetarisk Lasagne" has both tags
      expect(screen.getByText('1 recept matchar')).toBeInTheDocument();
    });

    it('should deselect tag when clicking again', async () => {
      const user = userEvent.setup();
      renderDialog();

      const italianskButton = screen.getByRole('button', { name: 'italiensk' });

      await user.click(italianskButton);
      expect(screen.getByText('2 recept matchar')).toBeInTheDocument();

      await user.click(italianskButton);
      expect(screen.getByText('4 recept matchar')).toBeInTheDocument();
    });
  });

  describe('random selection', () => {
    it('should show result when clicking Slumpa button', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: /slumpa!/i }));

      // Should show one of the recipe titles
      const possibleTitles = mockRecipes.map(r => r.frontmatter.title);
      const displayedTitle = possibleTitles.find(title =>
        screen.queryByRole('heading', { name: title, level: 3 })
      );
      expect(displayedTitle).toBeDefined();
    });

    it('should show Slumpa igen button after selection', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: /slumpa!/i }));

      expect(screen.getByRole('button', { name: /slumpa igen/i })).toBeInTheDocument();
    });

    it('should show Visa recept link after selection', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: /slumpa!/i }));

      const visaReceptLink = screen.getByRole('link', { name: /visa recept/i });
      expect(visaReceptLink).toBeInTheDocument();
      expect(visaReceptLink).toHaveAttribute('href', expect.stringMatching(/^\/recept\//));
    });

    it('should show Byt filter button after selection', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: /slumpa!/i }));

      expect(screen.getByRole('button', { name: /byt filter/i })).toBeInTheDocument();
    });

    it('should show recipe description if available', async () => {
      const user = userEvent.setup();
      // Use a single recipe to ensure we know which one is shown
      renderDialog({
        recipes: [mockRecipes[0]],
      });

      await user.click(screen.getByRole('button', { name: /slumpa!/i }));

      expect(screen.getByText('Klassisk italiensk pasta')).toBeInTheDocument();
    });

    it('should re-roll when clicking Slumpa igen', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: /slumpa!/i }));
      await user.click(screen.getByRole('button', { name: /slumpa igen/i }));

      // Should still show a result (one of the recipes)
      const possibleTitles = mockRecipes.map(r => r.frontmatter.title);
      const displayedTitle = possibleTitles.find(title =>
        screen.queryByRole('heading', { name: title, level: 3 })
      );
      expect(displayedTitle).toBeDefined();
    });

    it('should go back to tag selection when clicking Byt filter', async () => {
      const user = userEvent.setup();
      renderDialog();

      await user.click(screen.getByRole('button', { name: /slumpa!/i }));
      await user.click(screen.getByRole('button', { name: /byt filter/i }));

      // Should be back to tag selection phase
      expect(screen.getByRole('button', { name: /slumpa!/i })).toBeInTheDocument();
      expect(screen.getByText('Filtrera efter taggar (valfritt):')).toBeInTheDocument();
    });
  });

  describe('no matches', () => {
    it('should show no results message when no recipes match filters', async () => {
      const user = userEvent.setup();
      renderDialog();

      // Select tags that together have no matches
      await user.click(screen.getByRole('button', { name: 'svenskt' }));
      await user.click(screen.getByRole('button', { name: 'italiensk' }));

      // Count should be 0 (no recipe is both swedish and italian)
      expect(screen.getByText('0 recept matchar')).toBeInTheDocument();

      // Slumpa button should be disabled
      expect(screen.getByRole('button', { name: /slumpa!/i })).toBeDisabled();
    });

    it('should disable Slumpa button when filters result in no matches', async () => {
      const user = userEvent.setup();
      renderDialog();

      // Select conflicting tags
      await user.click(screen.getByRole('button', { name: 'svenskt' }));
      await user.click(screen.getByRole('button', { name: 'pasta' }));

      // No recipe matches both tags
      expect(screen.getByText('0 recept matchar')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /slumpa!/i })).toBeDisabled();
    });
  });

  describe('closing dialog', () => {
    it('should call onClose when clicking close button', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderDialog({ onClose });

      await user.click(screen.getByRole('button', { name: 'Stäng' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking backdrop', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const { container } = renderDialog({ onClose });

      const backdrop = container.querySelector('.random-recipe-dialog-backdrop');
      await user.click(backdrop!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when pressing Escape', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderDialog({ onClose });

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking Visa recept link', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderDialog({ onClose });

      await user.click(screen.getByRole('button', { name: /slumpa!/i }));
      await user.click(screen.getByRole('link', { name: /visa recept/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should reset state when dialog closes and reopens', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <MemoryRouter>
          <RandomRecipeDialog {...defaultProps} isOpen={true} />
        </MemoryRouter>
      );

      // Select a tag
      await user.click(screen.getByRole('button', { name: 'italiensk' }));
      expect(screen.getByText('2 recept matchar')).toBeInTheDocument();

      // Close and reopen
      rerender(
        <MemoryRouter>
          <RandomRecipeDialog {...defaultProps} isOpen={false} />
        </MemoryRouter>
      );
      rerender(
        <MemoryRouter>
          <RandomRecipeDialog {...defaultProps} isOpen={true} />
        </MemoryRouter>
      );

      // Tag selection should be reset
      expect(screen.getByText('4 recept matchar')).toBeInTheDocument();
    });
  });

  describe('empty recipes', () => {
    it('should handle empty recipes array', () => {
      renderDialog({ recipes: [] });

      expect(screen.getByText('0 recept matchar')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /slumpa!/i })).toBeDisabled();
    });

    it('should not show tag filter section when no tags exist', () => {
      renderDialog({
        recipes: [mockRecipes[3]], // Recipe without tags
      });

      expect(screen.queryByText('Filtrera efter taggar (valfritt):')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have correct aria attributes on dialog', () => {
      renderDialog();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'random-recipe-dialog-title');
    });

    it('should have aria-pressed attribute on tag buttons', () => {
      renderDialog();

      const tagButton = screen.getByRole('button', { name: 'italiensk' });
      expect(tagButton).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
