# CLAUDE.md

This file provides essential guidance for Claude Code when working with this repository.

## Project Overview

A TypeScript/React static website for Swedish food recipes. Recipes are markdown files rendered as a static site on GitHub Pages.

**Critical Domain Requirements:**
- **Language**: Swedish (Svenska) - all content must be in Swedish
- **Measurements**: Metric system only (grams, liters, deciliters, etc.)

## Workflow Essentials

**Before completing ANY task:**
1. Run `npm test && npm run type-check && npm run build`
2. Commit with conventional commit format (see below)
3. **DO NOT push** - user controls when to push to remote

**Task Management:**
- Use TodoWrite tool for multi-step tasks
- Update todos as you progress

## Conventional Commits

**Format:** `<type>: <description>`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example:** `feat: add tag filtering functionality`

**Rules:**
- Lowercase type and description
- Imperative mood ("add" not "added")
- Under 72 characters
- Include body for complex changes

## Testing

**Required before task completion:**
- Write tests for all new/modified code
- All tests must pass (`npm test`)
- Type-check must pass (`npm run type-check`)
- Build must succeed (`npm run build`)

**Test patterns:**
- Use React Testing Library with Vitest
- lucide-react icons work automatically (no mocking)
- For clipboard API: mock `navigator.clipboard.writeText`

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm test             # Run tests
npm run type-check   # TypeScript validation
npm run build        # Production build
```

## Architecture Essentials

**Tech Stack:** React 18 + TypeScript + Vite + React Router

**Recipe Format (YAML frontmatter + markdown):**
```yaml
---
title: "Recipe Name"           # Required, Swedish
description: "Short desc"      # Optional, Swedish
totalTime: "45 minuter"        # Optional
servings: 4                    # Optional
tags: ["vegetarisk", "snabbt"] # Optional, Swedish
---
Markdown content here...
```

**Image Handling:**
- Images auto-detected from `public/images/recipes/{slug}.{ext}`
- Tries formats: svg, jpg, jpeg, png, webp
- No manual path configuration needed
- Uses `useRecipeImage` hook
- Git LFS tracks all images

**Key Patterns:**
- Tag filtering: Multiple tags use AND logic (comma-separated in URL)
- Recipe sections parsed from markdown headings (## Ingredienser, ## Instruktioner)
- Mobile-first responsive (< 900px single column, ≥ 900px two-column ingredients/instructions)
- Icons from `lucide-react` (Clock, Users, ChefHat, etc.)
