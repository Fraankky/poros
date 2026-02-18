import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Article } from '../../../../../hooks/use-public-articles'
import { LargeCard } from '../cards/large-card'
import { CompactCardTall } from '../cards/compact-card-tall'
import { EmptyState } from '../empty-state'

interface MixedLayoutProps {
  categoryName: string
  categorySlug: string
  articles: Article[]
  totalCount?: number
}

/** Layout mixed: 1 large kiri (2/3) + 2 compact kanan (1/3) — dipakai untuk Riset */
export function MixedLayout({ articles, categoryName, categorySlug, totalCount }: MixedLayoutProps) {
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LargeCard article={articles[0]} />
          </div>
          <div className="flex flex-col gap-4">
            {articles.slice(1, 3).map((article) => (
              <CompactCardTall key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
