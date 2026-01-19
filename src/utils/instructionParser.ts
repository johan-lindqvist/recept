export interface ParsedStep {
  index: number;
  text: string;
  originalNumber?: number;
}

export interface ParsedIngredient {
  index: number;
  text: string;
}

/**
 * Parse markdown instruction content into individual steps.
 * Handles both ordered lists (1. 2. 3.) and unordered lists (- *)
 */
export function parseInstructions(markdown: string): ParsedStep[] {
  const lines = markdown.split('\n');
  const steps: ParsedStep[] = [];
  let index = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match ordered list items: "1. ", "2. ", etc.
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      steps.push({
        index,
        text: orderedMatch[2],
        originalNumber: parseInt(orderedMatch[1], 10),
      });
      index++;
      continue;
    }

    // Match unordered list items: "- " or "* "
    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      steps.push({
        index,
        text: unorderedMatch[1],
        originalNumber: undefined,
      });
      index++;
    }
  }

  return steps;
}

/**
 * Parse markdown ingredient content into individual items.
 * Handles both ordered lists (1. 2. 3.) and unordered lists (- *)
 */
export function parseIngredients(markdown: string): ParsedIngredient[] {
  const lines = markdown.split('\n');
  const ingredients: ParsedIngredient[] = [];
  let index = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match ordered list items: "1. ", "2. ", etc.
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      ingredients.push({
        index,
        text: orderedMatch[2],
      });
      index++;
      continue;
    }

    // Match unordered list items: "- " or "* "
    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      ingredients.push({
        index,
        text: unorderedMatch[1],
      });
      index++;
    }
  }

  return ingredients;
}

/**
 * Extract recipe sections from full markdown content.
 * Returns ingredients and instructions markdown content separately.
 */
export function extractRecipeSections(content: string): {
  ingredients: string | null;
  instructions: string | null;
} {
  const sections: { title: string; content: string }[] = [];
  const parts = content.split(/^## /gm);

  // First part is before any heading (usually empty)
  parts.shift();

  parts.forEach(part => {
    const lines = part.split('\n');
    const title = lines[0].trim();
    const sectionContent = lines.slice(1).join('\n').trim();

    if (title && sectionContent) {
      sections.push({ title, content: sectionContent });
    }
  });

  const ingredientsSection = sections.find(
    s => s.title.toLowerCase() === 'ingredienser'
  );
  const instructionsSection = sections.find(
    s => s.title.toLowerCase() === 'instruktioner'
  );

  return {
    ingredients: ingredientsSection?.content || null,
    instructions: instructionsSection?.content || null,
  };
}
