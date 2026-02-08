import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/api'
import type { CategoriesResponse } from '@/types'

// Hardcoded categories for public navbar - these don't change often
export const HARDCODED_CATEGORIES = {
  berita: [
    { name: 'Berita Jogja', slug: 'berita-jogja' },
    { name: 'Berita Kampus', slug: 'berita-kampus' },
    { name: 'Berita Nasional', slug: 'berita-nasional' },
  ],
  others: [
    { name: 'Resensi', slug: 'resensi' },
    { name: 'Opini', slug: 'opini' },
    { name: 'Komik', slug: 'komik' },
    { name: 'Riset', slug: 'riset' },
    { name: 'Sastra', slug: 'sastra' },
  ],
}

// Query keys
const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  details: () => [...categoriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoriesKeys.details(), id] as const,
}

// Query hooks
export function useCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: categoriesKeys.lists(),
    queryFn: getCategories,
  })
}

// Mutation hooks
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() })
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string } }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() })
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, force = false }: { id: string; force?: boolean }) => deleteCategory(id, force),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      if (data.articlesMoved && data.articlesMoved > 0) {
        alert(`${data.articlesMoved} article(s) moved to "Uncategorized".`)
      }
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })
}
