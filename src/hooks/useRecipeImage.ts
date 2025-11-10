import { useMemo } from 'react';
import { RECIPE_IMAGE_INDEX } from '@/generated/recipeImageIndex';

const BASE_URL = import.meta.env.BASE_URL || '/';
const DEFAULT_IMAGE = `${BASE_URL}images/recipes/default-recipe.svg`;

/**
 * Hook to get the correct recipe image using a build-time generated index
 * @param slug - The recipe slug used to lookup the image filename
 * @returns The image source URL
 */
export function useRecipeImage(slug: string): string {
  return useMemo(() => {
    const imageFilename = RECIPE_IMAGE_INDEX[slug];

    if (imageFilename) {
      return `${BASE_URL}images/recipes/${imageFilename}`;
    }

    return DEFAULT_IMAGE;
  }, [slug]);
}
