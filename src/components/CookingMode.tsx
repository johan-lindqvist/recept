import { useEffect, useRef, useState, useCallback } from 'react';
import { X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { CheckableList, type CheckableItem } from './CheckableList';
import { useCookingProgress } from '@/hooks/useCookingProgress';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useIsMobile } from '@/hooks/useIsMobile';
import { parseIngredients, parseInstructions } from '@/utils/instructionParser';
import { scaleIngredientsInMarkdown } from '@/utils/ingredientScaler';
import { marked } from 'marked';

interface CookingModeProps {
  recipeSlug: string;
  recipeTitle: string;
  ingredientsMarkdown: string;
  instructionsMarkdown: string;
  scalingRatio: number;
  onClose: () => void;
}

export function CookingMode({
  recipeSlug,
  recipeTitle,
  ingredientsMarkdown,
  instructionsMarkdown,
  scalingRatio,
  onClose,
}: CookingModeProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const { toggle: toggleWakeLock, isActive: wakeLockActive, isSupported: wakeLockSupported } = useWakeLock();

  const {
    toggleIngredient,
    toggleInstruction,
    reset,
    isIngredientChecked,
    isInstructionChecked,
    checkedInstructionsCount,
    currentStep,
  } = useCookingProgress(recipeSlug);

  // Scale ingredients and parse
  const scaledIngredientsMarkdown = scaleIngredientsInMarkdown(ingredientsMarkdown, scalingRatio);
  const parsedInstructions = parseInstructions(instructionsMarkdown);

  // Convert to CheckableItem format with scaled values for display
  const scaledParsedIngredients = parseIngredients(scaledIngredientsMarkdown);
  const ingredientItems: CheckableItem[] = scaledParsedIngredients.map((ing, idx) => ({
    index: idx,
    text: marked.parseInline(ing.text) as string,
    isChecked: isIngredientChecked(idx),
  }));

  const instructionItems: CheckableItem[] = parsedInstructions.map((inst) => ({
    index: inst.index,
    text: marked.parseInline(inst.text) as string,
    isChecked: isInstructionChecked(inst.index),
  }));

  const totalSteps = instructionItems.length;

  // Enable wake lock on mobile when entering cooking mode
  useEffect(() => {
    if (isMobile && wakeLockSupported && !wakeLockActive) {
      toggleWakeLock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, wakeLockSupported]);

  // Disable wake lock when leaving cooking mode
  useEffect(() => {
    return () => {
      if (wakeLockActive) {
        toggleWakeLock();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Focus trap
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const focusableElements = overlay.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const handleReset = () => {
    if (window.confirm('Vill du återställa alla markeringar?')) {
      reset();
    }
  };

  return (
    <div className="cooking-mode-overlay" ref={overlayRef} role="dialog" aria-modal="true" aria-label="Matlagningsläge">
      <header className="cooking-mode-header">
        <button
          type="button"
          className="cooking-mode-close"
          onClick={onClose}
          aria-label="Stäng matlagningsläge"
        >
          <X size={24} />
        </button>
        <h1 className="cooking-mode-title">{recipeTitle}</h1>
        <button
          type="button"
          className="cooking-mode-reset"
          onClick={handleReset}
          aria-label="Återställ framsteg"
        >
          <RotateCcw size={20} />
          <span className="cooking-mode-reset-text">Återställ</span>
        </button>
      </header>

      <div className="cooking-mode-content">
        <aside className={`cooking-mode-ingredients ${ingredientsExpanded ? 'expanded' : ''}`}>
          <button
            type="button"
            className="cooking-mode-ingredients-toggle"
            onClick={() => setIngredientsExpanded(!ingredientsExpanded)}
            aria-expanded={ingredientsExpanded}
          >
            <h2>Ingredienser</h2>
            {isMobile && (ingredientsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
          </button>
          <div className="cooking-mode-ingredients-list">
            <CheckableList
              items={ingredientItems}
              onToggle={toggleIngredient}
              className="ingredients-checklist"
            />
          </div>
        </aside>

        <main className="cooking-mode-instructions">
          <h2>Instruktioner</h2>
          <CheckableList
            items={instructionItems}
            onToggle={toggleInstruction}
            currentIndex={currentStep}
            showNumbers={true}
            className="instructions-checklist"
          />
        </main>
      </div>

      <footer className="cooking-mode-footer">
        <div className="cooking-mode-progress">
          <span className="cooking-mode-progress-text">
            Framsteg: {checkedInstructionsCount}/{totalSteps} steg
          </span>
          <div className="cooking-mode-progress-bar">
            <div
              className="cooking-mode-progress-fill"
              style={{ width: `${totalSteps > 0 ? (checkedInstructionsCount / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
