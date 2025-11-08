export interface RecipeFrontmatter {
  title: string;
  description?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}

export interface Recipe {
  slug: string;
  frontmatter: RecipeFrontmatter;
  content: string;
}
