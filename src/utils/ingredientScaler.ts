/**
 * Parses and scales ingredient quantities for recipe portion adjustment.
 */

interface ParsedIngredient {
  quantity: number | null;
  unit: string;
  rest: string;
  original: string;
}

// Regex to match quantity at start of ingredient line
// Handles: "3 dl", "500g", "1/2 tsk", "1 1/2 dl", "2-3 st"
// Order matters: try fraction first, then mixed number, then plain number
const QUANTITY_REGEX = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)\s*/;

// Common Swedish units (with variations)
const UNITS = [
  'kg', 'g', 'gram',
  'l', 'liter', 'dl', 'cl', 'ml',
  'msk', 'matsked', 'tsk', 'tesked',
  'krm', 'kryddmått',
  'st', 'stycken', 'styck',
  'burk', 'burkar',
  'paket', 'pkt',
  'påse', 'påsar',
  'näve', 'nävar',
  'knippe', 'knippor',
  'klyfta', 'klyftor',
  'skiva', 'skivor',
];

/**
 * Parse a fraction string like "1/2" or "3/4" to a number
 */
function parseFraction(fraction: string): number {
  const [num, denom] = fraction.split('/').map(Number);
  return num / denom;
}

/**
 * Parse a quantity string that may contain mixed numbers or ranges
 * Examples: "3", "1/2", "1 1/2", "2-3", "500"
 */
function parseQuantity(quantityStr: string): number {
  // Remove any comma decimal separator and normalize
  const normalized = quantityStr.replace(',', '.').trim();

  // Handle ranges like "2-3" - take the first number
  if (normalized.includes('-') || normalized.includes('–')) {
    const parts = normalized.split(/[-–]/);
    return parseQuantity(parts[0].trim());
  }

  // Handle mixed numbers like "1 1/2"
  if (normalized.includes(' ') && normalized.includes('/')) {
    const parts = normalized.split(' ');
    const whole = parseFloat(parts[0]);
    const fraction = parseFraction(parts[1]);
    return whole + fraction;
  }

  // Handle pure fractions like "1/2"
  if (normalized.includes('/')) {
    return parseFraction(normalized);
  }

  // Handle regular numbers
  return parseFloat(normalized);
}

/**
 * Format a number as a nice string, using fractions when appropriate
 */
export function formatQuantity(num: number): string {
  // Handle common fractions with tighter tolerance
  const fractions: [number, string][] = [
    [0.25, '1/4'],
    [1 / 3, '1/3'],
    [0.5, '1/2'],
    [2 / 3, '2/3'],
    [0.75, '3/4'],
  ];

  const whole = Math.floor(num);
  const decimal = num - whole;

  // Check if decimal part matches a common fraction (tight tolerance)
  for (const [value, display] of fractions) {
    if (Math.abs(decimal - value) < 0.02) {
      if (whole === 0) {
        return display;
      }
      return `${whole} ${display}`;
    }
  }

  // For small decimals, round to whole number
  if (decimal < 0.1) {
    return whole.toString();
  }
  if (decimal > 0.9) {
    return (whole + 1).toString();
  }

  // Otherwise, round to 1 decimal place if needed
  const rounded = Math.round(num * 10) / 10;
  if (rounded === Math.floor(rounded)) {
    return rounded.toString();
  }
  return rounded.toString().replace('.', ',');
}

/**
 * Parse an ingredient line and extract quantity, unit, and the rest
 */
export function parseIngredient(line: string): ParsedIngredient {
  const trimmed = line.trim();

  // Try to match a quantity at the start
  const quantityMatch = trimmed.match(QUANTITY_REGEX);

  if (!quantityMatch) {
    // No quantity found
    return {
      quantity: null,
      unit: '',
      rest: trimmed,
      original: line,
    };
  }

  const quantityStr = quantityMatch[1];
  const quantity = parseQuantity(quantityStr);
  let remaining = trimmed.slice(quantityMatch[0].length);

  // Try to match a unit
  let unit = '';
  const lowerRemaining = remaining.toLowerCase();

  for (const u of UNITS) {
    if (lowerRemaining.startsWith(u + ' ') || lowerRemaining === u) {
      unit = remaining.slice(0, u.length);
      remaining = remaining.slice(u.length).trim();
      break;
    }
  }

  return {
    quantity,
    unit,
    rest: remaining,
    original: line,
  };
}

/**
 * Scale an ingredient line by a ratio
 */
export function scaleIngredient(line: string, ratio: number): string {
  const parsed = parseIngredient(line);

  if (parsed.quantity === null || ratio === 1) {
    return line;
  }

  const scaledQuantity = parsed.quantity * ratio;
  const formattedQuantity = formatQuantity(scaledQuantity);

  // Reconstruct the line
  const parts = [formattedQuantity];
  if (parsed.unit) {
    parts.push(parsed.unit);
  }
  if (parsed.rest) {
    parts.push(parsed.rest);
  }

  return parts.join(' ');
}

/**
 * Scale all ingredients in a markdown content string
 * Only processes lines that start with "- " (list items)
 */
export function scaleIngredientsInMarkdown(content: string, ratio: number): string {
  if (ratio === 1) {
    return content;
  }

  const lines = content.split('\n');
  const scaledLines = lines.map(line => {
    // Check if this is a list item
    if (line.trim().startsWith('- ')) {
      const prefix = line.match(/^(\s*- )/)?.[1] || '- ';
      const ingredientPart = line.trim().slice(2); // Remove "- "
      const scaled = scaleIngredient(ingredientPart, ratio);
      return prefix + scaled;
    }
    return line;
  });

  return scaledLines.join('\n');
}
