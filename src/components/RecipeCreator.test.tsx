import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RecipeCreator } from './RecipeCreator';

describe('RecipeCreator', () => {
  let clipboardSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Create a clipboard object if it doesn't exist
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        writable: true,
        configurable: true,
      });
    }

    // Spy on the writeText method
    clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  });

  afterEach(() => {
    clipboardSpy.mockRestore();
  });

  it('should render the form with all input fields', () => {
    render(<RecipeCreator />);

    // Check all input fields exist
    expect(screen.getByLabelText(/Titel/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Beskrivning/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total tid/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Portioner/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Taggar/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ingredienser/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instruktioner/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tips/)).toBeInTheDocument();

    // Check output section
    expect(screen.getByText('Genererad Markdown')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kopiera/ })).toBeInTheDocument();
    expect(screen.getByText(/Föreslaget filnamn:/)).toBeInTheDocument();
  });

  it('should update markdown output when title is entered', async () => {
    const user = userEvent.setup();
    render(<RecipeCreator />);

    const titleInput = screen.getByLabelText(/Titel/);
    const markdownOutput = screen.getByPlaceholderText(/Din markdown kommer att visas här/) as HTMLTextAreaElement;

    await user.type(titleInput, 'Test Recipe');

    expect(markdownOutput.value).toContain('title: Test Recipe');
  });

  it('should update filename suggestion when title is entered', async () => {
    const user = userEvent.setup();
    render(<RecipeCreator />);

    const titleInput = screen.getByLabelText(/Titel/);

    await user.type(titleInput, 'My Test Recipe');

    expect(screen.getByText('my-test-recipe.md')).toBeInTheDocument();
  });

  it('should generate complete markdown with all fields', async () => {
    const user = userEvent.setup();
    render(<RecipeCreator />);

    // Fill in all fields
    await user.type(screen.getByLabelText(/Titel/), 'Test Recipe');
    await user.type(screen.getByLabelText(/Beskrivning/), 'A test recipe');
    await user.type(screen.getByLabelText(/Total tid/), '45 minuter');
    await user.type(screen.getByLabelText(/Portioner/), '4');
    await user.type(screen.getByLabelText(/Taggar/), 'tag1, tag2');
    await user.type(screen.getByLabelText(/Ingredienser/), 'Ingredient 1\nIngredient 2');
    await user.type(screen.getByLabelText(/Instruktioner/), 'Step 1\nStep 2');
    await user.type(screen.getByLabelText(/Tips/), 'Tip 1\nTip 2');

    const markdownOutput = screen.getByPlaceholderText(/Din markdown kommer att visas här/) as HTMLTextAreaElement;

    expect(markdownOutput.value).toContain('title: Test Recipe');
    expect(markdownOutput.value).toContain('description: A test recipe');
    expect(markdownOutput.value).toContain('totalTime: 45 minuter');
    expect(markdownOutput.value).toContain('servings: 4');
    expect(markdownOutput.value).toContain('- tag1');
    expect(markdownOutput.value).toContain('- tag2');
    expect(markdownOutput.value).toContain('## Ingredienser');
    expect(markdownOutput.value).toContain('- Ingredient 1');
    expect(markdownOutput.value).toContain('## Instruktioner');
    expect(markdownOutput.value).toContain('1. Step 1');
    expect(markdownOutput.value).toContain('## Tips');
    expect(markdownOutput.value).toContain('- Tip 1');
  });

  it('should copy markdown to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(<RecipeCreator />);

    await user.type(screen.getByLabelText(/Titel/), 'Test Recipe');

    const copyButton = screen.getByRole('button', { name: /Kopiera/ });
    const markdownOutput = screen.getByPlaceholderText(/Din markdown kommer att visas här/) as HTMLTextAreaElement;

    await user.click(copyButton);

    // Wait for the async clipboard operation to complete
    await screen.findByText('✓ Kopierad!');

    expect(clipboardSpy).toHaveBeenCalledWith(markdownOutput.value);
  });

  it('should update copy button text after copying', async () => {
    const user = userEvent.setup();
    render(<RecipeCreator />);

    await user.type(screen.getByLabelText(/Titel/), 'Test Recipe');

    const copyButton = screen.getByRole('button', { name: /Kopiera/ });
    await user.click(copyButton);

    // Should change to "Kopierad!"
    await screen.findByText('✓ Kopierad!');
    expect(copyButton).toBeDisabled();
  });

  it('should handle Swedish characters in filename', async () => {
    const user = userEvent.setup();
    render(<RecipeCreator />);

    await user.type(screen.getByLabelText(/Titel/), 'Köttbullar med Ärtor');

    expect(screen.getByText('kottbullar-med-artor.md')).toBeInTheDocument();
  });

  it('should show default filename when no title is entered', () => {
    render(<RecipeCreator />);

    expect(screen.getByText('recipe-name.md')).toBeInTheDocument();
  });

  it('should render instructions accordion collapsed by default', () => {
    render(<RecipeCreator />);

    const accordionButton = screen.getByRole('button', { name: /instruktioner för att lägga till receptet på github/i });
    expect(accordionButton).toBeInTheDocument();
    expect(accordionButton).toHaveAttribute('aria-expanded', 'false');

    // Content should not be visible
    expect(screen.queryByText('Kopiera markdown-texten ovan')).not.toBeInTheDocument();
  });

  it('should expand accordion when clicked', async () => {
    const user = userEvent.setup();
    render(<RecipeCreator />);

    const accordionButton = screen.getByRole('button', { name: /instruktioner för att lägga till receptet på github/i });

    await user.click(accordionButton);

    expect(accordionButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Kopiera markdown-texten ovan')).toBeInTheDocument();
  });

  it('should collapse accordion when clicked again', async () => {
    const user = userEvent.setup();
    render(<RecipeCreator />);

    const accordionButton = screen.getByRole('button', { name: /instruktioner för att lägga till receptet på github/i });

    // Expand
    await user.click(accordionButton);
    expect(screen.getByText('Kopiera markdown-texten ovan')).toBeInTheDocument();

    // Collapse
    await user.click(accordionButton);
    expect(screen.queryByText('Kopiera markdown-texten ovan')).not.toBeInTheDocument();
  });
});
