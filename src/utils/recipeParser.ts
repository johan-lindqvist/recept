import matter from 'gray-matter';
import { marked } from 'marked';
import type { Recipe, RecipeFrontmatter } from '@/types/Recipe';

export async function loadRecipes(): Promise<Recipe[]> {
  // In a real implementation, this would dynamically load all markdown files
  // from the recipes directory. For now, we'll return an empty array
  // and this will be populated when we add the build step to parse recipes.
  const recipes: Recipe[] = [];

  // This is a placeholder - actual implementation will use Vite's
  // import.meta.glob to load all markdown files
  const recipeModules = import.meta.glob('../../recipes/*.md', {
    as: 'raw',
    eager: false
  });

  for (const path in recipeModules) {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    const markdown = await recipeModules[path]() as string;
    const { data, content } = matter(markdown);

    recipes.push({
      slug,
      frontmatter: data as RecipeFrontmatter,
      content,
    });
  }

  return recipes;
}

export function parseRecipeMarkdown(markdown: string): { frontmatter: RecipeFrontmatter; html: string } {
  const { data, content } = matter(markdown);
  const html = marked(content);

  return {
    frontmatter: data as RecipeFrontmatter,
    html: html as string,
  };
}
