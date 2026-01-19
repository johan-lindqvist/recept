import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, Shuffle } from 'lucide-react';
import { Recipe } from '@/types/Recipe';
import { useRecipeImage } from '@/hooks/useRecipeImage';

interface RandomRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
}

type Phase = 'select-tags' | 'show-result';

function RecipeResultImage({ slug }: { slug: string }) {
  const imageSrc = useRecipeImage(slug);

  if (!imageSrc) {
    return <div className="random-recipe-image-placeholder" />;
  }

  return <img src={imageSrc} alt="" />;
}

export function RandomRecipeDialog({ isOpen, onClose, recipes }: RandomRecipeDialogProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null);
  const [phase, setPhase] = useState<Phase>('select-tags');

  // Extract all unique tags from recipes
  const allTags = Array.from(
    new Set(recipes.flatMap(r => r.frontmatter.tags || []))
  ).sort();

  // Get filtered recipes based on selected tags
  const filteredRecipes = selectedTags.length === 0
    ? recipes
    : recipes.filter(recipe => {
        const recipeTags = recipe.frontmatter.tags || [];
        return selectedTags.every(tag => recipeTags.includes(tag));
      });

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTags([]);
      setRandomRecipe(null);
      setPhase('select-tags');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const pickRandomRecipe = useCallback(() => {
    if (filteredRecipes.length === 0) {
      setRandomRecipe(null);
      setPhase('show-result');
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    setRandomRecipe(filteredRecipes[randomIndex]);
    setPhase('show-result');
  }, [filteredRecipes]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const goBackToTagSelection = () => {
    setPhase('select-tags');
    setRandomRecipe(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="random-recipe-dialog-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="random-recipe-dialog-title"
    >
      <div className="random-recipe-dialog">
        <div className="random-recipe-dialog-header">
          <h2 id="random-recipe-dialog-title">Slumpa recept</h2>
          <button
            className="random-recipe-dialog-close"
            onClick={onClose}
            aria-label="Stäng"
          >
            <X size={20} />
          </button>
        </div>

        {phase === 'select-tags' && (
          <div className="random-recipe-dialog-content">
            {allTags.length > 0 && (
              <>
                <p className="random-recipe-dialog-hint">
                  Filtrera efter taggar (valfritt):
                </p>
                <div className="random-recipe-tags">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`tag-filter-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                      aria-pressed={selectedTags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="random-recipe-count">
              {filteredRecipes.length} recept{filteredRecipes.length !== 1 ? '' : ''} matchar
            </p>
            <button
              className="btn-primary random-recipe-btn"
              onClick={pickRandomRecipe}
              disabled={filteredRecipes.length === 0}
            >
              <Shuffle size={18} />
              Slumpa!
            </button>
          </div>
        )}

        {phase === 'show-result' && (
          <div className="random-recipe-dialog-content">
            {randomRecipe ? (
              <div className="random-recipe-result">
                <div className="random-recipe-image">
                  <RecipeResultImage slug={randomRecipe.slug} />
                </div>
                <h3>{randomRecipe.frontmatter.title}</h3>
                {randomRecipe.frontmatter.description && (
                  <p className="random-recipe-description">
                    {randomRecipe.frontmatter.description}
                  </p>
                )}
                <div className="random-recipe-actions">
                  <button
                    className="btn-secondary"
                    onClick={pickRandomRecipe}
                  >
                    <Shuffle size={16} />
                    Slumpa igen
                  </button>
                  <Link
                    to={`/recept/${randomRecipe.slug}`}
                    className="btn-primary"
                    onClick={onClose}
                  >
                    Visa recept
                  </Link>
                </div>
                <button
                  className="random-recipe-change-filter"
                  onClick={goBackToTagSelection}
                >
                  Byt filter
                </button>
              </div>
            ) : (
              <div className="random-recipe-no-results">
                <p>Inga recept matchar de valda taggarna.</p>
                <button
                  className="btn-secondary"
                  onClick={goBackToTagSelection}
                >
                  Byt filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
