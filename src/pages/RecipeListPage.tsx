import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCard } from '@/components/RecipeCard';

type ViewMode = 'grid' | 'list';

export function RecipeListPage() {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipes();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const tagFilterParam = searchParams.get('tag') || '';

  const tagFiltersRef = useRef<HTMLDivElement>(null);
  const viewToggleRef = useRef<HTMLDivElement>(null);

  // Parse comma-separated tags from URL
  const selectedTags = useMemo(() => {
    return tagFilterParam ? tagFilterParam.split(',').filter(t => t.trim()) : [];
  }, [tagFilterParam]);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('recipeViewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'grid';
  });

  // Show all tags state with localStorage persistence
  const [showAllTags, setShowAllTags] = useState<boolean>(() => {
    const saved = localStorage.getItem('showAllTags');
    return saved === 'true';
  });

  // Dynamic tag limit based on height
  const [tagLimit, setTagLimit] = useState<number>(12);

  useEffect(() => {
    localStorage.setItem('recipeViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('showAllTags', String(showAllTags));
  }, [showAllTags]);

  // Extract all unique tags from recipes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    recipes.forEach(recipe => {
      recipe.frontmatter.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'sv'));
  }, [recipes]);

  // Calculate tag limit based on vertical space
  useEffect(() => {
    const calculateTagLimit = () => {
      if (!tagFiltersRef.current || !viewToggleRef.current || allTags.length === 0) {
        return;
      }

      const targetHeight = viewToggleRef.current.offsetHeight;
      const tagContainer = tagFiltersRef.current;

      // Temporarily show all tags to measure
      const buttons = Array.from(tagContainer.querySelectorAll('.tag-filter-btn')) as HTMLElement[];

      if (buttons.length === 0) return;

      // Calculate how many tags fit in the target height
      let count = 0;

      // Get the container's computed styles to account for gap
      const containerStyles = window.getComputedStyle(tagContainer);
      const gap = parseFloat(containerStyles.gap) || 4; // Default to 4px if gap not set

      for (const button of buttons) {
        const rect = button.getBoundingClientRect();
        const buttonTop = rect.top - tagContainer.getBoundingClientRect().top;
        const buttonBottom = buttonTop + rect.height;

        if (buttonBottom > targetHeight + gap) {
          break;
        }
        count++;
      }

      // Ensure at least 6 tags are shown
      setTagLimit(Math.max(6, count));
    };

    // Calculate on mount and when tags change
    calculateTagLimit();

    // Recalculate on window resize
    window.addEventListener('resize', calculateTagLimit);
    return () => window.removeEventListener('resize', calculateTagLimit);
  }, [allTags]);

  const filteredRecipes = useMemo(() => {
    let results = recipes;

    // Filter by tags if present (recipes must have ALL selected tags)
    if (selectedTags.length > 0) {
      results = results.filter(recipe => {
        const recipeTags = recipe.frontmatter.tags || [];
        return selectedTags.every(tag => recipeTags.includes(tag));
      });
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
  }, [recipes, searchQuery, selectedTags]);

  const handleRecipeClick = (slug: string) => {
    navigate(`/recipe/${slug}`);
  };

  const handleTagClick = (tag: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentTags = selectedTags.slice();

    if (currentTags.includes(tag)) {
      // Remove tag from filter
      const updatedTags = currentTags.filter(t => t !== tag);
      if (updatedTags.length > 0) {
        newParams.set('tag', updatedTags.join(','));
      } else {
        newParams.delete('tag');
      }
    } else {
      // Add tag to filter
      currentTags.push(tag);
      newParams.set('tag', currentTags.join(','));
    }
    setSearchParams(newParams);
  };

  if (loading) {
    return <div className="loading">Laddar recept...</div>;
  }

  if (error) {
    return <div className="error">Fel: {error.message}</div>;
  }

  const displayedTags = showAllTags ? allTags : allTags.slice(0, tagLimit);
  const hasMoreTags = allTags.length > tagLimit;

  return (
    <div className="app">
      <div className="controls-bar">
        <div className="tag-filters" ref={tagFiltersRef}>
          {displayedTags.map(tag => (
            <button
              key={tag}
              className={`tag-filter-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
          {hasMoreTags && (
            <button
              className="tag-toggle-btn"
              onClick={() => setShowAllTags(!showAllTags)}
              aria-label={showAllTags ? 'Visa färre taggar' : 'Visa fler taggar'}
            >
              {showAllTags ? (
                <>
                  <ChevronUp size={16} />
                  Visa färre
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Visa fler ({allTags.length - tagLimit})
                </>
              )}
            </button>
          )}
        </div>
        <div className="view-toggle" ref={viewToggleRef}>
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
            activeTags={selectedTags}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (searchQuery || selectedTags.length > 0) && (
        <div className="no-results">
          Inga recept hittades
          {searchQuery && ` för "${searchQuery}"`}
          {selectedTags.length > 0 && ` med ${selectedTags.length === 1 ? 'taggen' : 'taggarna'} "${selectedTags.join('", "')}"`}
        </div>
      )}
    </div>
  );
}
