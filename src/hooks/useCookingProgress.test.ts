import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookingProgress } from './useCookingProgress';

describe('useCookingProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-18T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty progress', () => {
    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    expect(result.current.progress.ingredients).toEqual([]);
    expect(result.current.progress.instructions).toEqual([]);
    expect(result.current.progress.currentStep).toBe(0);
  });

  it('should toggle ingredient checked state', () => {
    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    act(() => {
      result.current.toggleIngredient(0);
    });

    expect(result.current.isIngredientChecked(0)).toBe(true);
    expect(result.current.checkedIngredientsCount).toBe(1);

    act(() => {
      result.current.toggleIngredient(0);
    });

    expect(result.current.isIngredientChecked(0)).toBe(false);
    expect(result.current.checkedIngredientsCount).toBe(0);
  });

  it('should toggle instruction checked state', () => {
    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    act(() => {
      result.current.toggleInstruction(0);
    });

    expect(result.current.isInstructionChecked(0)).toBe(true);
    expect(result.current.checkedInstructionsCount).toBe(1);

    act(() => {
      result.current.toggleInstruction(0);
    });

    expect(result.current.isInstructionChecked(0)).toBe(false);
    expect(result.current.checkedInstructionsCount).toBe(0);
  });

  it('should update currentStep when toggling instructions', () => {
    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    // Check step 0
    act(() => {
      result.current.toggleInstruction(0);
    });

    expect(result.current.currentStep).toBe(1);

    // Check step 1
    act(() => {
      result.current.toggleInstruction(1);
    });

    expect(result.current.currentStep).toBe(2);

    // Uncheck step 0 - currentStep should go back to 0
    act(() => {
      result.current.toggleInstruction(0);
    });

    expect(result.current.currentStep).toBe(0);
  });

  it('should persist progress to localStorage', () => {
    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    act(() => {
      result.current.toggleIngredient(0);
      result.current.toggleIngredient(2);
      result.current.toggleInstruction(0);
    });

    const stored = localStorage.getItem('cookingProgress_test-recipe');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.ingredients).toContain(0);
    expect(parsed.ingredients).toContain(2);
    expect(parsed.instructions).toContain(0);
  });

  it('should load progress from localStorage on mount', () => {
    const savedProgress = {
      ingredients: [0, 1],
      instructions: [0],
      currentStep: 1,
      lastUpdated: '2026-01-17T10:00:00Z',
    };
    localStorage.setItem('cookingProgress_test-recipe', JSON.stringify(savedProgress));

    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    expect(result.current.isIngredientChecked(0)).toBe(true);
    expect(result.current.isIngredientChecked(1)).toBe(true);
    expect(result.current.isInstructionChecked(0)).toBe(true);
    expect(result.current.currentStep).toBe(1);
  });

  it('should reset all progress', () => {
    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    act(() => {
      result.current.toggleIngredient(0);
      result.current.toggleIngredient(1);
      result.current.toggleInstruction(0);
    });

    expect(result.current.checkedIngredientsCount).toBe(2);
    expect(result.current.checkedInstructionsCount).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.checkedIngredientsCount).toBe(0);
    expect(result.current.checkedInstructionsCount).toBe(0);
    expect(result.current.currentStep).toBe(0);
    expect(localStorage.getItem('cookingProgress_test-recipe')).toBeNull();
  });

  it('should setCurrentStep manually', () => {
    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    act(() => {
      result.current.setCurrentStep(3);
    });

    expect(result.current.currentStep).toBe(3);
  });

  it('should reload progress when recipe slug changes', () => {
    const progress1 = {
      ingredients: [0],
      instructions: [],
      currentStep: 0,
      lastUpdated: '2026-01-17T10:00:00Z',
    };
    const progress2 = {
      ingredients: [1, 2],
      instructions: [0, 1],
      currentStep: 2,
      lastUpdated: '2026-01-17T10:00:00Z',
    };
    localStorage.setItem('cookingProgress_recipe-1', JSON.stringify(progress1));
    localStorage.setItem('cookingProgress_recipe-2', JSON.stringify(progress2));

    const { result, rerender } = renderHook(
      ({ slug }) => useCookingProgress(slug),
      { initialProps: { slug: 'recipe-1' } }
    );

    expect(result.current.checkedIngredientsCount).toBe(1);
    expect(result.current.isIngredientChecked(0)).toBe(true);

    rerender({ slug: 'recipe-2' });

    expect(result.current.checkedIngredientsCount).toBe(2);
    expect(result.current.isIngredientChecked(1)).toBe(true);
    expect(result.current.isIngredientChecked(2)).toBe(true);
    expect(result.current.currentStep).toBe(2);
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('cookingProgress_test-recipe', 'invalid json');

    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    expect(result.current.progress.ingredients).toEqual([]);
    expect(result.current.progress.instructions).toEqual([]);
  });

  it('should update lastUpdated timestamp on changes', () => {
    const { result } = renderHook(() => useCookingProgress('test-recipe'));

    act(() => {
      result.current.toggleIngredient(0);
    });

    expect(result.current.progress.lastUpdated).toBe('2026-01-18T10:00:00.000Z');
  });
});
