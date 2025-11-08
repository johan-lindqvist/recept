# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript static web application for hosting food recipes. Recipes are stored as markdown files in the repository and rendered as a static website hosted on GitHub Pages.

## Development Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm test -- path/to/test-file
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
# or
tsc --noEmit
```

## Project Structure

```
recept/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment workflow
├── recipes/                    # Recipe markdown files
│   ├── chocolate-chip-cookies.md
│   └── spaghetti-carbonara.md
├── src/
│   ├── components/             # UI components
│   │   ├── RecipeCard.ts      # Recipe card component for listing
│   │   └── RecipeDetail.ts    # Recipe detail view component
│   ├── types/
│   │   └── Recipe.ts          # TypeScript interfaces for recipes
│   ├── utils/
│   │   └── recipeParser.ts    # Markdown parsing utilities
│   ├── main.ts                # Application entry point
│   └── style.css              # Global styles
├── index.html                 # HTML entry point
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## Code Architecture

### Recipe Storage
- Recipes are stored as markdown files in `recipes/` directory
- Each recipe uses YAML frontmatter with the following schema:
  - `title` (string, required): Recipe name
  - `description` (string, optional): Short description
  - `prepTime` (string, optional): Preparation time
  - `cookTime` (string, optional): Cooking time
  - `servings` (number, optional): Number of servings
  - `difficulty` (string, optional): Easy | Medium | Hard
  - `tags` (string[], optional): Recipe tags for categorization

### Build Process
- **Bundler**: Vite is used for development server and production builds
- **Output**: Built files are placed in `dist/` directory
- **Recipe Loading**: Recipes are loaded at runtime using Vite's `import.meta.glob` to dynamically import markdown files
- **Markdown Parsing**: Uses `gray-matter` for frontmatter extraction and `marked` for markdown-to-HTML conversion
- **Deployment**: Automatic deployment to GitHub Pages via GitHub Actions on push to main branch

### Application Flow
1. `main.ts` initializes the app and loads all recipes from `recipes/` directory
2. Recipe listing is rendered as a grid of cards using `RecipeCard.ts`
3. Search functionality filters recipes by title, description, and tags
4. Clicking a recipe card displays the full recipe using `RecipeDetail.ts`
5. Users can navigate back to the recipe list from the detail view

### Key Files
- `src/main.ts`: Entry point, handles app initialization and search functionality
- `src/utils/recipeParser.ts`: Parses markdown files and extracts frontmatter
- `src/types/Recipe.ts`: TypeScript interfaces for type safety
- `vite.config.ts`: Configures base URL for GitHub Pages (`/recept/`)
