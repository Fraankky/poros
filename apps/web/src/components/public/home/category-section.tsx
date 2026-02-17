import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Article } from '../../../hooks/use-public-articles'
import { ArticleCardCompact } from './article-card-compact'

interface CategorySectionProps {
  categoryName: string
  categorySlug: string
  articles: Article[]
  totalCount?: number
}

export function CategorySection({
  categoryName,
  categorySlug,
  articles,
  totalCount
}: CategorySectionProps) {
  const hasMore = totalCount ? totalCount > articles.length : articles.length >= 3

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            {categoryName}
          </h2>
          {hasMore && (
            <Link
              to="/kategori/$slug"
              params={{ slug: categorySlug }}
              className="flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors hover:text-poros-600 dark:text-neutral-300 dark:hover:text-poros-400"
            >
              more
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <ArticleCardCompact key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-neutral-500">Belum ada artikel dalam kategori ini.</p>
          </div>
        )}
      </div>
    </section>
  )
}
