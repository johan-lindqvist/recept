import { marked } from 'marked';
import type { Recipe } from '@/types/Recipe';
import { Clock, Users } from 'lucide-react';
import { useRecipeImage } from '@/hooks/useRecipeImage';

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const imageSrc = useRecipeImage(recipe.slug);

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) as string };
  };

  return (
    <div className="recipe-detail">
      <div className="recipe-detail-image">
        <img
          src={imageSrc}
          alt={recipe.frontmatter.title}
        />
      </div>

      <h1>{recipe.frontmatter.title}</h1>

      {recipe.frontmatter.description && (
        <p className="recipe-description">{recipe.frontmatter.description}</p>
      )}

      <div className="meta">
        {recipe.frontmatter.totalTime && (
          <span className="meta-item">
            <Clock size={20} />
            <div className="meta-label">
              <span className="meta-label-text">Total tid</span>
              <span className="meta-value">{recipe.frontmatter.totalTime}</span>
            </div>
          </span>
        )}

        {recipe.frontmatter.servings && (
          <span className="meta-item">
            <Users size={20} />
            <div className="meta-label">
              <span className="meta-label-text">Portioner</span>
              <span className="meta-value">{recipe.frontmatter.servings}</span>
            </div>
          </span>
        )}
      </div>

      <div
        className="recipe-content"
        dangerouslySetInnerHTML={renderMarkdown(recipe.content)}
      />
    </div>
  );
}
