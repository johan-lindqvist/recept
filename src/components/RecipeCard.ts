import type { Recipe } from '@/types/Recipe';
import { createElement, icons } from 'lucide';

export function createRecipeCard(recipe: Recipe, onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.onclick = onClick;

  // Image
  if (recipe.frontmatter.image) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'recipe-card-image';

    const img = document.createElement('img');
    img.src = recipe.frontmatter.image;
    img.alt = recipe.frontmatter.title;
    img.loading = 'lazy';

    imageContainer.appendChild(img);
    card.appendChild(imageContainer);
  }

  const content = document.createElement('div');
  content.className = 'recipe-card-content';

  const title = document.createElement('h2');
  title.textContent = recipe.frontmatter.title;
  content.appendChild(title);

  if (recipe.frontmatter.description) {
    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = recipe.frontmatter.description;
    content.appendChild(description);
  }

  const meta = document.createElement('div');
  meta.className = 'meta';

  if (recipe.frontmatter.prepTime) {
    const prepTime = document.createElement('span');
    prepTime.className = 'meta-item';
    const icon = createElement(icons.Clock, { size: 16 });
    prepTime.appendChild(icon);
    const text = document.createElement('span');
    text.textContent = recipe.frontmatter.prepTime;
    prepTime.appendChild(text);
    meta.appendChild(prepTime);
  }

  if (recipe.frontmatter.cookTime) {
    const cookTime = document.createElement('span');
    cookTime.className = 'meta-item';
    const icon = createElement(icons.ChefHat, { size: 16 });
    cookTime.appendChild(icon);
    const text = document.createElement('span');
    text.textContent = recipe.frontmatter.cookTime;
    cookTime.appendChild(text);
    meta.appendChild(cookTime);
  }

  if (recipe.frontmatter.servings) {
    const servings = document.createElement('span');
    servings.className = 'meta-item';
    const icon = createElement(icons.Users, { size: 16 });
    servings.appendChild(icon);
    const text = document.createElement('span');
    text.textContent = `${recipe.frontmatter.servings} port.`;
    servings.appendChild(text);
    meta.appendChild(servings);
  }

  if (recipe.frontmatter.difficulty) {
    const difficulty = document.createElement('span');
    difficulty.className = 'meta-item';
    const icon = createElement(icons.Gauge, { size: 16 });
    difficulty.appendChild(icon);
    const text = document.createElement('span');
    text.textContent = recipe.frontmatter.difficulty;
    difficulty.appendChild(text);
    meta.appendChild(difficulty);
  }

  content.appendChild(meta);
  card.appendChild(content);

  return card;
}
