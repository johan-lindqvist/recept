import { marked } from 'marked';
import type { Recipe } from '@/types/Recipe';
import { createElement, icons } from 'lucide';

export function renderRecipeDetail(recipe: Recipe, container: HTMLElement, onBack: () => void): void {
  container.innerHTML = '';

  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  const backIcon = createElement(icons.ArrowLeft, { size: 20 });
  backButton.appendChild(backIcon);
  const backText = document.createElement('span');
  backText.textContent = 'Tillbaka till recept';
  backButton.appendChild(backText);
  backButton.onclick = onBack;
  container.appendChild(backButton);

  // Image - always show, auto-detect based on recipe slug
  const imageContainer = document.createElement('div');
  imageContainer.className = 'recipe-detail-image';

  const img = document.createElement('img');
  // Try to load image with recipe slug name, fallback to default
  img.src = `/recept/images/recipes/${recipe.slug}.svg`;
  img.alt = recipe.frontmatter.title;
  img.onerror = () => {
    img.src = '/recept/images/recipes/default-recipe.svg';
  };

  imageContainer.appendChild(img);
  container.appendChild(imageContainer);

  const title = document.createElement('h1');
  title.textContent = recipe.frontmatter.title;
  container.appendChild(title);

  if (recipe.frontmatter.description) {
    const description = document.createElement('p');
    description.className = 'recipe-description';
    description.textContent = recipe.frontmatter.description;
    container.appendChild(description);
  }

  const meta = document.createElement('div');
  meta.className = 'meta';

  if (recipe.frontmatter.prepTime) {
    const prepTime = document.createElement('span');
    prepTime.className = 'meta-item';
    const icon = createElement(icons.Clock, { size: 20 });
    prepTime.appendChild(icon);
    const label = document.createElement('div');
    label.className = 'meta-label';
    const labelText = document.createElement('span');
    labelText.className = 'meta-label-text';
    labelText.textContent = 'Förberedelse';
    const value = document.createElement('span');
    value.className = 'meta-value';
    value.textContent = recipe.frontmatter.prepTime;
    label.appendChild(labelText);
    label.appendChild(value);
    prepTime.appendChild(label);
    meta.appendChild(prepTime);
  }

  if (recipe.frontmatter.cookTime) {
    const cookTime = document.createElement('span');
    cookTime.className = 'meta-item';
    const icon = createElement(icons.ChefHat, { size: 20 });
    cookTime.appendChild(icon);
    const label = document.createElement('div');
    label.className = 'meta-label';
    const labelText = document.createElement('span');
    labelText.className = 'meta-label-text';
    labelText.textContent = 'Tillagningstid';
    const value = document.createElement('span');
    value.className = 'meta-value';
    value.textContent = recipe.frontmatter.cookTime;
    label.appendChild(labelText);
    label.appendChild(value);
    cookTime.appendChild(label);
    meta.appendChild(cookTime);
  }

  if (recipe.frontmatter.servings) {
    const servings = document.createElement('span');
    servings.className = 'meta-item';
    const icon = createElement(icons.Users, { size: 20 });
    servings.appendChild(icon);
    const label = document.createElement('div');
    label.className = 'meta-label';
    const labelText = document.createElement('span');
    labelText.className = 'meta-label-text';
    labelText.textContent = 'Portioner';
    const value = document.createElement('span');
    value.className = 'meta-value';
    value.textContent = `${recipe.frontmatter.servings}`;
    label.appendChild(labelText);
    label.appendChild(value);
    servings.appendChild(label);
    meta.appendChild(servings);
  }

  if (recipe.frontmatter.difficulty) {
    const difficulty = document.createElement('span');
    difficulty.className = 'meta-item';
    const icon = createElement(icons.Gauge, { size: 20 });
    difficulty.appendChild(icon);
    const label = document.createElement('div');
    label.className = 'meta-label';
    const labelText = document.createElement('span');
    labelText.className = 'meta-label-text';
    labelText.textContent = 'Svårighetsgrad';
    const value = document.createElement('span');
    value.className = 'meta-value';
    value.textContent = recipe.frontmatter.difficulty;
    label.appendChild(labelText);
    label.appendChild(value);
    difficulty.appendChild(label);
    meta.appendChild(difficulty);
  }

  container.appendChild(meta);

  const content = document.createElement('div');
  content.className = 'recipe-content';
  content.innerHTML = marked(recipe.content) as string;
  container.appendChild(content);
}
