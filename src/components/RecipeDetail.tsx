import { useState } from 'react';
import { marked } from 'marked';
import type { Recipe } from '@/types/Recipe';
import { Clock, Users, Minus, Plus } from 'lucide-react';
import { useRecipeImage } from '@/hooks/useRecipeImage';
import { scaleIngredientsInMarkdown } from '@/utils/ingredientScaler';

interface RecipeDetailProps {
  recipe: Recipe;
}

interface RecipeSection {
  title: string;
  content: string;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const imageSrc = useRecipeImage(recipe.slug);
  const originalServings = recipe.frontmatter.servings;
  const [currentServings, setCurrentServings] = useState(originalServings || 4);

  const parseSections = (content: string): RecipeSection[] => {
    const sections: RecipeSection[] = [];
    // Split by h2 headings (##)
    const parts = content.split(/^## /gm);

    // First part is before any heading (usually empty)
    parts.shift();

    parts.forEach(part => {
      // First line is the title, rest is content
      const lines = part.split('\n');
      const title = lines[0].trim();
      const sectionContent = lines.slice(1).join('\n').trim();

      if (title && sectionContent) {
        sections.push({ title, content: sectionContent });
      }
    });

    return sections;
  };

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) as string };
  };

  const sections = parseSections(recipe.content);

  // Calculate scaling ratio
  const scalingRatio = originalServings ? currentServings / originalServings : 1;

  // Check if a section is the ingredients section
  const isIngredientsSection = (title: string) => {
    return title.toLowerCase() === 'ingredienser';
  };

  const handleDecreaseServings = () => {
    if (currentServings > 1) {
      setCurrentServings(currentServings - 1);
    }
  };

  const handleIncreaseServings = () => {
    setCurrentServings(currentServings + 1);
  };

  return (
    <div className="recipe-detail">
      <div className="recipe-detail-header">
        <div className="recipe-detail-image">
          <img
            src={imageSrc}
            alt={recipe.frontmatter.title}
          />
        </div>
        <div className="recipe-detail-overlay">
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

            {originalServings && (
              <div className="meta-item servings-adjuster">
                <Users size={20} />
                <div className="meta-label">
                  <span className="meta-label-text">Portioner</span>
                  <div className="servings-controls">
                    <button
                      className="servings-btn"
                      onClick={handleDecreaseServings}
                      disabled={currentServings <= 1}
                      aria-label="Minska portioner"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="meta-value">{currentServings}</span>
                    <button
                      className="servings-btn"
                      onClick={handleIncreaseServings}
                      aria-label="Öka portioner"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="recipe-content">
        {sections.length > 0 ? (
          sections.map((section, index) => {
            // Scale ingredients if this is the ingredients section
            const content = isIngredientsSection(section.title)
              ? scaleIngredientsInMarkdown(section.content, scalingRatio)
              : section.content;

            return (
              <div key={index} className="recipe-section">
                <h2>{section.title}</h2>
                <div dangerouslySetInnerHTML={renderMarkdown(content)} />
              </div>
            );
          })
        ) : (
          <div dangerouslySetInnerHTML={renderMarkdown(recipe.content)} />
        )}
      </div>
    </div>
  );
}
