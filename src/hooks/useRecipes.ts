import { useState, useEffect } from 'react';
import type { Recipe } from '@/types/Recipe';
import { loadRecipes } from '@/utils/recipeParser';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const loadedRecipes = await loadRecipes();
        if (mounted) {
          setRecipes(loadedRecipes);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load recipes'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRecipes();

    return () => {
      mounted = false;
    };
  }, []);

  return { recipes, loading, error };
}
