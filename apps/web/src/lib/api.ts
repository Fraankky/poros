// API client for POROS
import type {
  ArticlesResponse,
  ArticleResponse,
  ArticleStats,
  CategoriesResponse,
  Category,
  CategoryWithCount,
  UploadResult,
  AuthResponse,
} from '@/types'

const API_URL = '/api'

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// Auth
export const login = (email: string, password: string): Promise<{ success: boolean; error?: string }> =>
  fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const logout = (): Promise<{ success: boolean }> =>
  fetchAPI('/auth/logout', { method: 'POST' })

export const getCurrentUser = (): Promise<AuthResponse> =>
  fetchAPI('/auth/me')

// Articles
export const getArticles = (params: Record<string, string> = {}): Promise<ArticlesResponse> => {
  const query = new URLSearchParams(params).toString()
  return fetchAPI(`/articles?${query}`)
}

export const getArticle = (id: string): Promise<ArticleResponse> =>
  fetchAPI(`/articles/${id}`)

export const getArticleStats = (): Promise<ArticleStats> =>
  fetchAPI('/articles/stats/summary')

export const updateArticleCategory = (id: string, categoryId: string): Promise<ArticleResponse> =>
  fetchAPI(`/articles/${id}/category`, {
    method: 'PATCH',
    body: JSON.stringify({ categoryId }),
  })

export const updateArticleCover = (id: string, coverImageUrl: string, thumbnailUrl?: string): Promise<ArticleResponse> =>
  fetchAPI(`/articles/${id}/cover`, {
    method: 'POST',
    body: JSON.stringify({ coverImageUrl, thumbnailUrl }),
  })

export const deleteArticleCover = (id: string): Promise<ArticleResponse> =>
  fetchAPI(`/articles/${id}/cover`, {
    method: 'DELETE',
  })

export const deleteArticle = (id: string): Promise<{ success: boolean }> =>
  fetchAPI(`/articles/${id}`, { method: 'DELETE' })

// Categories
export const getCategories = (): Promise<CategoriesResponse> =>
  fetchAPI('/categories')

export const getCategory = (id: string): Promise<{ category: CategoryWithCount }> =>
  fetchAPI(`/categories/${id}`)

export const createCategory = (data: { name: string; description?: string }): Promise<{ category: Category }> =>
  fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data) })

export const updateCategory = (id: string, data: { name: string; description?: string }): Promise<{ category: Category }> =>
  fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteCategory = (id: string, force = false): Promise<{ success: boolean; articlesUnassigned?: number }> =>
  fetchAPI(`/categories/${id}?force=${force}`, { method: 'DELETE' })

// Upload - returns cover and thumbnail URLs
export const uploadImage = async (file: File): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch('/api/upload/image', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  return res.json()
}
