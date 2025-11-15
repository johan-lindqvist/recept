import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecipes } from '@/hooks/useRecipes';
import { RecipeCardGrid } from '@/components/RecipeCardGrid';
import { RecipeCardList } from '@/components/RecipeCardList';
import { parseTotalTimeToMinutes } from '@/utils/timeUtils';

type ViewMode = 'grid' | 'list';
type TimeFilter = '40' | '60' | null;

export function RecipeListPage() {
  const navigate = useNavigate();
  const { recipes, loading, error } = useRecipes();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const tagFilterParam = searchParams.get('tag') || '';
  const timeFilterParam = searchParams.get('time') as TimeFilter;

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
  const [isMeasuring, setIsMeasuring] = useState<boolean>(true);

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

      const tagContainer = tagFiltersRef.current;
      const buttons = Array.from(tagContainer.querySelectorAll('.tag-filter-btn')) as HTMLElement[];

      if (buttons.length === 0) {
        // If no buttons yet, schedule another attempt
        setTimeout(calculateTagLimit, 50);
        return;
      }

      // Get the container's computed styles to account for gap
      const containerStyles = window.getComputedStyle(tagContainer);
      const gap = parseFloat(containerStyles.gap) || 4; // Default to 4px if gap not set

      // Calculate height for approximately 2 rows of tags
      const firstButtonHeight = buttons[0].getBoundingClientRect().height;
      const targetHeight = (firstButtonHeight * 2) + gap;

      // Calculate how many tags fit in the target height
      let count = 0;

      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const rect = button.getBoundingClientRect();
        const buttonTop = rect.top - tagContainer.getBoundingClientRect().top;
        const buttonBottom = buttonTop + rect.height;

        if (buttonBottom > targetHeight + gap) {
          // We've exceeded 2 rows, stop counting
          break;
        }
        count++;
      }

      // Calculate how many tags would be hidden
      const remainingTags = allTags.length - count;

      // If only a few tags remain (3 or fewer), just show all tags instead of a toggle
      // Otherwise, reduce count to leave room for toggle button
      if (remainingTags <= 3) {
        count = allTags.length;
      } else if (remainingTags > 0) {
        // Reserve space for toggle button by reducing count
        count = Math.max(6, count - 1);
      }

      setTagLimit(count);
      setIsMeasuring(false);
    };

    // Set measuring to true and calculate on mount and when tags change
    setIsMeasuring(true);
    // Use setTimeout to ensure DOM is updated before measuring
    setTimeout(calculateTagLimit, 0);

    // Recalculate on window resize
    const handleResize = () => {
      setIsMeasuring(true);
      setTimeout(calculateTagLimit, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

    // Filter by time if present
    if (timeFilterParam) {
      const maxMinutes = parseInt(timeFilterParam, 10);
      results = results.filter(recipe => {
        const recipeMinutes = parseTotalTimeToMinutes(recipe.frontmatter.totalTime);
        return recipeMinutes !== null && recipeMinutes <= maxMinutes;
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
  }, [recipes, searchQuery, selectedTags, timeFilterParam]);

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

  const handleTimeFilterClick = (minutes: TimeFilter) => {
    const newParams = new URLSearchParams(searchParams);

    if (timeFilterParam === minutes) {
      // Remove time filter if clicking the same one
      newParams.delete('time');
    } else if (minutes) {
      // Set new time filter
      newParams.set('time', minutes);
    }

    setSearchParams(newParams);
  };

  if (loading) {
    return <div className="loading">Laddar recept...</div>;
  }

  if (error) {
    return <div className="error">Fel: {error.message}</div>;
  }

  // Show all tags during measurement, or when showAllTags is true, otherwise show limited
  const displayedTags = (isMeasuring || showAllTags) ? allTags : allTags.slice(0, tagLimit);
  const hasMoreTags = allTags.length > tagLimit;

  return (
    <div className="app">
      <div className="controls-bar">
        <div className="time-filters">
          <button
            className={`time-filter-btn ${timeFilterParam === '40' ? 'active' : ''}`}
            onClick={() => handleTimeFilterClick('40')}
          >
            ≤ 40 min
          </button>
          <button
            className={`time-filter-btn ${timeFilterParam === '60' ? 'active' : ''}`}
            onClick={() => handleTimeFilterClick('60')}
          >
            ≤ 1 timme
          </button>
        </div>
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
          {hasMoreTags && !isMeasuring && (
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
          viewMode === 'grid' ? (
            <RecipeCardGrid
              key={recipe.slug}
              recipe={recipe}
              onClick={() => handleRecipeClick(recipe.slug)}
              onTagClick={handleTagClick}
              activeTags={selectedTags}
            />
          ) : (
            <RecipeCardList
              key={recipe.slug}
              recipe={recipe}
              onClick={() => handleRecipeClick(recipe.slug)}
              onTagClick={handleTagClick}
              activeTags={selectedTags}
            />
          )
        ))}
      </div>

      {filteredRecipes.length === 0 && (searchQuery || selectedTags.length > 0 || timeFilterParam) && (
        <div className="no-results">
          Inga recept hittades
          {searchQuery && ` för "${searchQuery}"`}
          {selectedTags.length > 0 && ` med ${selectedTags.length === 1 ? 'taggen' : 'taggarna'} "${selectedTags.join('", "')}"`}
          {timeFilterParam && ` som tar ${timeFilterParam === '40' ? '40 minuter' : '1 timme'} eller mindre`}
        </div>
      )}
    </div>
  );
}
