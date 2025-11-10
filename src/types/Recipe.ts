export interface RecipeFrontmatter {
  title: string;
  description?: string;
  totalTime?: string;
  servings?: number;
  tags?: string[];
}

export interface Recipe {
  slug: string;
  frontmatter: RecipeFrontmatter;
  content: string;
}
