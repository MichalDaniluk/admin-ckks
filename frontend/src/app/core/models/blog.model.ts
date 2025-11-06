export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface BlogPost {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author?: string;
  status: BlogPostStatus;
  publishedAt?: Date;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogPostDto {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author?: string;
  status?: BlogPostStatus;
  publishedAt?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export interface UpdateBlogPostDto {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  author?: string;
  status?: BlogPostStatus;
  publishedAt?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
}

export interface QueryBlogPostsDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogPostStatus;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedBlogPostsResponse {
  data: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
