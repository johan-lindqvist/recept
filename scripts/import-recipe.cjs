/**
 * Recipe Import Script
 *
 * Imports recipes from images (photos of paper recipes) or web URLs
 * using Claude AI to parse and structure the content.
 *
 * Usage:
 *   npm run import-recipe -- --url "https://example.com/recipe"
 *   npm run import-recipe -- --image "./photo.jpg"
 *
 * Requires ANTHROPIC_API_KEY environment variable to be set.
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Recipe output directory
const RECIPES_DIR = path.join(__dirname, '..', 'recipes');

// System prompt for recipe parsing
const SYSTEM_PROMPT = `You are a recipe parser that extracts and structures recipes into a specific YAML frontmatter + markdown format.

IMPORTANT REQUIREMENTS:
- All content MUST be in Swedish (Svenska)
- All measurements MUST use metric system (gram, kg, dl, l, ml, msk, tsk, etc.)
- Convert any imperial measurements to metric
- Translate ingredient names and instructions to Swedish

Output the recipe in this exact format:

---
title: "Recipe Title in Swedish"
description: "Brief description in Swedish (1-2 sentences)"
totalTime: "X minuter" or "X timmar" or "X timmar Y minuter"
servings: N
tags: ["tag1", "tag2"]
---

## Ingredienser

- quantity unit ingredient
- quantity unit ingredient

## Instruktioner

1. Step one in Swedish
2. Step two in Swedish

## Tips

- Optional tips section if relevant

RULES:
1. Use Swedish ingredient names (e.g., "mjöl" not "flour", "ägg" not "eggs")
2. Use Swedish units: g, kg, dl, l, ml, msk (matsked), tsk (tesked), krm (kryddmått), st (stycken)
3. Tags should be Swedish and lowercase (e.g., "vegetarisk", "dessert", "förrätt", "middag", "bakning", "snabb", "enkel")
4. For totalTime, use Swedish format: "30 minuter", "1 timme", "1 timme 30 minuter"
5. Only include sections that have content
6. Format ingredients as "- quantity unit ingredient" (e.g., "- 2 dl mjöl", "- 3 st ägg")
7. Number the instructions
8. Keep descriptions concise but informative`;

/**
 * Generate a URL-friendly slug from the recipe title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Fetch content from a URL
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = new URL(response.headers.location, url).href;
        console.log(`Following redirect to: ${redirectUrl}`);
        fetchUrl(redirectUrl).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: Failed to fetch ${url}`));
        return;
      }

      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Extract JSON-LD recipe data from HTML if available
 */
function extractJsonLd(html) {
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);

      // Handle array of objects
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (item['@type'] === 'Recipe') {
          return item;
        }
        // Check @graph for Recipe
        if (item['@graph']) {
          const recipe = item['@graph'].find(g => g['@type'] === 'Recipe');
          if (recipe) return recipe;
        }
      }
    } catch (e) {
      // Continue to next script tag
    }
  }

  return null;
}

/**
 * Read an image file and return base64 encoded data
 */
