export interface RecipeFormData {
  title: string;
  description?: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Lätt' | 'Medel' | 'Svår';
  tags?: string;
  ingredients?: string;
  instructions?: string;
  tips?: string;
}

export function generateRecipeMarkdown(data: RecipeFormData): string {
  const parts: string[] = [];

  // Generate YAML frontmatter
  parts.push('---');
  parts.push(`title: ${data.title}`);

  if (data.description && data.description.trim()) {
    parts.push(`description: ${data.description}`);
  }

  if (data.image && data.image.trim()) {
    parts.push(`image: ${data.image}`);
  }

  if (data.prepTime && data.prepTime.trim()) {
    parts.push(`prepTime: ${data.prepTime}`);
  }

  if (data.cookTime && data.cookTime.trim()) {
    parts.push(`cookTime: ${data.cookTime}`);
  }

  if (data.servings) {
    parts.push(`servings: ${data.servings}`);
  }

  if (data.difficulty && data.difficulty.trim()) {
    parts.push(`difficulty: ${data.difficulty}`);
  }

  if (data.tags && data.tags.trim()) {
    const tagArray = data.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tagArray.length > 0) {
      parts.push('tags:');
      tagArray.forEach(tag => {
        parts.push(`  - ${tag}`);
      });
    }
  }

  parts.push('---');
  parts.push('');

  // Generate Ingredients section
  if (data.ingredients && data.ingredients.trim()) {
    parts.push('## Ingredienser');
    parts.push('');

    const ingredientLines = data.ingredients
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    ingredientLines.forEach(line => {
      // Add bullet point if not already present
      const bullet = line.startsWith('-') ? line : `- ${line}`;
      parts.push(bullet);
    });

    parts.push('');
  }

  // Generate Instructions section
  if (data.instructions && data.instructions.trim()) {
    parts.push('## Instruktioner');
    parts.push('');

    const instructionLines = data.instructions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    instructionLines.forEach((line, index) => {
      // Add number if not already present
      const numbered = /^\d+\./.test(line) ? line : `${index + 1}. ${line}`;
      parts.push(numbered);
      parts.push('');
    });
  }

  // Generate Tips section (optional)
  if (data.tips && data.tips.trim()) {
    parts.push('## Tips');
    parts.push('');

    const tipLines = data.tips
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    tipLines.forEach(line => {
      // Add bullet point if not already present
      const bullet = line.startsWith('-') ? line : `- ${line}`;
      parts.push(bullet);
    });

    parts.push('');
  }

  return parts.join('\n');
}

export function generateFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
