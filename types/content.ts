export interface PostFrontmatter {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime?: number;
  draft?: boolean;
  series?: string;
  part?: string;
  difficulty?: string;
}

export interface Post {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  draft: boolean;
  series?: string;
  part?: string;
  difficulty?: string;
  content: string;
  html: string;
}

export interface WritingSeries {
  title: string;
  slug: string;
  description: string;
  posts: Post[];
}
