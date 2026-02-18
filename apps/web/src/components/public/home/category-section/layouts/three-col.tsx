import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Article } from '../../../../../hooks/use-public-articles'
import { CompactCard } from '../cards/compact-card'
import { EmptyState } from '../empty-state'

interface ThreeColLayoutProps {
  categoryName: string
  categorySlug: string
  articles: Article[]
  totalCount?: number
}

/** Layout 3 kolom — dipakai untuk Berita Nasional & Sastra */
export function ThreeColLayout({ articles, categoryName, categorySlug, totalCount }: ThreeColLayoutProps) {
  const hasMore = totalCount ? totalCount > articles.length : articles.length >= 3

  return (
    <div className="py-8 md:py-12">
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

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <CompactCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
