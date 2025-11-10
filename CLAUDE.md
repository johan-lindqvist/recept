# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude's Role

When working on this project, Claude acts as a **senior React web developer** with expertise in TypeScript, modern web development practices, testing, and code quality. Claude should apply best practices, write maintainable code, and ensure all features are thoroughly tested.

## Git Workflow

**Workflow Summary:**
1. Work directly on the `main` branch
2. Make your changes and test thoroughly
3. Commit changes with conventional commit messages
4. **DO NOT push** - the user will manually decide when to push to remote

This is a solo development workflow where the user maintains control over when changes are pushed to the remote repository.

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
- Commit changes with conventional commit message

## Git Commit Conventions

**REQUIRED**: All git commits MUST follow the Conventional Commits specification.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Examples

```bash
# Feature addition
feat: add image support for recipe cards

# Bug fix
fix: resolve icon cutoff in recipe card meta section

# Documentation update
docs: update CLAUDE.md with Git LFS instructions

# Test addition
test: add tests for RecipeCard component with icons

# Multiple changes
feat: add Lucide icons to recipe components

Added icon support for metadata display including:
- Clock icon for preparation time
- ChefHat icon for cooking time
- Users icon for servings
- Gauge icon for difficulty level
```

### Important Notes

- Use lowercase for type and description
- Keep the description concise (under 72 characters)
- Use imperative mood ("add" not "added" or "adds")
- Include body for complex changes explaining the "why" not the "what"
- Reference issues/PRs in footer if applicable

## Detailed Git Workflow

### Complete Workflow for Every Task

For EVERY task, follow these steps:

1. **Make your changes**
   - Edit files as needed
   - Test your changes thoroughly

2. **Run all checks**
   ```bash
   npm test
   npm run type-check
   npm run build
   ```

3. **Stage and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **DO NOT push** - the user will decide when to push

### Example Workflow

```bash
# Make your changes to files...

# Run all checks
npm test
npm run type-check
npm run build

# Stage all changes
git add .

# Commit with conventional commit message
git commit -m "feat: add Lucide icons to recipe components

Added icon support for metadata display including:
- Clock icon for preparation time
- ChefHat icon for cooking time
- Users icon for servings
- Gauge icon for difficulty level"

# STOP HERE - do not push
# The user will manually decide when to run: git push origin main
```

### Task Completion Checklist

Before considering ANY task complete, verify you have done ALL of the following:

- [ ] Made the code changes
- [ ] Written/updated tests
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run type-check` - no errors
- [ ] Run `npm run build` - build succeeds
- [ ] Staged changes with `git add`
- [ ] Committed with conventional commit message
- [ ] **STOPPED before pushing** - user controls when to push

### Important Reminders

- ✅ Work directly on the `main` branch
- ✅ Test thoroughly before committing
- ✅ Use conventional commit format
- ✅ Keep commits focused on a single feature/fix
- 🚫 **DO NOT push to remote** - the user will decide when to push

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

### Testing React Components

When testing React components, use React Testing Library patterns:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

**Testing with lucide-react icons**: lucide-react icons work automatically in tests with happy-dom, no mocking required.

**Testing clipboard API**: When testing components that use `navigator.clipboard.writeText`:

```typescript
let clipboardSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  }
  clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
});

