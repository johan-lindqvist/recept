import { describe, it, expect } from 'vitest';
import {
  parseIngredient,
  scaleIngredient,
  scaleIngredientsInMarkdown,
  formatQuantity,
  convertVolume,
} from './ingredientScaler';

describe('formatQuantity', () => {
  it('formats whole numbers', () => {
    expect(formatQuantity(3)).toBe('3');
    expect(formatQuantity(10)).toBe('10');
  });

  it('formats common fractions', () => {
    expect(formatQuantity(0.5)).toBe('1/2');
    expect(formatQuantity(0.25)).toBe('1/4');
    expect(formatQuantity(0.75)).toBe('3/4');
  });

  it('formats mixed numbers with fractions', () => {
    expect(formatQuantity(1.5)).toBe('1 1/2');
    expect(formatQuantity(2.5)).toBe('2 1/2');
    expect(formatQuantity(1.25)).toBe('1 1/4');
  });

  it('rounds near-whole numbers', () => {
    expect(formatQuantity(2.95)).toBe('3');
    expect(formatQuantity(3.05)).toBe('3');
  });

  it('formats decimals that are not common fractions', () => {
    expect(formatQuantity(1.3)).toBe('1,3');
    expect(formatQuantity(2.7)).toBe('2,7');
  });
});

describe('parseIngredient', () => {
  it('parses simple quantity with unit', () => {
    const result = parseIngredient('3 dl mjöl');
    expect(result.quantity).toBe(3);
    expect(result.unit).toBe('dl');
    expect(result.rest).toBe('mjöl');
  });

  it('parses quantity with unit without space', () => {
    const result = parseIngredient('500g nötfärs');
    expect(result.quantity).toBe(500);
    expect(result.unit).toBe('g');
    expect(result.rest).toBe('nötfärs');
  });

  it('parses quantity with gram unit', () => {
    const result = parseIngredient('150 gram smör');
    expect(result.quantity).toBe(150);
    expect(result.unit).toBe('gram');
    expect(result.rest).toBe('smör');
  });

  it('parses quantity without unit', () => {
    const result = parseIngredient('2 ägg');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('');
    expect(result.rest).toBe('ägg');
  });

  it('parses fractions', () => {
    const result = parseIngredient('1/2 tsk salt');
    expect(result.quantity).toBe(0.5);
    expect(result.unit).toBe('tsk');
    expect(result.rest).toBe('salt');
  });

  it('parses mixed numbers', () => {
    const result = parseIngredient('1 1/2 dl socker');
    expect(result.quantity).toBe(1.5);
    expect(result.unit).toBe('dl');
    expect(result.rest).toBe('socker');
  });

  it('handles ingredients without quantity', () => {
    const result = parseIngredient('Kanel');
    expect(result.quantity).toBeNull();
    expect(result.unit).toBe('');
    expect(result.rest).toBe('Kanel');
  });

  it('parses burk/burkar unit', () => {
    const result = parseIngredient('1 burk krossade tomater');
    expect(result.quantity).toBe(1);
    expect(result.unit).toBe('burk');
    expect(result.rest).toBe('krossade tomater');
  });

  it('parses msk unit', () => {
    const result = parseIngredient('2 msk olivolja');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('msk');
    expect(result.rest).toBe('olivolja');
  });

  it('parses decimal with comma', () => {
    const result = parseIngredient('2,5 dl grädde');
    expect(result.quantity).toBe(2.5);
    expect(result.unit).toBe('dl');
    expect(result.rest).toBe('grädde');
  });
});

describe('scaleIngredient', () => {
  it('scales quantity by ratio', () => {
    expect(scaleIngredient('3 dl mjöl', 2)).toBe('6 dl mjöl');
    expect(scaleIngredient('100 g smör', 1.5)).toBe('150 g smör');
  });

  it('returns original when ratio is 1', () => {
    expect(scaleIngredient('3 dl mjöl', 1)).toBe('3 dl mjöl');
  });

  it('returns original for ingredients without quantity', () => {
    expect(scaleIngredient('Kanel', 2)).toBe('Kanel');
  });

  it('scales fractions correctly', () => {
    expect(scaleIngredient('1/2 tsk salt', 2)).toBe('1 tsk salt');
    expect(scaleIngredient('1 1/2 dl socker', 2)).toBe('3 dl socker');
  });

  it('formats scaled results as fractions when appropriate', () => {
    expect(scaleIngredient('1 dl mjöl', 0.5)).toBe('1/2 dl mjöl');
    expect(scaleIngredient('2 msk olja', 0.75)).toBe('1 1/2 msk olja');
  });

  it('scales quantity without unit', () => {
    expect(scaleIngredient('2 ägg', 2)).toBe('4 ägg');
  });
});

