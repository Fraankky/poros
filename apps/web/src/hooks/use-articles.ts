import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  getArticles,
  getArticle,
  getArticleStats,
  updateArticleCategory,
  updateArticleCover,
  deleteArticleCover,
  deleteArticle,
  uploadImage,
} from '@/lib/api'
import type { ArticlesResponse, ArticleResponse, ArticleStats } from '@/types'

// Query keys
const articlesKeys = {
  all: ['articles'] as const,
  lists: () => [...articlesKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...articlesKeys.lists(), { page, limit }] as const,
  details: () => [...articlesKeys.all, 'detail'] as const,
  detail: (id: string) => [...articlesKeys.details(), id] as const,
  stats: () => [...articlesKeys.all, 'stats'] as const,
}

// Query hooks
export function useArticles(page: number, limit: number) {
  return useQuery<ArticlesResponse>({
    queryKey: articlesKeys.list(page, limit),
    queryFn: () => getArticles({ page: String(page), limit: String(limit) }),
  })
}

export function useArticle(id: string) {
  return useQuery<ArticleResponse>({
    queryKey: articlesKeys.detail(id),
    queryFn: () => getArticle(id),
    enabled: !!id,
  })
}

export function useArticleStats() {
  return useQuery<ArticleStats>({
    queryKey: articlesKeys.stats(),
    queryFn: getArticleStats,
  })
}

// Mutation hooks
export function useUpdateArticleCategory(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: string) => updateArticleCategory(articleId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) })
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
    },
    onError: (error: Error) => {
      alert('Failed to update category: ' + error.message)
    },
  })
}

export function useUploadCover(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const uploadResult = await uploadImage(file)
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }
      return updateArticleCover(
        articleId,
        uploadResult.coverUrl!,
        uploadResult.thumbnailUrl!
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) })
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articlesKeys.stats() })
    },
    onError: (error: Error) => {
      alert('Upload failed: ' + error.message)
    },
  })
}

export function useDeleteCover(articleId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteArticleCover(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) })
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articlesKeys.stats() })
    },
    onError: (error: Error) => {
      alert('Delete failed: ' + error.message)
    },
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articlesKeys.stats() })
      navigate({ to: '/admin/articles' })
    },
    onError: (error: Error) => {
      alert('Failed to delete article: ' + error.message)
    },
  })
}
