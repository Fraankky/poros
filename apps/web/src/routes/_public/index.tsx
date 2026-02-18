import { createFileRoute } from '@tanstack/react-router'
import { useHeroCarouselArticles, type Article } from '../../hooks/use-public-articles'
import { useCategoryArticles } from '../../hooks/use-public-articles'
import { ALL_CATEGORIES } from '../../config/categories'
import { HeroSection, HeroSkeleton } from '../../components/public/home'
import { CategorySectionVaried, CategorySectionSkeleton } from '../../components/public/home'

// Category configuration with specific order, layout variants, and article limits
const CATEGORY_CONFIG: {
  slug: string
  variant: 'three-col' | 'two-col-featured' | 'two-col' | 'mixed'
  limit: number
}[] = [
  { slug: 'berita-nasional', variant: 'three-col', limit: 3 }, // 3 cards
  { slug: 'opini', variant: 'two-col-featured', limit: 6 }, // 6 cards (1 featured + 5 horizontal)
  { slug: 'resensi', variant: 'two-col', limit: 4 }, // 4 cards (2x2 grid)
  { slug: 'riset', variant: 'mixed', limit: 4 }, // 3 cards (1 large + 2 compact)
  { slug: 'sastra', variant: 'three-col', limit: 3 }, // 3 cards
]

export const Route = createFileRoute('/_public/')({
  component: HomePage,
})

function HomePage() {
  // Fetch 7 hero articles: first 5 for carousel, last 2 for side cards
  const { data: heroData, isLoading: isLoadingHero } = useHeroCarouselArticles(7)

  const allHeroArticles = heroData?.articles || []
  const carouselArticles = allHeroArticles.slice(0, 5)
  const sideArticles = allHeroArticles.slice(5, 7)

  // Exclude all 7 hero articles from category sections
  const excludeIds: string[] = allHeroArticles.map((a: Article) => a.id)

  // Build categories to show from config (no API call needed)
  const categoriesToShow = CATEGORY_CONFIG.map((config) => ({
    id: config.slug,
    slug: config.slug,
    name: ALL_CATEGORIES.find((c) => c.slug === config.slug)?.name ?? config.slug,
  }))

  // Fetch articles for each category using the new hook
  const beritaNasionalQ = useCategoryArticles({
    slug: 'berita-nasional',
    limit: 3,
    excludeIds,
    enabled: !isLoadingHero && excludeIds.length > 0,
  })
  const opiniQ = useCategoryArticles({
    slug: 'opini',
    limit: 6,
    excludeIds,
    enabled: !isLoadingHero && excludeIds.length > 0,
  })
  const resensiQ = useCategoryArticles({
    slug: 'resensi',
    limit: 4,
    excludeIds,
    enabled: !isLoadingHero && excludeIds.length > 0,
  })
  const risetQ = useCategoryArticles({
    slug: 'riset',
    limit: 4,
    excludeIds,
    enabled: !isLoadingHero && excludeIds.length > 0,
  })
  const sastraQ = useCategoryArticles({
    slug: 'sastra',
    limit: 3,
    excludeIds,
    enabled: !isLoadingHero && excludeIds.length > 0,
  })

  const categoryQueries = [beritaNasionalQ, opiniQ, resensiQ, risetQ, sastraQ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingHero ? (
          <HeroSkeleton />
        ) : carouselArticles.length > 0 ? (
          <HeroSection
            carouselArticles={carouselArticles}
            sideArticles={sideArticles}
          />
        ) : null}
      </section>

      {/* Category Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categoriesToShow.map((cat, index: number) => {
          const query = categoryQueries[index]
          const isLoading = query?.isLoading || !query?.data
          const config = CATEGORY_CONFIG.find((c) => c.slug === cat.slug)

          return (
            <div
              key={cat.id}
              className={
                index > 0 ? 'border-t border-neutral-200 dark:border-neutral-800' : ''
              }
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
