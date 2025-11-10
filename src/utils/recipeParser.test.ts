import { describe, it, expect } from 'vitest';
import { loadRecipes, parseRecipeMarkdown } from './recipeParser';

describe('parseRecipeMarkdown', () => {
  it('should parse markdown with frontmatter correctly', () => {
    const markdown = `---
title: Test Recipe
description: A test recipe
totalTime: 30 minutes
servings: 4
tags:
  - test
  - example
---

## Ingredients

- 1 cup flour
- 2 eggs

## Instructions

1. Mix ingredients
2. Cook`;

    const result = parseRecipeMarkdown(markdown);

    expect(result.frontmatter.title).toBe('Test Recipe');
    expect(result.frontmatter.description).toBe('A test recipe');
    expect(result.frontmatter.totalTime).toBe('30 minutes');
    expect(result.frontmatter.servings).toBe(4);
    expect(result.frontmatter.tags).toEqual(['test', 'example']);
    expect(result.html).toContain('<h2>Ingredients</h2>');
    expect(result.html).toContain('<h2>Instructions</h2>');
    expect(result.html).toContain('1 cup flour');
  });

  it('should handle markdown without optional fields', () => {
    const markdown = `---
title: Simple Recipe
---

Just a simple recipe.`;

    const result = parseRecipeMarkdown(markdown);

    expect(result.frontmatter.title).toBe('Simple Recipe');
    expect(result.frontmatter.description).toBeUndefined();
    expect(result.frontmatter.tags).toBeUndefined();
    expect(result.html).toContain('Just a simple recipe');
  });
});

describe('loadRecipes', () => {
  it('should load and parse all recipes from the recipes directory', async () => {
    const recipes = await loadRecipes();

    // Should load the actual recipes from the project
    expect(recipes.length).toBeGreaterThan(0);

    // Verify all recipes have required structure
    recipes.forEach(recipe => {
      expect(recipe).toHaveProperty('slug');
      expect(recipe).toHaveProperty('frontmatter');
      expect(recipe).toHaveProperty('content');
      expect(recipe.frontmatter).toHaveProperty('title');
    });
  });

  it('should extract slug correctly from path', async () => {
    const recipes = await loadRecipes();

    recipes.forEach(recipe => {
      expect(recipe.slug).not.toContain('/');
      expect(recipe.slug).not.toContain('.md');
      expect(recipe.slug.length).toBeGreaterThan(0);
    });
  });
});
