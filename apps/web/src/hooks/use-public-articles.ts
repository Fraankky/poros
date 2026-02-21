import { useQuery } from '@tanstack/react-query'
import {
  fetchHeroArticles,
  fetchCategoryArticles,
  fetchArticlesByCategory,
  fetchArticleDetail,
  fetchSearch,
} from '../lib/data-source'

// @ts-ignore - Vite env (keep for backward compatibility)
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001'

// Re-export types from data-source for compatibility
type ArticleSummary = {
  id: string
  title: string
  slug: string
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

// Article type with content for public API responses
export interface Article extends ArticleSummary {
  content: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ArticlesResponse {
  articles: Article[]
  pagination: Pagination
}

// Hero response type
interface HeroResponse {
  featured: Article | null
  sideArticles: Article[]
}

interface FeaturedResponse {
  hero: Article | null
  grid: Article[]
}

interface ArticleResponse {
  article: Article
}

interface SearchResponse {
  articles: Article[]
  pagination: Pagination
  query: string
}

// Adapter to convert ArticleSummary[] to Article[] (for summary responses)
function adaptArticlesResponse(response: {
  articles: ArticleSummary[]
  pagination: Pagination
}): ArticlesResponse {
  return {
    articles: response.articles as Article[], // Summary articles don't have content
    pagination: response.pagination,
  }
}

// GET /api/public/featured
export function usePublicFeatured() {
  return useQuery<FeaturedResponse>({
    queryKey: ['public', 'featured'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/public/featured`)
      if (!res.ok) throw new Error('Failed to fetch featured articles')
      return res.json()
    },
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

  return useQuery<ArticlesResponse>({
    queryKey: ['public', 'articles', { page, limit, category, search }],
    queryFn: async () => {
      const response = await fetchArticlesByCategory(category || '', {
        page,
        limit,
      })
      return adaptArticlesResponse(response)
    },
    enabled: !!category || !!search,
  })
}

// GET /api/public/articles/:slug
export function usePublicArticle(slug: string) {
  return useQuery<ArticleResponse>({
    queryKey: ['public', 'article', slug],
    queryFn: async () => {
      const { article, related } = await fetchArticleDetail(slug)
      return {
        article: article as Article,
        related: related as Article[],
      }
    },
    enabled: !!slug,
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
    enabled: !!slug,
  })
}

// GET /api/public/search
export function usePublicSearch(query: string | undefined, page = 1, limit = 12) {
  const safeQuery = query || ''
  return useQuery<SearchResponse>({
    queryKey: ['public', 'search', { query: safeQuery, page, limit }],
    queryFn: () => fetchSearch(safeQuery, page, limit),
    enabled: safeQuery.trim().length > 0,
  })
}

// GET /api/public/articles - Get articles for hero carousel (5 carousel + 2 side = 7 total)
export function useHeroCarouselArticles(total = 7) {
  return useQuery<ArticlesResponse>({
    queryKey: ['public', 'hero-carousel', { total }],
    queryFn: async () => {
      const response = await fetchHeroArticles(total)
      return adaptArticlesResponse(response)
    },
    staleTime: 5 * 60 * 1000,
  })
}

// GET /api/public/hero - Get featured + 2 side articles for hero section
export function useHeroArticles() {
  return useQuery<HeroResponse>({
    queryKey: ['public', 'hero'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/public/hero`)
      if (!res.ok) throw new Error('Failed to fetch hero articles')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// GET /api/public/categories/:slug/articles
interface UseArticlesByCategoryParams {
  slug: string
  limit?: number
  page?: number
  excludeIds?: string[]
}

export function useArticlesByCategory(params: UseArticlesByCategoryParams) {
  const { slug, limit = 3, page = 1, excludeIds = [] } = params

  return useQuery<ArticlesResponse>({
    queryKey: ['public', 'articles', 'category', slug, { limit, page, excludeIds }],
    queryFn: async () => {
      const response = await fetchCategoryArticles(slug, { limit, page, excludeIds })
      return adaptArticlesResponse(response)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook baru untuk category sections di homepage
interface UseCategoryArticlesParams {
  slug: string
  limit?: number
  page?: number
  excludeIds?: string[]
  enabled?: boolean
}

export function useCategoryArticles(params: UseCategoryArticlesParams) {
  const { slug, limit = 3, page = 1, excludeIds = [], enabled = true } = params
  return useQuery<ArticlesResponse>({
    queryKey: ['public', 'articles', 'category', slug, { limit, page, excludeIds }],
    queryFn: async () => {
      const response = await fetchCategoryArticles(slug, { limit, page, excludeIds })
      return adaptArticlesResponse(response)
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  })
}
