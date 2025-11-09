import { describe, it, expect } from 'vitest';
import { generateRecipeMarkdown, generateFilename, type RecipeFormData } from './markdownGenerator';

describe('generateRecipeMarkdown', () => {
  it('should generate markdown with all fields', () => {
    const data: RecipeFormData = {
      title: 'Test Recipe',
      description: 'A test recipe',
      totalTime: '45 minuter',
      servings: 4,
      tags: 'tag1, tag2, tag3',
      ingredients: 'Ingredient 1\nIngredient 2\nIngredient 3',
      instructions: 'Step 1\nStep 2\nStep 3',
      tips: 'Tip 1\nTip 2'
    };

    const markdown = generateRecipeMarkdown(data);

    expect(markdown).toContain('title: Test Recipe');
    expect(markdown).toContain('description: A test recipe');
    expect(markdown).toContain('totalTime: 45 minuter');
    expect(markdown).toContain('servings: 4');
    expect(markdown).toContain('tags:');
    expect(markdown).toContain('  - tag1');
    expect(markdown).toContain('  - tag2');
    expect(markdown).toContain('  - tag3');
    expect(markdown).toContain('## Ingredienser');
    expect(markdown).toContain('- Ingredient 1');
    expect(markdown).toContain('## Instruktioner');
    expect(markdown).toContain('1. Step 1');
    expect(markdown).toContain('## Tips');
    expect(markdown).toContain('- Tip 1');
  });

  it('should generate markdown with only required fields', () => {
    const data: RecipeFormData = {
      title: 'Minimal Recipe'
    };

    const markdown = generateRecipeMarkdown(data);

    expect(markdown).toContain('---');
    expect(markdown).toContain('title: Minimal Recipe');
    expect(markdown).not.toContain('description');
    expect(markdown).not.toContain('## Ingredienser');
    expect(markdown).not.toContain('## Instruktioner');
  });

  it('should handle ingredients with existing bullet points', () => {
    const data: RecipeFormData = {
      title: 'Recipe',
      ingredients: '- Already bulleted\nNot bulleted'
    };

    const markdown = generateRecipeMarkdown(data);

    expect(markdown).toContain('- Already bulleted');
    expect(markdown).toContain('- Not bulleted');
  });

  it('should handle instructions with existing numbers', () => {
    const data: RecipeFormData = {
      title: 'Recipe',
      instructions: '1. Already numbered\nNot numbered'
    };

    const markdown = generateRecipeMarkdown(data);

    expect(markdown).toContain('1. Already numbered');
    expect(markdown).toContain('2. Not numbered');
  });

  it('should handle empty strings as no data', () => {
    const data: RecipeFormData = {
      title: 'Recipe',
      description: '   ',
      ingredients: '   ',
      tips: ''
    };

    const markdown = generateRecipeMarkdown(data);

    expect(markdown).not.toContain('description');
    expect(markdown).not.toContain('## Ingredienser');
    expect(markdown).not.toContain('## Tips');
  });

  it('should handle tags with extra whitespace', () => {
    const data: RecipeFormData = {
      title: 'Recipe',
      tags: '  tag1  ,  tag2  ,   ,  tag3  '
    };

    const markdown = generateRecipeMarkdown(data);

    expect(markdown).toContain('  - tag1');
    expect(markdown).toContain('  - tag2');
    expect(markdown).toContain('  - tag3');
  });

  it('should skip empty lines in ingredients', () => {
    const data: RecipeFormData = {
      title: 'Recipe',
      ingredients: 'Ingredient 1\n\n\nIngredient 2\n\n'
    };

    const markdown = generateRecipeMarkdown(data);

    expect(markdown).toContain('- Ingredient 1');
    expect(markdown).toContain('- Ingredient 2');
    expect(markdown.match(/- Ingredient/g)).toHaveLength(2);
  });

  it('should add blank lines between numbered instructions', () => {
    const data: RecipeFormData = {
      title: 'Recipe',
      instructions: 'Step 1\nStep 2'
    };

    const markdown = generateRecipeMarkdown(data);

    expect(markdown).toContain('1. Step 1\n\n2. Step 2');
  });
});

describe('generateFilename', () => {
  it('should convert title to valid filename', () => {
    expect(generateFilename('My Recipe Name')).toBe('my-recipe-name');
  });

  it('should handle Swedish characters', () => {
    expect(generateFilename('Köttbullar med Ägg och Sås')).toBe('kottbullar-med-agg-och-sas');
  });

  it('should remove special characters', () => {
    expect(generateFilename('Recipe (Special) & Chars!')).toBe('recipe-special-chars');
  });

  it('should handle multiple spaces and hyphens', () => {
    expect(generateFilename('Too   Many    Spaces')).toBe('too-many-spaces');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(generateFilename('---Recipe---')).toBe('recipe');
  });
});
