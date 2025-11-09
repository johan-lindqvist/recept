import type { Recipe } from '@/types/Recipe';
import { createElement, icons } from 'lucide';

export function createRecipeCard(recipe: Recipe, onClick: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.onclick = onClick;

  // Image - always show, auto-detect based on recipe slug
  const imageContainer = document.createElement('div');
  imageContainer.className = 'recipe-card-image';

  const img = document.createElement('img');
  // Try to load image with recipe slug name, fallback to default
  img.src = `/recept/images/recipes/${recipe.slug}.svg`;
  img.alt = recipe.frontmatter.title;
  img.loading = 'lazy';
  img.onerror = () => {
    img.src = '/recept/images/recipes/default-recipe.svg';
  };

  imageContainer.appendChild(img);
  card.appendChild(imageContainer);

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

  // Tags
  if (recipe.frontmatter.tags && recipe.frontmatter.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'recipe-tags';

    const maxVisibleTags = 3;
    const tags = recipe.frontmatter.tags;
    const visibleTags = tags.slice(0, maxVisibleTags);
    const hiddenTags = tags.slice(maxVisibleTags);

    // Create visible tag labels
    visibleTags.forEach(tag => {
      const tagLabel = document.createElement('span');
      tagLabel.className = 'tag-label';
      tagLabel.textContent = tag;
      tagsContainer.appendChild(tagLabel);
    });

    // Create "more" indicator if there are hidden tags
    if (hiddenTags.length > 0) {
      const moreLabel = document.createElement('span');
      moreLabel.className = 'tag-label tag-more';
      moreLabel.textContent = `+${hiddenTags.length} mer`;

      // Prevent card click when clicking the more button
      const toggleTags = (e: MouseEvent) => {
        e.stopPropagation();

        // Toggle expansion
        const isExpanded = tagsContainer.classList.contains('expanded');

        if (isExpanded) {
          // Collapse: remove hidden tags and the "visa färre" button
          const allLabels = Array.from(tagsContainer.querySelectorAll('.tag-label'));
          allLabels.slice(maxVisibleTags).forEach(label => label.remove());

          // Add back the "+X mer" button
          const newMoreLabel = document.createElement('span');
          newMoreLabel.className = 'tag-label tag-more';
          newMoreLabel.textContent = `+${hiddenTags.length} mer`;
          newMoreLabel.onclick = toggleTags;
          tagsContainer.appendChild(newMoreLabel);

          tagsContainer.classList.remove('expanded');
        } else {
          // Expand: remove the "+X mer" button
          const currentMoreLabel = tagsContainer.querySelector('.tag-more');
          currentMoreLabel?.remove();

          // Show all hidden tags
          hiddenTags.forEach(tag => {
            const tagLabel = document.createElement('span');
            tagLabel.className = 'tag-label';
            tagLabel.textContent = tag;
            tagsContainer.appendChild(tagLabel);
          });

          // Add collapse label
          const lessLabel = document.createElement('span');
          lessLabel.className = 'tag-label tag-more';
          lessLabel.textContent = 'visa färre';
          lessLabel.onclick = toggleTags;
          tagsContainer.appendChild(lessLabel);
          tagsContainer.classList.add('expanded');
        }
      };

      moreLabel.onclick = toggleTags;

      tagsContainer.appendChild(moreLabel);
    }

    content.appendChild(tagsContainer);
  }

  card.appendChild(content);

  return card;
}
