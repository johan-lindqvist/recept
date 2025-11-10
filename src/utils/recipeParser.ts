import matter from 'gray-matter';
import { marked } from 'marked';
import type { Recipe, RecipeFrontmatter } from '@/types/Recipe';

export async function loadRecipes(): Promise<Recipe[]> {
  const recipes: Recipe[] = [];

  // Use Vite's import.meta.glob to load all markdown files
  // Using relative path from this file (src/utils/)
  // Without eager: true, recipes are code-split into separate chunks
  const recipeModules = import.meta.glob('../../recipes/*.md', {
    query: '?raw',
    import: 'default',
  });

  // Load all recipes in parallel
  const recipePromises = Object.entries(recipeModules).map(async ([path, loadModule]) => {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    const markdown = await loadModule() as string;
    const { data, content } = matter(markdown);

    return {
      slug,
      frontmatter: data as RecipeFrontmatter,
      content,
    };
  });

  const loadedRecipes = await Promise.all(recipePromises);
  recipes.push(...loadedRecipes);

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
