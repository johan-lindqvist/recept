import { marked } from 'marked';
import type { Recipe } from '@/types/Recipe';
import { Clock, Users } from 'lucide-react';
import { useRecipeImage } from '@/hooks/useRecipeImage';

interface RecipeDetailProps {
  recipe: Recipe;
}

interface RecipeSection {
  title: string;
  content: string;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const imageSrc = useRecipeImage(recipe.slug);

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

      <div className="recipe-content">
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <div key={index} className="recipe-section">
              <h2>{section.title}</h2>
              <div dangerouslySetInnerHTML={renderMarkdown(section.content)} />
            </div>
          ))
        ) : (
          <div dangerouslySetInnerHTML={renderMarkdown(recipe.content)} />
        )}
      </div>
    </div>
  );
}
