import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/RecipeCard';

type ViewMode = 'grid' | 'list';

export function RecipeListPage() {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipes();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const tagFilter = searchParams.get('tag') || '';

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('recipeViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'grid';
  });

  useEffect(() => {
    localStorage.setItem('recipeViewMode', viewMode);
  }, [viewMode]);

  // Extract all unique tags from recipes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    recipes.forEach(recipe => {
      recipe.frontmatter.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'sv'));
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    let results = recipes;

    // Filter by tag if present
    if (tagFilter) {
      results = results.filter(recipe =>
        recipe.frontmatter.tags?.includes(tagFilter)
      );
    }

    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(recipe => {
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
  }, [recipes, searchQuery, tagFilter]);

  const handleRecipeClick = (slug: string) => {
    navigate(`/recipe/${slug}`);
  };

  const handleTagClick = (tag: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (tagFilter === tag) {
      // If clicking the same tag, remove the filter
      newParams.delete('tag');
    } else {
      // Set the new tag filter
      newParams.set('tag', tag);
    }
    setSearchParams(newParams);
  };

  if (loading) {
    return <div className="loading">Laddar recept...</div>;
  }

  if (error) {
    return <div className="error">Fel: {error.message}</div>;
  }

  return (
    <div className="app">
      <div className="controls-bar">
        <div className="tag-filters">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-filter-btn ${tagFilter === tag ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
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
      </div>

      <div className={viewMode === 'grid' ? 'recipe-grid' : 'recipe-list'}>
        {filteredRecipes.map(recipe => (
          <RecipeCard
            key={recipe.slug}
            recipe={recipe}
            onClick={() => handleRecipeClick(recipe.slug)}
            onTagClick={handleTagClick}
            activeTag={tagFilter}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (searchQuery || tagFilter) && (
        <div className="no-results">
          Inga recept hittades
          {searchQuery && ` för "${searchQuery}"`}
          {tagFilter && ` med taggen "${tagFilter}"`}
        </div>
      )}
    </div>
  );
}