afterEach(() => {
  clipboardSpy.mockRestore();
});
```

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
│   ├── components/                 # React UI components
│   │   ├── RecipeCard.tsx         # Recipe card component for listing
│   │   ├── RecipeCard.test.tsx    # Tests for RecipeCard
│   │   ├── RecipeCreator.tsx      # Recipe creation form component
│   │   ├── RecipeCreator.test.tsx # Tests for RecipeCreator
│   │   ├── RecipeDetail.tsx       # Recipe detail view component
│   │   └── RecipeDetail.test.tsx  # Tests for RecipeDetail
│   ├── hooks/
│   │   ├── useRecipes.ts          # Custom hook for loading recipes
│   │   └── useRecipeImage.ts      # Custom hook for automatic image detection
│   ├── pages/                      # Page components for routing
│   │   ├── RecipeListPage.tsx     # Recipe listing page
│   │   ├── RecipeDetailPage.tsx   # Recipe detail page
│   │   └── RecipeCreatorPage.tsx  # Recipe creation page
│   ├── types/
│   │   └── Recipe.ts              # TypeScript interfaces for recipes
│   ├── utils/
│   │   ├── recipeParser.ts        # Markdown parsing utilities
│   │   ├── recipeParser.test.ts   # Tests for recipeParser
│   │   ├── markdownGenerator.ts   # Markdown generation utilities
│   │   └── markdownGenerator.test.ts # Tests for markdownGenerator
│   ├── test/
│   │   └── setup.ts               # Test setup (React Testing Library)
│   ├── App.tsx                    # Root component with routing
│   ├── main.tsx                   # React application entry point
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
  - `totalTime` (string, optional): Total time (e.g., "45 minuter")
  - `servings` (number, optional): Number of servings (e.g., 4)
  - `tags` (string[], optional): Recipe tags for categorization in Swedish

### Recipe Images
- Recipe images are **automatically detected** - no need to specify image paths in frontmatter
- Images should be placed in `public/images/recipes/`
- Name the image file to match the recipe slug (e.g., `korv-stroganoff.jpg` for `korv-stroganoff.md`)
- Supported formats (tried in order): .svg, .jpg, .jpeg, .png, .webp
- If no matching image is found, a default image is used
- Images are tracked with Git LFS for efficient storage
- The `useRecipeImage` hook handles automatic detection by trying each extension until one loads successfully

### Build Process
- **Framework**: React 18+ with TypeScript
- **Bundler**: Vite is used for development server and production builds with React plugin
- **Output**: Built files are placed in `dist/` directory
- **Recipe Loading**: Recipes are loaded at runtime using Vite's `import.meta.glob` to dynamically import markdown files
- **Markdown Parsing**: Uses `gray-matter` for frontmatter extraction and `marked` for markdown-to-HTML conversion
- **Routing**: Client-side routing with React Router DOM
- **Deployment**: Automatic deployment to GitHub Pages via GitHub Actions on push to main branch

### Application Flow
1. `main.tsx` initializes the React app with React Router
2. `App.tsx` sets up routing with `BrowserRouter` (basename: `/recept/`)
3. Routes:
   - `/` → `RecipeListPage` - displays recipe grid with search
   - `/recipe/:slug` → `RecipeDetailPage` - displays full recipe details
   - `/create` → `RecipeCreatorPage` - form for creating new recipes
4. `useRecipes` hook loads all recipes from `recipes/` directory with loading/error states
5. Recipe listing is rendered as a grid of cards using `RecipeCard` component
6. Search functionality filters recipes by title, description, and tags (using `useMemo`)
7. Clicking a recipe card navigates to the detail page using React Router
8. Recipe detail page displays full recipe information using `RecipeDetail` component
9. Recipe creator page provides a form to generate markdown for new recipes

### Key Files
- `src/main.tsx`: React entry point using ReactDOM.createRoot
- `src/App.tsx`: Root component with React Router setup
- `src/hooks/useRecipes.ts`: Custom hook for loading recipes with state management
- `src/pages/`: Page components that compose other components for each route
- `src/components/`: Reusable React components (RecipeCard, RecipeDetail, RecipeCreator)
- `src/utils/recipeParser.ts`: Parses markdown files and extracts frontmatter
- `src/utils/markdownGenerator.ts`: Generates markdown from form data
- `src/types/Recipe.ts`: TypeScript interfaces for type safety
- `vite.config.ts`: Configures base URL for GitHub Pages (`/recept/`) and React plugin

### UI Components

**React Components** (functional components with hooks):

- **RecipeCard**: Displays recipe cards in a grid layout
  - Props: `recipe` (Recipe), `onClick` (callback)
  - State: `tagsExpanded` (boolean) for showing all tags
  - Uses `useRecipeImage` hook for automatic image detection
  - Shows recipe image with hover zoom effect
  - Displays title, description, and metadata
  - Uses lucide-react icons (Clock, Users)
  - Clickable to navigate to recipe details

- **RecipeDetail**: Displays full recipe information
  - Props: `recipe` (Recipe)
  - Uses `useRecipeImage` hook for automatic image detection
  - Shows large recipe image with fallback to default
  - Displays all metadata with icons and labels
  - Renders markdown content as HTML using `dangerouslySetInnerHTML`
  - Uses lucide-react icons (Clock, Users, ArrowLeft)

- **RecipeCreator**: Form for creating new recipes
  - State: `formData`, `markdown`, `filename`, `copyButtonText`, `copyButtonDisabled`
  - Controlled form inputs with `handleInputChange`
  - Real-time markdown generation with `useEffect`
  - Clipboard API integration for copying markdown
  - Automatic filename generation from title

**Page Components** (compose other components):

- **RecipeListPage**: Main recipe listing with search
  - Uses `useRecipes` hook for data loading
  - Uses `useNavigate` for routing
  - Search filtering with `useMemo`
  - Displays loading and error states

- **RecipeDetailPage**: Individual recipe display
  - Uses `useParams` to get recipe slug from URL
  - Uses `useRecipes` hook for data loading
  - Displays loading, error, and not-found states

- **RecipeCreatorPage**: Recipe creation form
  - Simple wrapper around `RecipeCreator` component

**Custom Hooks**:

- **useRecipes**: Loads all recipes from markdown files
  - Returns: `{ recipes, loading, error }`
  - Uses `useState` for state management
  - Uses `useEffect` for async data loading
  - Cleanup on unmount to prevent memory leaks

- **useRecipeImage**: Automatically detects and loads recipe images
  - Param: `slug` (string) - The recipe slug to find image for
  - Returns: `string` - The image URL or default image
  - Tries extensions in order: svg, jpg, jpeg, png, webp
  - Uses Image() API to test loading before setting src
  - Falls back to default image if no match found
  - Resets when slug changes

### Key Dependencies
- **React**: UI framework (18+)
- **React DOM**: React rendering
- **React Router DOM**: Client-side routing
- **Vite**: Build tool and dev server with React plugin
- **TypeScript**: Type safety
- **Vitest**: Testing framework with happy-dom for DOM testing
- **@testing-library/react**: React Testing Library for component testing
- **@testing-library/user-event**: User interaction simulation for tests
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **gray-matter**: YAML frontmatter parsing
- **marked**: Markdown to HTML conversion
- **lucide-react**: React-compatible icon library

### Git LFS for Images
- Repository uses Git LFS to efficiently store image files
- All image formats are tracked: *.jpg, *.jpeg, *.png, *.webp, *.gif, *.svg
- Setup: `git lfs install` (already configured in `.gitattributes`)
- Images in `public/images/recipes/` are automatically tracked

### Working with Lucide React Icons

To use Lucide icons in React components:

```typescript
import { Clock, Users } from 'lucide-react';

function MyComponent() {
  return (
    <div>
      <Clock size={20} />
      <Users size={16} />
    </div>
  );
}
```

**Available icons in this project:**
- `Clock` - Time (preparation/cooking/total)
- `Users` - Servings
- `ArrowLeft` - Navigation (back button)

**Icon Props:**
- `size`: Number (pixel size, default 24)
- `color`: String (CSS color)
- `strokeWidth`: Number (default 2)
- Standard HTML/SVG attributes (className, style, etc.)

**IMPORTANT**: Always import icons directly from `lucide-react`, not from `lucide`. The `lucide-react` package provides React components, while `lucide` provides vanilla JavaScript functions.
