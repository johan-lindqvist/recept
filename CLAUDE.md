# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude's Role

When working on this project, Claude acts as a **senior React web developer** with expertise in TypeScript, modern web development practices, testing, and code quality. Claude should apply best practices, write maintainable code, and ensure all features are thoroughly tested.

## Task Management

**CRITICAL**: For ANY task involving multiple steps or changes:

1. **Always create a todo list** at the start using the TodoWrite tool
2. Break down the task into specific, actionable items
3. Update the todo list as you progress through each item
4. Mark items as complete immediately after finishing them
5. This helps track progress and ensures no steps are forgotten

Example todo list for adding a new feature:
- Research existing code structure
- Update TypeScript types
- Implement component changes
- Update tests
- Run type check
- Build the project

## Project Overview

A TypeScript static web application for hosting food recipes in Swedish. Recipes are stored as markdown files in the repository and rendered as a static website hosted on GitHub Pages.

**Language**: Swedish (Svenska)
**Measurements**: Metric system with Swedish cooking conventions

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

## Testing Requirements

**IMPORTANT**: Before completing any task, Claude MUST ensure:

1. **All features have test coverage**: Every new feature, component, or utility function must have corresponding tests
2. **Tests are green**: All tests must pass (`npm test` returns successfully)
3. **Build succeeds**: The application must build without errors (`npm run build` completes successfully)
4. **Type checking passes**: No TypeScript errors (`npm run type-check` or `tsc --noEmit` succeeds)

### Test Coverage Expectations

- **Components**: Test rendering, user interactions, and edge cases
- **Utilities**: Test all input/output scenarios and error handling
- **Integration**: Test the interaction between components and data flow
- **Minimum Coverage**: Aim for high test coverage on all new code

### Testing with Lucide Icons

When testing components that use Lucide icons, you must mock the `lucide` module:

```typescript
vi.mock('lucide', () => ({
  createElement: vi.fn((icon: any) => {
    const svg = document.createElement('svg');
    svg.setAttribute('data-icon', icon.name || 'icon');
    return svg;
  }),
  icons: {
    Clock: { name: 'clock' },
    ChefHat: { name: 'chef-hat' },
    // ... other icons
  },
}));
```

This ensures icons render as SVG elements in tests without requiring the full Lucide library.

### Task Completion Checklist

Before marking any task as complete, verify:
- [ ] Tests written for all new/modified features
- [ ] `npm test` passes (all tests green)
- [ ] `npm run build` succeeds
- [ ] `npm run type-check` passes
- [ ] No console errors or warnings

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
│       └── deploy.yml              # GitHub Pages deployment workflow
├── .gitattributes                  # Git LFS configuration for images
├── public/
│   └── images/
│       └── recipes/                # Recipe images (tracked with Git LFS)
│           ├── *.svg, *.jpg, *.png # Recipe images
│           └── README.md           # Image guidelines
├── recipes/                        # Recipe markdown files
│   ├── chocolate-chip-cookies.md
│   └── spaghetti-carbonara.md
├── src/
│   ├── components/                 # UI components
│   │   ├── RecipeCard.ts          # Recipe card component for listing
│   │   ├── RecipeCard.test.ts     # Tests for RecipeCard
│   │   ├── RecipeDetail.ts        # Recipe detail view component
│   │   └── RecipeDetail.test.ts   # Tests for RecipeDetail
│   ├── types/
│   │   └── Recipe.ts              # TypeScript interfaces for recipes
│   ├── utils/
│   │   ├── recipeParser.ts        # Markdown parsing utilities
│   │   └── recipeParser.test.ts   # Tests for recipeParser
│   ├── main.ts                    # Application entry point
│   └── style.css                  # Global styles
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite build configuration
├── vitest.config.ts               # Vitest testing configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json
└── CLAUDE.md                      # This file
```

## Code Architecture

### Recipe Storage
- Recipes are stored as markdown files in `recipes/` directory
- **All recipes must be written in Swedish**
- **All measurements must use the metric system** (grams, liters, deciliters, etc.)
- Each recipe uses YAML frontmatter with the following schema:
  - `title` (string, required): Recipe name in Swedish
  - `description` (string, optional): Short description in Swedish
  - `image` (string, optional): Path to recipe image (e.g., "/recept/images/recipes/recipe-name.svg")
    - Images should be placed in `public/images/recipes/`
    - Use the base path `/recept/` to match the Vite config
    - Supported formats: .svg, .jpg, .jpeg, .png, .webp
    - Images are tracked with Git LFS
  - `prepTime` (string, optional): Preparation time (e.g., "15 minuter")
  - `cookTime` (string, optional): Cooking time (e.g., "30 minuter")
  - `servings` (number, optional): Number of servings (e.g., 4)
  - `difficulty` (string, optional): Lätt | Medel | Svår
  - `tags` (string[], optional): Recipe tags for categorization in Swedish

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

### UI Components
- **RecipeCard**: Displays recipe cards in a grid layout
  - Shows recipe image with hover zoom effect
  - Displays title, description, and metadata
  - Uses Lucide icons for metadata (Clock, ChefHat, Users, Gauge)
  - Clickable to view full recipe details

- **RecipeDetail**: Displays full recipe information
  - Shows large recipe image
  - Displays all metadata with icons and labels
  - Renders markdown content as HTML
  - Includes back button with ArrowLeft icon

### Key Dependencies
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Vitest**: Testing framework with happy-dom for DOM testing
- **gray-matter**: YAML frontmatter parsing
- **marked**: Markdown to HTML conversion
- **Lucide**: Icon library for UI elements

### Git LFS for Images
- Repository uses Git LFS to efficiently store image files
- All image formats are tracked: *.jpg, *.jpeg, *.png, *.webp, *.gif, *.svg
- Setup: `git lfs install` (already configured in `.gitattributes`)
- Images in `public/images/recipes/` are automatically tracked

### Working with Lucide Icons

To use Lucide icons in UI components:

```typescript
import { createElement, icons } from 'lucide';

// Create an icon element
const iconElement = createElement(icons.Clock, { size: 16 });

// Append to DOM
element.appendChild(iconElement);
```

**Available icons in this project:**
- `icons.Clock` - Preparation time
- `icons.ChefHat` - Cooking time
- `icons.Users` - Servings
- `icons.Gauge` - Difficulty level
- `icons.ArrowLeft` - Navigation (back button)

**Do NOT** use the functional import style (e.g., `import { Clock } from 'lucide'`) as it causes TypeScript errors. Always use `createElement(icons.IconName, options)` pattern.
