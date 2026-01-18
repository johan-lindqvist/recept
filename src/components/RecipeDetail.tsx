import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import type { Recipe } from '@/types/Recipe';
import { Clock, Users, Tag, Smartphone, X } from 'lucide-react';
import { useRecipeImage } from '@/hooks/useRecipeImage';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useIsMobile } from '@/hooks/useIsMobile';
import { scaleIngredientsInMarkdown } from '@/utils/ingredientScaler';

const WAKE_LOCK_TOOLTIP_KEY = 'wakeLockTooltipDismissed';

interface RecipeDetailProps {
  recipe: Recipe;
}

interface RecipeSection {
  title: string;
  content: string;
}

const PORTION_PRESETS = [2, 4, 8, 10];

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const imageSrc = useRecipeImage(recipe.slug);
  const originalServings = recipe.frontmatter.servings;
  const [currentServings, setCurrentServings] = useState(originalServings || 4);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(currentServings));
  const inputRef = useRef<HTMLInputElement>(null);

  // Wake lock functionality
  const isMobile = useIsMobile();
  const { isActive: wakeLockActive, isSupported: wakeLockSupported, toggle: toggleWakeLock } = useWakeLock();
  const [showWakeLockTooltip, setShowWakeLockTooltip] = useState(false);

  // Show tooltip on first visit for mobile users
  useEffect(() => {
    if (isMobile && wakeLockSupported) {
      const dismissed = localStorage.getItem(WAKE_LOCK_TOOLTIP_KEY);
      if (!dismissed) {
        setShowWakeLockTooltip(true);
      }
    }
  }, [isMobile, wakeLockSupported]);

  const dismissWakeLockTooltip = () => {
    setShowWakeLockTooltip(false);
    localStorage.setItem(WAKE_LOCK_TOOLTIP_KEY, 'true');
  };

  const handleWakeLockToggle = () => {
    toggleWakeLock();
    if (showWakeLockTooltip) {
      dismissWakeLockTooltip();
    }
  };

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

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handlePresetClick = (preset: number) => {
    setCurrentServings(preset);
    setInputValue(String(preset));
    setIsEditing(false);
  };

  const handleValueClick = () => {
    setIsEditing(true);
    setInputValue(String(currentServings));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    commitInputValue();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitInputValue();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(String(currentServings));
    }
  };

  const commitInputValue = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      setCurrentServings(parsed);
      setInputValue(String(parsed));
    } else {
      setInputValue(String(currentServings));
    }
    setIsEditing(false);
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
                    {PORTION_PRESETS.map(preset => (
                      <button
                        key={preset}
                        className={`servings-preset-btn ${currentServings === preset ? 'active' : ''}`}
                        onClick={() => handlePresetClick(preset)}
                        aria-label={`${preset} portioner`}
                      >
                        {preset}
                      </button>
                    ))}
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="number"
                        min="1"
                        className="servings-input"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        aria-label="Ange antal portioner"
                      />
                    ) : (
                      <button
                        className={`servings-preset-btn servings-custom ${!PORTION_PRESETS.includes(currentServings) ? 'active' : ''}`}
                        onClick={handleValueClick}
                        aria-label="Ange eget antal portioner"
                      >
                        {PORTION_PRESETS.includes(currentServings) ? '...' : currentServings}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {recipe.frontmatter.tags && recipe.frontmatter.tags.length > 0 && (
              <div className="meta-item meta-item-tags">
                <Tag size={20} />
                <div className="meta-label">
                  <span className="meta-label-text">Taggar</span>
                  <div className="detail-tags">
                    {recipe.frontmatter.tags.map(tag => (
                      <span key={tag} className="detail-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isMobile && wakeLockSupported && (
              <div className="meta-item meta-item-wakelock">
                <div className="wake-lock-container">
                  <button
                    className={`wake-lock-btn ${wakeLockActive ? 'active' : ''}`}
                    onClick={handleWakeLockToggle}
                    aria-label={wakeLockActive ? 'Stäng av skärmlås' : 'Håll skärmen vaken'}
                    aria-pressed={wakeLockActive}
                  >
                    <Smartphone size={18} />
                    <span className="wake-lock-text">
                      {wakeLockActive ? 'Skärm vaken' : 'Håll vaken'}
                    </span>
                  </button>
                  {showWakeLockTooltip && (
                    <div className="wake-lock-tooltip">
                      <span>Aktivera för att hålla skärmen tänd medan du lagar mat</span>
                      <button
                        className="wake-lock-tooltip-close"
                        onClick={dismissWakeLockTooltip}
                        aria-label="Stäng tips"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
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
