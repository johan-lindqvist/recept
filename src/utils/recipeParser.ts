import matter from 'gray-matter';
import { marked } from 'marked';
import type { Recipe, RecipeFrontmatter } from '@/types/Recipe';

export async function loadRecipes(): Promise<Recipe[]> {
  const recipes: Recipe[] = [];

  // Use Vite's import.meta.glob to load all markdown files
  // Using relative path from this file (src/utils/)
  const recipeModules = import.meta.glob('../../recipes/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
  });

  for (const path in recipeModules) {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    // With eager: true, the value is already loaded, not a function
    const markdown = recipeModules[path] as string;
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
