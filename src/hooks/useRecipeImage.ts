import { useState, useEffect } from 'react';

const IMAGE_EXTENSIONS = ['svg', 'jpg', 'jpeg', 'png', 'webp'];
const BASE_URL = import.meta.env.BASE_URL || '/';
const DEFAULT_IMAGE = `${BASE_URL}images/recipes/default-recipe.svg`;

/**
 * Hook to find and load the correct recipe image by trying multiple file extensions
 * @param slug - The recipe slug used as the base filename
 * @returns The image source URL
 */
export function useRecipeImage(slug: string): string {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [extensionIndex, setExtensionIndex] = useState(0);

  useEffect(() => {
    // Reset when slug changes
    setExtensionIndex(0);
    setImageSrc('');
  }, [slug]);

  useEffect(() => {
    // Skip if we already found a valid image
    if (imageSrc && extensionIndex > 0) {
      return;
    }

    if (extensionIndex < IMAGE_EXTENSIONS.length) {
      const extension = IMAGE_EXTENSIONS[extensionIndex];
      const testSrc = `${BASE_URL}images/recipes/${slug}.${extension}`;

      let cancelled = false;

      // Try loading the image
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;

        // Verify it's actually an image (not HTML returned by SPA routing)
        // If naturalWidth and naturalHeight are 0, it's not a valid image
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setImageSrc(testSrc);
        } else {
          // Not a valid image, try next extension
          setExtensionIndex(prev => prev + 1);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        // Try next extension
        setExtensionIndex(prev => prev + 1);
      };
      img.src = testSrc;

      // Cleanup function to prevent race conditions
      return () => {
        cancelled = true;
      };
    } else {
      // No valid image found, use default
      setImageSrc(DEFAULT_IMAGE);
    }
  }, [slug, extensionIndex]);

  return imageSrc || DEFAULT_IMAGE;
}
