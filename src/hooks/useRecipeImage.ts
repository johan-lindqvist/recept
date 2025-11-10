import { useState, useEffect, useRef } from 'react';

const IMAGE_EXTENSIONS = ['svg', 'jpg', 'jpeg', 'png', 'webp'];
const BASE_URL = import.meta.env.BASE_URL || '/';
const DEFAULT_IMAGE = `${BASE_URL}images/recipes/default-recipe.svg`;

/**
 * Hook to find and load the correct recipe image by trying multiple file extensions
 * @param slug - The recipe slug used as the base filename
 * @returns The image source URL
 */
export function useRecipeImage(slug: string): string {
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
  const currentSlugRef = useRef(slug);

  useEffect(() => {
    // Reset when slug changes
    if (currentSlugRef.current !== slug) {
      currentSlugRef.current = slug;
      setImageSrc(DEFAULT_IMAGE);
    }

    const tryNextImage = (index: number) => {
      // Stop if slug changed or we've exhausted all extensions
      if (currentSlugRef.current !== slug || index >= IMAGE_EXTENSIONS.length) {
        if (index >= IMAGE_EXTENSIONS.length && currentSlugRef.current === slug) {
          setImageSrc(DEFAULT_IMAGE);
        }
        return;
      }

      const extension = IMAGE_EXTENSIONS[index];
      const testSrc = `${BASE_URL}images/recipes/${slug}.${extension}`;

      const img = new Image();

      img.onload = () => {
        // Double-check slug hasn't changed
        if (currentSlugRef.current !== slug) return;

        // Verify it's actually an image (not HTML returned by SPA routing)
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setImageSrc(testSrc);
        } else {
          // Not a valid image, try next extension
          tryNextImage(index + 1);
        }
      };

      img.onerror = () => {
        // Double-check slug hasn't changed
        if (currentSlugRef.current !== slug) return;
        // Try next extension
        tryNextImage(index + 1);
      };

      img.src = testSrc;
    };

    // Start trying from index 0
    tryNextImage(0);
  }, [slug]);

  return imageSrc;
}
