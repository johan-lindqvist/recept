import { useState, useEffect, useCallback } from 'react';

export interface CookingProgress {
  ingredients: number[];
  instructions: number[];
  currentStep: number;
  lastUpdated: string;
}

const STORAGE_PREFIX = 'cookingProgress_';

function getStorageKey(recipeSlug: string): string {
  return `${STORAGE_PREFIX}${recipeSlug}`;
}

function loadProgress(recipeSlug: string): CookingProgress | null {
  try {
    const stored = localStorage.getItem(getStorageKey(recipeSlug));
    if (stored) {
      return JSON.parse(stored) as CookingProgress;
    }
  } catch {
    // Invalid JSON or storage error
  }
  return null;
}

function saveProgress(recipeSlug: string, progress: CookingProgress): void {
  try {
    localStorage.setItem(getStorageKey(recipeSlug), JSON.stringify(progress));
  } catch {
    // Storage quota exceeded or other error
  }
}

function clearProgress(recipeSlug: string): void {
  try {
    localStorage.removeItem(getStorageKey(recipeSlug));
  } catch {
    // Storage error
  }
}

const defaultProgress: CookingProgress = {
  ingredients: [],
  instructions: [],
  currentStep: 0,
  lastUpdated: new Date().toISOString(),
};

export function useCookingProgress(recipeSlug: string) {
  const [progress, setProgress] = useState<CookingProgress>(() => {
    return loadProgress(recipeSlug) || { ...defaultProgress };
  });

  // Reload progress when recipe changes
  useEffect(() => {
    const loaded = loadProgress(recipeSlug);
    setProgress(loaded || { ...defaultProgress });
  }, [recipeSlug]);

  // Save progress whenever it changes (only if there's actual progress)
  useEffect(() => {
    const hasProgress = progress.ingredients.length > 0 || progress.instructions.length > 0;
    if (hasProgress) {
      saveProgress(recipeSlug, progress);
    }
  }, [recipeSlug, progress]);

  const toggleIngredient = useCallback((index: number) => {
    setProgress(prev => {
      const newIngredients = prev.ingredients.includes(index)
        ? prev.ingredients.filter(i => i !== index)
        : [...prev.ingredients, index];
      return {
        ...prev,
        ingredients: newIngredients,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const toggleInstruction = useCallback((index: number) => {
    setProgress(prev => {
      const newInstructions = prev.instructions.includes(index)
        ? prev.instructions.filter(i => i !== index)
        : [...prev.instructions, index];
      // Update currentStep to first unchecked instruction
      const allIndices = Array.from({ length: Math.max(...newInstructions, index) + 1 }, (_, i) => i);
      const firstUnchecked = allIndices.find(i => !newInstructions.includes(i)) ?? newInstructions.length;
      return {
        ...prev,
        instructions: newInstructions,
        currentStep: firstUnchecked,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setProgress(prev => ({
      ...prev,
      currentStep: step,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const reset = useCallback(() => {
    clearProgress(recipeSlug);
    setProgress({ ...defaultProgress, lastUpdated: new Date().toISOString() });
  }, [recipeSlug]);

  const isIngredientChecked = useCallback((index: number) => {
    return progress.ingredients.includes(index);
  }, [progress.ingredients]);

  const isInstructionChecked = useCallback((index: number) => {
    return progress.instructions.includes(index);
  }, [progress.instructions]);

  return {
    progress,
    toggleIngredient,
    toggleInstruction,
    setCurrentStep,
    reset,
    isIngredientChecked,
    isInstructionChecked,
    checkedIngredientsCount: progress.ingredients.length,
    checkedInstructionsCount: progress.instructions.length,
    currentStep: progress.currentStep,
  };
}
