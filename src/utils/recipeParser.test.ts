import { describe, it, expect } from 'vitest';
import { loadRecipes, parseRecipeMarkdown } from './recipeParser';

describe('parseRecipeMarkdown', () => {
  it('should parse markdown with frontmatter correctly', () => {
    const markdown = `---
title: Test Recipe
description: A test recipe
prepTime: 10 minutes
cookTime: 20 minutes
servings: 4
difficulty: Easy
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
    expect(result.frontmatter.prepTime).toBe('10 minutes');
    expect(result.frontmatter.cookTime).toBe('20 minutes');
    expect(result.frontmatter.servings).toBe(4);
    expect(result.frontmatter.difficulty).toBe('Easy');
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

  it('should load chocolate chip cookies recipe correctly', async () => {
    const recipes = await loadRecipes();
    const cookieRecipe = recipes.find(r => r.slug === 'chocolate-chip-cookies');

    expect(cookieRecipe).toBeDefined();
    expect(cookieRecipe?.frontmatter.title).toBe('Klassiska Chocolate Chip Cookies');
    expect(cookieRecipe?.frontmatter.difficulty).toBe('Lätt');
    expect(cookieRecipe?.frontmatter.tags).toContain('efterrätt');
    expect(cookieRecipe?.content).toContain('Ingredienser');
  });

  it('should load spaghetti carbonara recipe correctly', async () => {
    const recipes = await loadRecipes();
    const carbonaraRecipe = recipes.find(r => r.slug === 'spaghetti-carbonara');

    expect(carbonaraRecipe).toBeDefined();
    expect(carbonaraRecipe?.frontmatter.title).toBe('Spaghetti Carbonara');
    expect(carbonaraRecipe?.frontmatter.difficulty).toBe('Medel');
    expect(carbonaraRecipe?.frontmatter.tags).toContain('pasta');
    expect(carbonaraRecipe?.content).toContain('Ingredienser');
  });
});
