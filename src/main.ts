import { loadRecipes } from '@/utils/recipeParser';
import { createRecipeCard } from '@/components/RecipeCard';
import { renderRecipeDetail } from '@/components/RecipeDetail';
import type { Recipe } from '@/types/Recipe';

let allRecipes: Recipe[] = [];
let filteredRecipes: Recipe[] = [];

const recipeListContainer = document.getElementById('recipe-list') as HTMLElement;
const recipeDetailContainer = document.getElementById('recipe-detail') as HTMLElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

async function init() {
  allRecipes = await loadRecipes();
  filteredRecipes = [...allRecipes];
  renderRecipeList();
}

function renderRecipeList() {
  recipeListContainer.innerHTML = '';
  recipeListContainer.style.display = 'grid';
  recipeDetailContainer.style.display = 'none';

  if (filteredRecipes.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Inga recept hittades.';
    recipeListContainer.appendChild(emptyMessage);
    return;
  }

  filteredRecipes.forEach((recipe) => {
    const card = createRecipeCard(recipe, () => showRecipeDetail(recipe));
    recipeListContainer.appendChild(card);
  });
}

function showRecipeDetail(recipe: Recipe) {
  recipeListContainer.style.display = 'none';
  recipeDetailContainer.style.display = 'block';
  renderRecipeDetail(recipe, recipeDetailContainer, () => {
    renderRecipeList();
  });
}

searchInput.addEventListener('input', (e) => {
  const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();

  filteredRecipes = allRecipes.filter((recipe) => {
    const title = recipe.frontmatter.title.toLowerCase();
    const description = recipe.frontmatter.description?.toLowerCase() || '';
    const tags = recipe.frontmatter.tags?.join(' ').toLowerCase() || '';

    return title.includes(searchTerm) ||
           description.includes(searchTerm) ||
           tags.includes(searchTerm);
  });

  renderRecipeList();
});

init();
