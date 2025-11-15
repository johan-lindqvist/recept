import { useState } from 'react';
import type { Recipe } from '@/types/Recipe';
import { Clock, Users } from 'lucide-react';
import { useRecipeImage } from '@/hooks/useRecipeImage';

interface RecipeCardGridProps {
  recipe: Recipe;
  onClick: () => void;
  onTagClick?: (tag: string) => void;
  activeTags?: string[];
}

export function RecipeCardGrid({ recipe, onClick, onTagClick, activeTags = [] }: RecipeCardGridProps) {
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const maxVisibleTags = 3;
  const imageSrc = useRecipeImage(recipe.slug);

  const toggleTags = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTagsExpanded(!tagsExpanded);
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick?.(tag);
  };

  const visibleTags = recipe.frontmatter.tags?.slice(0, maxVisibleTags) || [];
  const hiddenTags = recipe.frontmatter.tags?.slice(maxVisibleTags) || [];
  const displayTags = tagsExpanded ? recipe.frontmatter.tags || [] : visibleTags;

  return (
    <div className="recipe-card recipe-card-grid" onClick={onClick}>
      <div className="recipe-card-image">
        <img
          src={imageSrc}
          alt={recipe.frontmatter.title}
          loading="lazy"
        />
        {/* Meta overlay on image */}
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
      </div>

      <div className="recipe-card-content">
        <h2>{recipe.frontmatter.title}</h2>

        {recipe.frontmatter.description && (
          <p className="description">{recipe.frontmatter.description}</p>
        )}

        {recipe.frontmatter.tags && recipe.frontmatter.tags.length > 0 && (
          <div className={`recipe-tags ${tagsExpanded ? 'expanded' : ''}`}>
            {displayTags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className={`tag-label ${activeTags.includes(tag) ? 'active' : ''} ${onTagClick ? 'clickable' : ''}`}
                onClick={onTagClick ? (e) => handleTagClick(e, tag) : undefined}
              >
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
