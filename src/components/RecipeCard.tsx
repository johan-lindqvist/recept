import { useState } from 'react';
import type { Recipe } from '@/types/Recipe';
import { Clock, Users } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const maxVisibleTags = 3;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/recept/images/recipes/default-recipe.svg';
  };

  const toggleTags = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTagsExpanded(!tagsExpanded);
  };

  const visibleTags = recipe.frontmatter.tags?.slice(0, maxVisibleTags) || [];
  const hiddenTags = recipe.frontmatter.tags?.slice(maxVisibleTags) || [];
  const displayTags = tagsExpanded ? recipe.frontmatter.tags || [] : visibleTags;

  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-card-image">
        <img
          src={recipe.frontmatter.image ?? `/recept/images/recipes/${recipe.slug}.svg`} // TODO: Claude change so we can handle different image types (not just svg, but jpg etc)
          alt={recipe.frontmatter.title}
          loading="lazy"
          onError={handleImageError}
        />
      </div>

      <div className="recipe-card-content">
        <h2>{recipe.frontmatter.title}</h2>

        {recipe.frontmatter.description && (
          <p className="description">{recipe.frontmatter.description}</p>
        )}

        <div className="meta">
          {recipe.frontmatter.totalTime && (
            <span className="meta-item">
              <Clock size={16} />
              <span>{recipe.frontmatter.totalTime}</span>
            </span>
          )}

          {recipe.frontmatter.servings && (
            <span className="meta-item">
              <Users size={16} />
              <span>{recipe.frontmatter.servings} port.</span>
            </span>
          )}
        </div>

        {recipe.frontmatter.tags && recipe.frontmatter.tags.length > 0 && (
          <div className={`recipe-tags ${tagsExpanded ? 'expanded' : ''}`}>
            {displayTags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="tag-label">
                {tag}
              </span>
            ))}

            {hiddenTags.length > 0 && (
              <span className="tag-label tag-more" onClick={toggleTags}>
                {tagsExpanded ? 'visa färre' : `+${hiddenTags.length} mer`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