describe('scaleIngredientsInMarkdown', () => {
  it('scales all list items', () => {
    const content = `- 3 dl mjöl
- 2 ägg
- 100 g smör`;

    const result = scaleIngredientsInMarkdown(content, 2);

    expect(result).toBe(`- 6 dl mjöl
- 4 ägg
- 200 g smör`);
  });

  it('returns original when ratio is 1', () => {
    const content = '- 3 dl mjöl';
    expect(scaleIngredientsInMarkdown(content, 1)).toBe(content);
  });

  it('preserves non-list items', () => {
    const content = `Some text
- 3 dl mjöl
More text`;

    const result = scaleIngredientsInMarkdown(content, 2);

    expect(result).toBe(`Some text
- 6 dl mjöl
More text`);
  });

  it('handles ingredients without quantities', () => {
    const content = `- 3 dl mjöl
- Kanel
- 2 ägg`;

    const result = scaleIngredientsInMarkdown(content, 2);

    expect(result).toBe(`- 6 dl mjöl
- Kanel
- 4 ägg`);
  });

  it('preserves list item prefix spacing', () => {
    const content = '  - 3 dl mjöl';
    const result = scaleIngredientsInMarkdown(content, 2);
    expect(result).toBe('  - 6 dl mjöl');
  });
});

describe('convertVolume', () => {
  it('converts tsk to msk when appropriate', () => {
    // 3 tsk = 1 msk
    const result = convertVolume(3, 'tsk');
    expect(result).toEqual({ quantity: 1, unit: 'msk' });
  });

  it('converts tsk to msk for 6 tsk', () => {
    // 6 tsk = 2 msk
    const result = convertVolume(6, 'tsk');
    expect(result).toEqual({ quantity: 2, unit: 'msk' });
  });

  it('converts msk to dl when appropriate', () => {
    // 100ml / 15ml = 6.67 msk, but 7 msk = 105ml ≈ 1 dl
    // Actually testing with exact dl amounts
    const result = convertVolume(20, 'msk'); // 300ml = 3 dl
    expect(result).toEqual({ quantity: 3, unit: 'dl' });
  });

  it('converts dl to l for large amounts', () => {
    const result = convertVolume(10, 'dl');
    expect(result).toEqual({ quantity: 1, unit: 'l' });
  });

  it('returns null for non-volume units', () => {
    expect(convertVolume(100, 'g')).toBeNull();
    expect(convertVolume(2, 'st')).toBeNull();
  });

  it('returns null when no better unit exists', () => {
    // 2 tsk is not cleanly convertible to msk
    expect(convertVolume(2, 'tsk')).toBeNull();
  });

  it('converts krm to tsk when appropriate', () => {
    // 5 krm = 1 tsk
    const result = convertVolume(5, 'krm');
    expect(result).toEqual({ quantity: 1, unit: 'tsk' });
  });
});

describe('scaleIngredient with unit conversion', () => {
  it('converts 1 tsk to 1 msk when tripled', () => {
    // 1 tsk * 3 = 3 tsk = 1 msk
    expect(scaleIngredient('1 tsk salt', 3)).toBe('1 msk salt');
  });

  it('converts 2 tsk to 2 msk when tripled', () => {
    // 2 tsk * 3 = 6 tsk = 2 msk
    expect(scaleIngredient('2 tsk socker', 3)).toBe('2 msk socker');
  });

  it('converts msk to dl for large scaling', () => {
    // 5 msk * 4 = 20 msk = 300ml = 3 dl
    expect(scaleIngredient('5 msk olja', 4)).toBe('3 dl olja');
  });

  it('keeps unit when conversion would not be clean', () => {
    // 2 tsk * 2 = 4 tsk (not cleanly 1.33 msk)
    expect(scaleIngredient('2 tsk salt', 2)).toBe('4 tsk salt');
  });

  it('converts dl to l for 10+ dl', () => {
    // 5 dl * 2 = 10 dl = 1 l
    expect(scaleIngredient('5 dl vatten', 2)).toBe('1 l vatten');
  });

  it('does not convert non-volume units', () => {
    expect(scaleIngredient('100 g smör', 2)).toBe('200 g smör');
    expect(scaleIngredient('2 st ägg', 3)).toBe('6 st ägg');
  });
});
