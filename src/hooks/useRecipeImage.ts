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
    if (extensionIndex < IMAGE_EXTENSIONS.length) {
      const extension = IMAGE_EXTENSIONS[extensionIndex];
      const testSrc = `${BASE_URL}images/recipes/${slug}.${extension}`;

      // Try loading the image
      const img = new Image();
      img.onload = () => {
        setImageSrc(testSrc);
      };
      img.onerror = () => {
        // Try next extension
        setExtensionIndex(prev => prev + 1);
      };
      img.src = testSrc;
    } else if (!imageSrc) {
      // No valid image found, use default
      setImageSrc(DEFAULT_IMAGE);
    }
  }, [slug, extensionIndex, imageSrc]);

  return imageSrc || DEFAULT_IMAGE;
}
