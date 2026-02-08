import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
  articleCount: number
}

interface CategoriesResponse {
  categories: Category[]
}

// GET /api/public/categories
export function usePublicCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: ['public', 'categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/public/categories`)
      if (!res.ok) throw new Error('Failed to fetch categories')
      return res.json()
    }
  })
}
