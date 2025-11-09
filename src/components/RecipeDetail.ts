import { marked } from 'marked';
import type { Recipe } from '@/types/Recipe';
import { createElement, icons } from 'lucide';

export function renderRecipeDetail(recipe: Recipe, container: HTMLElement): void {
  container.innerHTML = '';

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

  if (recipe.frontmatter.totalTime) {
    const totalTime = document.createElement('span');
    totalTime.className = 'meta-item';
    const icon = createElement(icons.Clock, { size: 20 });
    totalTime.appendChild(icon);
    const label = document.createElement('div');
    label.className = 'meta-label';
    const labelText = document.createElement('span');
    labelText.className = 'meta-label-text';
    labelText.textContent = 'Total tid';
    const value = document.createElement('span');
    value.className = 'meta-value';
    value.textContent = recipe.frontmatter.totalTime;
    label.appendChild(labelText);
    label.appendChild(value);
    totalTime.appendChild(label);
    meta.appendChild(totalTime);
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
