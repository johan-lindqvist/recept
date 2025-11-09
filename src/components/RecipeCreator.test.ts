import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRecipeCreator } from './RecipeCreator';

describe('createRecipeCreator', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  it('should render the form with all input fields', () => {
    createRecipeCreator(container);

    // Check header
    const header = container.querySelector('.recipe-creator-header');
    expect(header).toBeTruthy();
    expect(header?.querySelector('h1')?.textContent).toBe('Skapa Nytt Recept');

    // Check form exists
    const form = container.querySelector('.recipe-form');
    expect(form).toBeTruthy();

    // Check all input fields exist
    expect(container.querySelector('#title')).toBeTruthy();
    expect(container.querySelector('#description')).toBeTruthy();
    expect(container.querySelector('#totalTime')).toBeTruthy();
    expect(container.querySelector('#servings')).toBeTruthy();
    expect(container.querySelector('#tags')).toBeTruthy();
    expect(container.querySelector('#ingredients')).toBeTruthy();
    expect(container.querySelector('#instructions')).toBeTruthy();
    expect(container.querySelector('#tips')).toBeTruthy();

    // Check output section
    const markdownOutput = container.querySelector('.markdown-output');
    expect(markdownOutput).toBeTruthy();

    // Check copy button
    const copyButton = container.querySelector('.copy-button');
    expect(copyButton).toBeTruthy();

    // Check filename suggestion
    const filenameSuggestion = container.querySelector('.filename-suggestion');
    expect(filenameSuggestion).toBeTruthy();
  });

  it('should update markdown output when title is entered', () => {
    createRecipeCreator(container);

    const titleInput = container.querySelector('#title') as HTMLInputElement;
    const markdownOutput = container.querySelector('.markdown-output') as HTMLTextAreaElement;

    titleInput.value = 'Test Recipe';
    titleInput.dispatchEvent(new Event('input'));

    expect(markdownOutput.value).toContain('title: Test Recipe');
  });

  it('should update filename suggestion when title is entered', () => {
    createRecipeCreator(container);

    const titleInput = container.querySelector('#title') as HTMLInputElement;
    const filenameSpan = container.querySelector('#suggested-filename');

    titleInput.value = 'My Test Recipe';
    titleInput.dispatchEvent(new Event('input'));

    expect(filenameSpan?.textContent).toBe('my-test-recipe.md');
  });

  it('should generate complete markdown with all fields', () => {
    createRecipeCreator(container);

    // Fill in all fields
    (container.querySelector('#title') as HTMLInputElement).value = 'Test Recipe';
    (container.querySelector('#title') as HTMLInputElement).dispatchEvent(new Event('input'));

    (container.querySelector('#description') as HTMLInputElement).value = 'A test recipe';
    (container.querySelector('#description') as HTMLInputElement).dispatchEvent(new Event('input'));

    (container.querySelector('#totalTime') as HTMLInputElement).value = '45 minuter';
    (container.querySelector('#totalTime') as HTMLInputElement).dispatchEvent(new Event('input'));

    (container.querySelector('#servings') as HTMLInputElement).value = '4';
    (container.querySelector('#servings') as HTMLInputElement).dispatchEvent(new Event('input'));

    (container.querySelector('#tags') as HTMLInputElement).value = 'tag1, tag2';
    (container.querySelector('#tags') as HTMLInputElement).dispatchEvent(new Event('input'));

    (container.querySelector('#ingredients') as HTMLTextAreaElement).value = 'Ingredient 1\nIngredient 2';
    (container.querySelector('#ingredients') as HTMLTextAreaElement).dispatchEvent(new Event('input'));

    (container.querySelector('#instructions') as HTMLTextAreaElement).value = 'Step 1\nStep 2';
    (container.querySelector('#instructions') as HTMLTextAreaElement).dispatchEvent(new Event('input'));

    (container.querySelector('#tips') as HTMLTextAreaElement).value = 'Tip 1\nTip 2';
    (container.querySelector('#tips') as HTMLTextAreaElement).dispatchEvent(new Event('input'));

    const markdownOutput = container.querySelector('.markdown-output') as HTMLTextAreaElement;

    expect(markdownOutput.value).toContain('title: Test Recipe');
    expect(markdownOutput.value).toContain('description: A test recipe');
    expect(markdownOutput.value).toContain('totalTime: 45 minuter');
    expect(markdownOutput.value).toContain('servings: 4');
    expect(markdownOutput.value).toContain('  - tag1');
    expect(markdownOutput.value).toContain('  - tag2');
    expect(markdownOutput.value).toContain('## Ingredienser');
    expect(markdownOutput.value).toContain('- Ingredient 1');
    expect(markdownOutput.value).toContain('## Instruktioner');
    expect(markdownOutput.value).toContain('1. Step 1');
    expect(markdownOutput.value).toContain('## Tips');
    expect(markdownOutput.value).toContain('- Tip 1');
  });

  it('should generate markdown with only required fields', () => {
    createRecipeCreator(container);

    const titleInput = container.querySelector('#title') as HTMLInputElement;
    titleInput.value = 'Minimal Recipe';
    titleInput.dispatchEvent(new Event('input'));

    const markdownOutput = container.querySelector('.markdown-output') as HTMLTextAreaElement;

    expect(markdownOutput.value).toContain('title: Minimal Recipe');
    expect(markdownOutput.value).not.toContain('description');
    expect(markdownOutput.value).not.toContain('## Ingredienser');
    expect(markdownOutput.value).not.toContain('## Instruktioner');
  });

  it('should copy markdown to clipboard when copy button is clicked', async () => {
    createRecipeCreator(container);

    const titleInput = container.querySelector('#title') as HTMLInputElement;
    titleInput.value = 'Test Recipe';
    titleInput.dispatchEvent(new Event('input'));

    const copyButton = container.querySelector('.copy-button') as HTMLButtonElement;
    const markdownOutput = container.querySelector('.markdown-output') as HTMLTextAreaElement;

    copyButton.click();

    // Wait for async clipboard operation
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(markdownOutput.value);
  });

  it('should update copy button text after copying', async () => {
    vi.useFakeTimers();

    createRecipeCreator(container);

    const titleInput = container.querySelector('#title') as HTMLInputElement;
    titleInput.value = 'Test Recipe';
    titleInput.dispatchEvent(new Event('input'));

    const copyButton = container.querySelector('.copy-button') as HTMLButtonElement;
    const originalText = copyButton.textContent;

    copyButton.click();

    // Wait for async operation
    await vi.runAllTimersAsync();

    expect(copyButton.textContent).toBe(originalText);
    expect(copyButton.disabled).toBe(false);

    vi.useRealTimers();
  });

  it('should handle Swedish characters in filename', () => {
    createRecipeCreator(container);

    const titleInput = container.querySelector('#title') as HTMLInputElement;
    const filenameSpan = container.querySelector('#suggested-filename');

    titleInput.value = 'Köttbullar med Ärtor';
    titleInput.dispatchEvent(new Event('input'));

    expect(filenameSpan?.textContent).toBe('kottbullar-med-artor.md');
  });

  it('should show default filename when no title is entered', () => {
    createRecipeCreator(container);

    const filenameSpan = container.querySelector('#suggested-filename');
    expect(filenameSpan?.textContent).toBe('recipe-name.md');
  });

  it('should handle number input for servings', () => {
    createRecipeCreator(container);

    const servingsInput = container.querySelector('#servings') as HTMLInputElement;
    const markdownOutput = container.querySelector('.markdown-output') as HTMLTextAreaElement;

    // First add a title (required field)
    (container.querySelector('#title') as HTMLInputElement).value = 'Test';
    (container.querySelector('#title') as HTMLInputElement).dispatchEvent(new Event('input'));

    servingsInput.value = '6';
    servingsInput.dispatchEvent(new Event('input'));

    expect(markdownOutput.value).toContain('servings: 6');
  });
});
