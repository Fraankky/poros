// Shared types for POROS Admin

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface CategoryWithCount extends Category {
  _count: { articles: number }
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImageUrl: string | null
  thumbnailUrl: string | null
  author: string
  authorEmail: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  viewCount: number
  publishedAt: string
  createdAt: string
  updatedAt: string
  categoryId: string
  category: Category
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ArticleStats {
  total: number
  withCover: number
  withoutCover: number
  coverPercentage: number
}

export interface UploadResult {
  success: boolean
  coverUrl?: string
  thumbnailUrl?: string
  coverKey?: string
  thumbKey?: string
  error?: string
}

// API Response types
export interface ArticlesResponse {
  articles: Article[]
  pagination: Pagination
}

export interface CategoriesResponse {
  categories: CategoryWithCount[]
}

export interface ArticleResponse {
  article: Article
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}
