export interface RecipeFrontmatter {
  title: string;
  description?: string;
  image?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Lätt' | 'Medel' | 'Svår' | 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}

export interface Recipe {
  slug: string;
  frontmatter: RecipeFrontmatter;
  content: string;
}