function readImageAsBase64(imagePath) {
  const absolutePath = path.resolve(imagePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Image file not found: ${absolutePath}`);
  }

  const imageBuffer = fs.readFileSync(absolutePath);
  const base64 = imageBuffer.toString('base64');

  // Determine media type from extension
  const ext = path.extname(imagePath).toLowerCase();
  const mediaTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };

  const mediaType = mediaTypes[ext];
  if (!mediaType) {
    throw new Error(`Unsupported image format: ${ext}. Supported: jpg, jpeg, png, gif, webp`);
  }

  return { base64, mediaType };
}

/**
 * Parse recipe from image using Claude Vision
 */
async function parseRecipeFromImage(client, imagePath) {
  console.log(`Reading image: ${imagePath}`);
  const { base64, mediaType } = readImageAsBase64(imagePath);

  console.log('Sending image to Claude for parsing...');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'Please extract the recipe from this image and format it according to the specified structure. Translate everything to Swedish and convert any measurements to metric.',
          },
        ],
      },
    ],
  });

  return response.content[0].text;
}

/**
 * Parse recipe from URL using Claude
 */
async function parseRecipeFromUrl(client, url) {
  console.log(`Fetching URL: ${url}`);
  const html = await fetchUrl(url);

  // Try to extract JSON-LD first
  const jsonLd = extractJsonLd(html);

  let userMessage;
  if (jsonLd) {
    console.log('Found structured recipe data (JSON-LD)');
    userMessage = `I found this structured recipe data from ${url}:\n\n${JSON.stringify(jsonLd, null, 2)}\n\nPlease convert this to the specified Swedish recipe format.`;
  } else {
    console.log('No structured data found, parsing HTML content...');
    // Clean up HTML - remove scripts, styles, and excessive whitespace
    const cleanHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000); // Limit content length

    userMessage = `Please extract the recipe from this web page content (from ${url}) and format it according to the specified structure:\n\n${cleanHtml}`;
  }

  console.log('Sending to Claude for parsing...');
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return response.content[0].text;
}

/**
 * Extract title from parsed recipe markdown
 */
function extractTitle(markdown) {
  const titleMatch = markdown.match(/title:\s*["'](.+?)["']/);
  return titleMatch ? titleMatch[1] : null;
}

/**
 * Clean up the markdown output (remove code fences if present)
 */
function cleanMarkdown(markdown) {
  // Remove markdown code fences if present
  return markdown
    .replace(/^```(?:markdown|yaml)?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
}

/**
 * Save recipe to file
 */
function saveRecipe(markdown, suggestedFilename) {
  const filePath = path.join(RECIPES_DIR, suggestedFilename);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    const timestamp = Date.now();
    const newFilename = suggestedFilename.replace('.md', `-${timestamp}.md`);
    console.log(`File ${suggestedFilename} already exists, saving as ${newFilename}`);
    return saveRecipe(markdown, newFilename);
  }

  fs.writeFileSync(filePath, markdown, 'utf-8');
  return filePath;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let url = null;
  let imagePath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      url = args[i + 1];
      i++;
    } else if (args[i] === '--image' && args[i + 1]) {
      imagePath = args[i + 1];
      i++;
    }
  }

  if (!url && !imagePath) {
    console.error('Usage:');
    console.error('  npm run import-recipe -- --url "https://example.com/recipe"');
    console.error('  npm run import-recipe -- --image "./photo.jpg"');
    process.exit(1);
  }

  if (url && imagePath) {
    console.error('Please specify either --url or --image, not both');
    process.exit(1);
  }

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    console.error('');
    console.error('Set it with:');
    console.error('  export ANTHROPIC_API_KEY=sk-ant-...');
    console.error('');
    console.error('Or create a .env file with:');
    console.error('  ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
  }

  // Initialize Anthropic client
  const client = new Anthropic({ apiKey });

  try {
    let markdown;

    if (url) {
      markdown = await parseRecipeFromUrl(client, url);
    } else {
      markdown = await parseRecipeFromImage(client, imagePath);
    }

    // Clean up the output
    markdown = cleanMarkdown(markdown);

    // Extract title and generate filename
    const title = extractTitle(markdown);
    if (!title) {
      console.error('Could not extract recipe title from parsed content');
      console.log('\nParsed content:');
      console.log(markdown);
      process.exit(1);
    }

    const slug = generateSlug(title);
    const filename = `${slug}.md`;

    // Save the recipe
    const savedPath = saveRecipe(markdown, filename);

    console.log('');
    console.log('Recipe imported successfully!');
    console.log(`  Title: ${title}`);
    console.log(`  File: ${savedPath}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review the generated recipe for accuracy');
    console.log('  2. Add an image to public/images/recipes/ (optional)');
    console.log('  3. Run "npm run dev" to preview');
    console.log('  4. Commit the new recipe');

  } catch (error) {
    console.error('Error importing recipe:', error.message);
    if (error.status === 401) {
      console.error('Invalid API key. Please check your ANTHROPIC_API_KEY.');
    }
    process.exit(1);
  }
}

main();
