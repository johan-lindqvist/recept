import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/RecipeCard';

export function RecipeListPage() {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) {
      return recipes;
    }

    const query = searchQuery.toLowerCase();
    return recipes.filter(recipe => {
      const titleMatch = recipe.frontmatter.title.toLowerCase().includes(query);
      const descMatch = recipe.frontmatter.description?.toLowerCase().includes(query);
      const tagsMatch = recipe.frontmatter.tags?.some(tag => tag.toLowerCase().includes(query));

      return titleMatch || descMatch || tagsMatch;
    });
  }, [recipes, searchQuery]);

  const handleRecipeClick = (slug: string) => {
    navigate(`/recipe/${slug}`);
  };

  const handleCreateClick = () => {
    navigate('/create');
  };

  if (loading) {
    return <div className="loading">Laddar recept...</div>;
  }

  if (error) {
    return <div className="error">Fel: {error.message}</div>;
  }

  return (
    <div className="app">
      <div className="search-container">
        <input
          type="text"
          placeholder="Sök recept..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn-primary" onClick={handleCreateClick}>
          + Skapa Recept
        </button>
      </div>

      <div className="recipe-grid">
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
