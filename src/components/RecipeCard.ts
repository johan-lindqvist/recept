import type { Recipe } from '@/types/Recipe';

export function createRecipeCard(recipe: Recipe, onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.onclick = onClick;

  const title = document.createElement('h2');
  title.textContent = recipe.frontmatter.title;
  card.appendChild(title);

  if (recipe.frontmatter.description) {
    const description = document.createElement('p');
    description.textContent = recipe.frontmatter.description;
    card.appendChild(description);
  }

  const meta = document.createElement('div');
  meta.className = 'meta';

  if (recipe.frontmatter.prepTime) {
    const prepTime = document.createElement('span');
    prepTime.textContent = `Prep: ${recipe.frontmatter.prepTime}`;
    meta.appendChild(prepTime);
  }

  if (recipe.frontmatter.cookTime) {
    const cookTime = document.createElement('span');
    cookTime.textContent = `Cook: ${recipe.frontmatter.cookTime}`;
    meta.appendChild(cookTime);
  }

  if (recipe.frontmatter.difficulty) {
    const difficulty = document.createElement('span');
    difficulty.textContent = recipe.frontmatter.difficulty;
    meta.appendChild(difficulty);
  }

  card.appendChild(meta);

  return card;
}
