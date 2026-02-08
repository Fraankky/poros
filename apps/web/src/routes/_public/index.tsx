import { createFileRoute, Link } from '@tanstack/react-router'
import { usePublicFeatured } from '../../hooks/use-public-articles'
import { usePublicCategories } from '../../hooks/use-public-categories'
import { HeroArticle } from '../../components/public/article/hero-article'
import { ArticleGrid } from '../../components/public/article/article-grid'
import { CategoryBadge } from '../../components/public/ui/category-badge'
import { ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/_public/')({
  component: HomePage,
})

function HomePage() {
  const { data: featuredData, isLoading: isLoadingFeatured } = usePublicFeatured()
  const { data: categoriesData } = usePublicCategories()

  const hero = featuredData?.hero
  const grid = featuredData?.grid || []
  const categories = categoriesData?.categories || []

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingFeatured ? (
          <div className="animate-pulse">
            <div className="aspect-[21/9] bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          </div>
        ) : hero ? (
          <HeroArticle article={hero} />
        ) : null}
      </section>

      {/* Latest Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-sans font-bold text-2xl text-neutral-900 dark:text-white">
            Artikel Terbaru
          </h2>
          <Link 
            to="/kategori/$slug"
            params={{ slug: 'berita-jogja' }}
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-poros-600 dark:text-poros-400 hover:underline"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                <div className="mt-3 h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                <div className="mt-2 h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <ArticleGrid articles={grid} columns={3} />
        )}
      </section>

      {/* Categories Section */}
      <section className="bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-sans font-bold text-xl text-neutral-900 dark:text-white mb-6">
            Jelajahi Kategori
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to="/kategori/$slug"
                params={{ slug: cat.slug }}
                className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-poros-300 dark:hover:border-poros-700 transition-colors"
              >
                <CategoryBadge category={cat} size="sm" />
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {cat.articleCount} artikel
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-sans font-bold text-3xl text-neutral-900 dark:text-white mb-4">
            Temukan Lebih Banyak
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Jelajahi berbagai artikel menarik dari berbagai kategori yang kami sajikan untuk Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.slice(0, 4).map(cat => (
              <Link
                key={cat.id}
                to="/kategori/$slug"
                params={{ slug: cat.slug }}
                className="px-6 py-3 bg-poros-600 hover:bg-poros-700 text-white font-medium rounded-lg transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
