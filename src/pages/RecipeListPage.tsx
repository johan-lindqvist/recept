import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/RecipeCard';

type ViewMode = 'grid' | 'list';

export function RecipeListPage() {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipes();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('recipeViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'grid';
  });

  useEffect(() => {
    localStorage.setItem('recipeViewMode', viewMode);
  }, [viewMode]);

  const filteredRecipes = useMemo(() => {
    let results = recipes;

    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = recipes.filter(recipe => {
        const titleMatch = recipe.frontmatter.title.toLowerCase().includes(query);
        const descMatch = recipe.frontmatter.description?.toLowerCase().includes(query);
        const tagsMatch = recipe.frontmatter.tags?.some(tag => tag.toLowerCase().includes(query));

        return titleMatch || descMatch || tagsMatch;
      });
    }

    // Sort alphabetically by title
    return results.sort((a, b) =>
      a.frontmatter.title.localeCompare(b.frontmatter.title, 'sv')
    );
  }, [recipes, searchQuery]);

  const handleRecipeClick = (slug: string) => {
    navigate(`/recipe/${slug}`);
  };

  if (loading) {
    return <div className="loading">Laddar recept...</div>;
  }

  if (error) {
    return <div className="error">Fel: {error.message}</div>;
  }

  return (
    <div className="app">
      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
        >
          <LayoutGrid size={20} />
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
          aria-label="List view"
        >
          <List size={20} />
        </button>
      </div>

      <div className={viewMode === 'grid' ? 'recipe-grid' : 'recipe-list'}>
        {filteredRecipes.map(recipe => (
          <RecipeCard
            key={recipe.slug}
            recipe={recipe}
            onClick={() => handleRecipeClick(recipe.slug)}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && searchQuery && (
        <div className="no-results">
          Inga recept hittades för "{searchQuery}"
        </div>
      )}
    </div>
  );
}
