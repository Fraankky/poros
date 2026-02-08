import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImageUrl: string | null
  thumbnailUrl: string | null
  author: string
  viewCount: number
  status: string
  publishedAt: string
  createdAt: string
  category: {
    id: string
    name: string
    slug: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface FeaturedResponse {
  hero: Article | null
  grid: Article[]
}

interface ArticlesResponse {
  articles: Article[]
  pagination: Pagination
}

interface ArticleResponse {
  article: Article
}

interface SearchResponse {
  articles: Article[]
  pagination: Pagination
  query: string
}

// GET /api/public/featured
export function usePublicFeatured() {
  return useQuery<FeaturedResponse>({
    queryKey: ['public', 'featured'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/public/featured`)
      if (!res.ok) throw new Error('Failed to fetch featured articles')
      return res.json()
    }
  })
}

// GET /api/public/articles
interface UsePublicArticlesParams {
  page?: number
  limit?: number
  category?: string
  search?: string
}

export function usePublicArticles(params: UsePublicArticlesParams = {}) {
  const { page = 1, limit = 12, category, search } = params
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  })
  
  if (category) queryParams.append('category', category)
  if (search) queryParams.append('search', search)

  return useQuery<ArticlesResponse>({
    queryKey: ['public', 'articles', { page, limit, category, search }],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/public/articles?${queryParams}`)
      if (!res.ok) throw new Error('Failed to fetch articles')
      return res.json()
    }
  })
}

// GET /api/public/articles/:slug
export function usePublicArticle(slug: string) {
  return useQuery<ArticleResponse>({
    queryKey: ['public', 'article', slug],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/public/articles/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch article')
      return res.json()
    },
    enabled: !!slug
  })
}

// GET /api/public/articles/:slug/related
export function useRelatedArticles(slug: string) {
  return useQuery<{ articles: Article[] }>({
    queryKey: ['public', 'related', slug],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/public/articles/${slug}/related`)
      if (!res.ok) throw new Error('Failed to fetch related articles')
      return res.json()
    },
    enabled: !!slug
  })
}

// GET /api/public/search
export function usePublicSearch(query: string, page = 1, limit = 12) {
  return useQuery<SearchResponse>({
    queryKey: ['public', 'search', { query, page, limit }],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/api/public/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      )
      if (!res.ok) throw new Error('Failed to search articles')
      return res.json()
    },
    enabled: query.trim().length > 0
  })
}
