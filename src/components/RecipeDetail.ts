import { marked } from 'marked';
import type { Recipe } from '@/types/Recipe';

export function renderRecipeDetail(recipe: Recipe, container: HTMLElement, onBack: () => void): void {
  container.innerHTML = '';

  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.textContent = '← Back to recipes';
  backButton.onclick = onBack;
  container.appendChild(backButton);

  const title = document.createElement('h1');
  title.textContent = recipe.frontmatter.title;
  container.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'meta';

  if (recipe.frontmatter.prepTime) {
    const prepTime = document.createElement('span');
    prepTime.textContent = `Prep Time: ${recipe.frontmatter.prepTime}`;
    meta.appendChild(prepTime);
  }

  if (recipe.frontmatter.cookTime) {
    const cookTime = document.createElement('span');
    cookTime.textContent = `Cook Time: ${recipe.frontmatter.cookTime}`;
    meta.appendChild(cookTime);
  }

  if (recipe.frontmatter.servings) {
    const servings = document.createElement('span');
    servings.textContent = `Servings: ${recipe.frontmatter.servings}`;
    meta.appendChild(servings);
  }

  container.appendChild(meta);

  const content = document.createElement('div');
  content.className = 'recipe-content';
  content.innerHTML = marked(recipe.content) as string;
  container.appendChild(content);
}
