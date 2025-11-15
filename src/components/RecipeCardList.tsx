import type { Recipe } from '@/types/Recipe';
import { Clock, Users } from 'lucide-react';
import { useRecipeImage } from '@/hooks/useRecipeImage';

interface RecipeCardListProps {
  recipe: Recipe;
  onClick: () => void;
  onTagClick?: (tag: string) => void;
  activeTags?: string[];
}

export function RecipeCardList({ recipe, onClick, onTagClick, activeTags = [] }: RecipeCardListProps) {
  const imageSrc = useRecipeImage(recipe.slug);

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick?.(tag);
  };

  return (
    <div className="recipe-card recipe-card-list" onClick={onClick}>
      <div className="recipe-card-image">
        <img
          src={imageSrc}
          alt={recipe.frontmatter.title}
          loading="lazy"
        />
      </div>

      <div className="recipe-card-content">
        <h2>{recipe.frontmatter.title}</h2>

        {recipe.frontmatter.description && (
          <p className="description">{recipe.frontmatter.description}</p>
        )}

        {recipe.frontmatter.tags && recipe.frontmatter.tags.length > 0 && (
          <div className="recipe-tags">
            {recipe.frontmatter.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className={`tag-label ${activeTags.includes(tag) ? 'active' : ''} ${onTagClick ? 'clickable' : ''}`}
                onClick={onTagClick ? (e) => handleTagClick(e, tag) : undefined}
              >
                {tag}
              </span>
            ))}
          </div>
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
      </div>
    </div>
  );
}
