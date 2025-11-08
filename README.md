# Recept

A static web application for hosting and browsing food recipes. Recipes are stored as markdown files in the repository and rendered as a beautiful, searchable website hosted on GitHub Pages.

## Features

- Browse recipes in a responsive grid layout
- Search recipes by title, description, or tags
- View detailed recipe instructions with ingredients and cooking times
- Fully static site with no backend required
- Automatic deployment to GitHub Pages

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

### Building

Build the site for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Adding Recipes

Create a new markdown file in the `recipes/` directory with the following format:

```markdown
---
title: Recipe Name
description: A short description of the recipe
prepTime: 15 minutes
cookTime: 30 minutes
servings: 4
difficulty: Easy
tags:
  - tag1
  - tag2
---

## Ingredients

- Ingredient 1
- Ingredient 2

## Instructions

1. Step 1
2. Step 2
```

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

To enable GitHub Pages:
1. Go to your repository settings
2. Navigate to Pages
3. Set Source to "GitHub Actions"

## Technology Stack

- TypeScript
- Vite
- marked (Markdown parser)
- gray-matter (Frontmatter parser)