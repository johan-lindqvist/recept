import { describe, it, expect } from 'vitest';
import {
  parseInstructions,
  parseIngredients,
  extractRecipeSections,
} from './instructionParser';

describe('parseInstructions', () => {
  it('should parse ordered list instructions', () => {
    const markdown = `1. Förvärm ugnen till 200°C
2. Blanda mjöl och socker
3. Grädda i 20 minuter`;

    const result = parseInstructions(markdown);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      index: 0,
      text: 'Förvärm ugnen till 200°C',
      originalNumber: 1,
    });
    expect(result[1]).toEqual({
      index: 1,
      text: 'Blanda mjöl och socker',
      originalNumber: 2,
    });
    expect(result[2]).toEqual({
      index: 2,
      text: 'Grädda i 20 minuter',
      originalNumber: 3,
    });
  });

  it('should parse unordered list instructions with dashes', () => {
    const markdown = `- Förvärm ugnen
- Blanda ingredienserna
- Grädda tills gyllene`;

    const result = parseInstructions(markdown);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      index: 0,
      text: 'Förvärm ugnen',
      originalNumber: undefined,
    });
    expect(result[1]).toEqual({
      index: 1,
      text: 'Blanda ingredienserna',
      originalNumber: undefined,
    });
  });

  it('should parse unordered list instructions with asterisks', () => {
    const markdown = `* Steg ett
* Steg två`;

    const result = parseInstructions(markdown);

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Steg ett');
    expect(result[1].text).toBe('Steg två');
  });

  it('should handle empty lines between items', () => {
    const markdown = `1. Första steget

2. Andra steget

3. Tredje steget`;

    const result = parseInstructions(markdown);

    expect(result).toHaveLength(3);
  });

  it('should return empty array for empty input', () => {
    expect(parseInstructions('')).toEqual([]);
  });

  it('should ignore non-list content', () => {
    const markdown = `Denna text är inte en lista.

1. Men detta är ett steg`;

    const result = parseInstructions(markdown);

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Men detta är ett steg');
  });
});

describe('parseIngredients', () => {
  it('should parse unordered list ingredients', () => {
    const markdown = `- 2 dl mjöl
- 1 ägg
- 1 msk smör`;

    const result = parseIngredients(markdown);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ index: 0, text: '2 dl mjöl' });
    expect(result[1]).toEqual({ index: 1, text: '1 ägg' });
    expect(result[2]).toEqual({ index: 2, text: '1 msk smör' });
  });

  it('should parse ordered list ingredients', () => {
    const markdown = `1. 200 g smör
2. 3 dl socker`;

    const result = parseIngredients(markdown);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ index: 0, text: '200 g smör' });
    expect(result[1]).toEqual({ index: 1, text: '3 dl socker' });
  });

  it('should handle mixed formatting', () => {
    const markdown = `- 2 dl mjöl
* 1 ägg`;

    const result = parseIngredients(markdown);

    expect(result).toHaveLength(2);
  });
});

describe('extractRecipeSections', () => {
  it('should extract ingredients and instructions sections', () => {
    const content = `## Ingredienser

- 2 dl mjöl
- 1 ägg

## Instruktioner

1. Blanda allt
2. Grädda`;

    const result = extractRecipeSections(content);

    expect(result.ingredients).toContain('2 dl mjöl');
    expect(result.ingredients).toContain('1 ägg');
    expect(result.instructions).toContain('Blanda allt');
    expect(result.instructions).toContain('Grädda');
  });

  it('should return null for missing sections', () => {
    const content = `## Tips

Några tips här`;

    const result = extractRecipeSections(content);

    expect(result.ingredients).toBeNull();
    expect(result.instructions).toBeNull();
  });

  it('should handle case-insensitive section titles', () => {
    const content = `## INGREDIENSER

- 1 ägg

## instruktioner

1. Koka`;

    const result = extractRecipeSections(content);

    expect(result.ingredients).toContain('1 ägg');
    expect(result.instructions).toContain('Koka');
  });

  it('should preserve content formatting within sections', () => {
    const content = `## Ingredienser

- 2 dl **vetemjöl**
- 1 ägg

## Instruktioner

1. Blanda **noggrant**`;

    const result = extractRecipeSections(content);

    expect(result.ingredients).toContain('**vetemjöl**');
    expect(result.instructions).toContain('**noggrant**');
  });
});
