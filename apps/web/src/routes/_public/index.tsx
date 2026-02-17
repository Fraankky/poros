import { createFileRoute } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { useHeroArticles, type Article } from '../../hooks/use-public-articles'
import { usePublicCategories, type Category } from '../../hooks/use-public-categories'
import { HeroSection, HeroSkeleton } from '../../components/public/home'
import { CategorySectionVaried, CategorySectionSkeleton } from '../../components/public/home'

// @ts-ignore - Vite env
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001'

interface CategoryArticlesResponse {
  articles: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Category configuration with specific order, layout variants, and article limits
const CATEGORY_CONFIG: { 
  slug: string; 
  variant: 'three-col' | 'two-col-featured' | 'two-col' | 'mixed';
  limit: number;
}[] = [
  { slug: 'berita-nasional', variant: 'three-col', limit: 3 },      // 3 cards
  { slug: 'opini', variant: 'two-col-featured', limit: 6 },         // 6 cards (1 featured + 5 horizontal)
  { slug: 'resensi', variant: 'two-col', limit: 4 },                // 4 cards (2x2 grid)
  { slug: 'riset', variant: 'mixed', limit: 4 },                    // 3 cards (1 large + 2 compact)
  { slug: 'sastra', variant: 'three-col', limit: 3 },               // 3 cards
]

export const Route = createFileRoute('/_public/')({
  component: HomePage,
})

function HomePage() {
  // Fetch hero articles (featured + 2 side articles)
  const { data: heroData, isLoading: isLoadingHero } = useHeroArticles()
  
  // Fetch categories
  const { data: categoriesData } = usePublicCategories()
  
  const featured = heroData?.featured
  const sideArticles = heroData?.sideArticles || []
  const allCategories = categoriesData?.categories || []
  
  // Get IDs to exclude (featured + side articles)
  const excludeIds: string[] = [
    ...(featured ? [featured.id] : []),
    ...sideArticles.map((a: Article) => a.id)
  ].filter((id): id is string => Boolean(id))
  
  // Filter categories based on config order
  const categoriesToShow = CATEGORY_CONFIG.map(config => 
    allCategories.find(cat => cat.slug === config.slug)
  ).filter((cat): cat is Category => Boolean(cat))
  
  // Fetch articles for each configured category with specific limits
  const categoryQueries = useQueries({
    queries: categoriesToShow.map((cat) => {
      const config = CATEGORY_CONFIG.find(c => c.slug === cat.slug)
      const limit = config?.limit || 3
      
      return {
        queryKey: ['public', 'articles', 'category', cat.slug, { limit, excludeIds }],
        queryFn: async (): Promise<CategoryArticlesResponse> => {
          const queryParams = new URLSearchParams({
            limit: limit.toString(),
            page: '1'
          })
          if (excludeIds.length > 0) {
            queryParams.append('exclude', excludeIds.join(','))
          }
          const res = await fetch(
            `${API_URL}/api/public/categories/${cat.slug}/articles?${queryParams}`
          )
          if (!res.ok) throw new Error('Failed to fetch category articles')
          return res.json()
        },
        enabled: !isLoadingHero && excludeIds.length > 0,
        staleTime: 5 * 60 * 1000 // 5 minutes
      }
    })
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingHero ? (
          <HeroSkeleton />
        ) : featured ? (
          <HeroSection 
            featured={featured} 
            sideArticles={sideArticles} 
          />
        ) : null}
      </section>

      {/* Category Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categoriesToShow.map((cat: Category, index: number) => {
          const query = categoryQueries[index]
          const isLoading = query?.isLoading || !query?.data
          const config = CATEGORY_CONFIG.find(c => c.slug === cat.slug)
          
          return (
            <div 
              key={cat.id}
              className={index > 0 ? 'border-t border-neutral-200 dark:border-neutral-800' : ''}
            >
              {isLoading ? (
                <CategorySectionSkeleton />
              ) : (
                <CategorySectionVaried
                  categoryName={cat.name}
                  categorySlug={cat.slug}
                  articles={query.data?.articles || []}
                  totalCount={query.data?.pagination?.total}
                  variant={config?.variant || 'three-col'}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
