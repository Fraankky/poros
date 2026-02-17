import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Article } from '../../../hooks/use-public-articles'

interface CategorySectionVariedProps {
  categoryName: string
  categorySlug: string
  articles: Article[]
  totalCount?: number
  variant?: 'three-col' | 'two-col-featured' | 'two-col' | 'mixed'
}

// Variant 1: Standard 3 columns (for Berita Nasional)
function ThreeColLayout({ 
  articles, 
  categoryName, 
  categorySlug, 
  totalCount 
}: { 
  articles: Article[]
  categoryName: string
  categorySlug: string
  totalCount?: number
}) {
  const hasMore = totalCount ? totalCount > articles.length : articles.length >= 3

  return (
    <div className="py-8 md:py-12">
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

      {/* 3 Columns Grid */}
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

// Variant 2: 2 columns - 1 featured (left) + 5 horizontal (right, stacked)
// Layout: Featured card on left, 5 horizontal cards stacked on right
function TwoColFeaturedLayout({ 
  articles, 
  categoryName, 
  categorySlug, 
  totalCount 
}: { 
  articles: Article[]
  categoryName: string
  categorySlug: string
  totalCount?: number
}) {
  const hasMore = totalCount ? totalCount > articles.length : articles.length >= 6

  return (
    <div className="py-8 md:py-12">
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

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Featured card (full height) */}
          <div>
            <FeaturedCard article={articles[0]} />
          </div>
          
          {/* Right Column: 5 horizontal cards stacked */}
          <div className="flex flex-col gap-3">
            {articles.slice(1, 6).map((article) => (
              <HorizontalCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

// Variant 3: 2x2 grid for Resensi - 4 rectangular cards with smaller height
function TwoColLayout({ 
  articles, 
  categoryName, 
  categorySlug, 
  totalCount 
}: { 
  articles: Article[]
  categoryName: string
  categorySlug: string
  totalCount?: number
}) {
  const hasMore = totalCount ? totalCount > articles.length : articles.length >= 4

  return (
    <div className="py-8 md:py-12">
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

      {/* 2x2 Grid - 4 rectangular cards */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {articles.slice(0, 4).map((article) => (
            <RectangularCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

// Variant 4: Mixed layout - 1 large left (2/3), 2 compact right (1/3) - equal height
function MixedLayout({ 
  articles, 
  categoryName, 
  categorySlug, 
  totalCount 
}: { 
  articles: Article[]
  categoryName: string
  categorySlug: string
  totalCount?: number
}) {
  const hasMore = totalCount ? totalCount > articles.length : articles.length >= 3

  return (
    <div className="py-8 md:py-12">
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

      {/* Mixed: 1 large left (2/3), 2 compact right (1/3) - equal total height */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Large card - takes 2 columns */}
          <div className="lg:col-span-2">
            <LargeCard article={articles[0]} />
          </div>
          {/* Stacked cards - takes 1 column, 2 cards with adjusted height to match large card */}
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

// Card Components
function CompactCard({ article }: { article: Article }) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group block"
    >
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <span className="text-neutral-400">No Image</span>
          </div>
        )}
      </div>
      <span className="mb-2 inline-block text-xs font-medium uppercase tracking-wider text-poros-600">
        {article.category.name}
      </span>
      <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-poros-600 dark:text-white">
        {article.title}
      </h3>
      <p className="text-sm text-neutral-500">
        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}
      </p>
    </Link>
  )
}

// Tall compact card for Riset layout (2 cards stacked to match LargeCard height)
function CompactCardTall({ article }: { article: Article }) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group relative block h-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
    >
      <div className="absolute inset-0">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <span className="text-neutral-400">No Image</span>
          </div>
        )}
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="mb-1 inline-block text-[10px] font-medium uppercase tracking-wider text-poros-300">
          {article.category.name}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
          {article.title}
        </h3>
      </div>
    </Link>
  )
}

// Rectangular card for Resensi 2x2 layout - shorter height (16/9 aspect)
function RectangularCard({ article }: { article: Article }) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group block"
    >
      {/* Image with 16/9 aspect ratio (rectangular, not square) */}
      <div className="relative mb-2 aspect-[16/9] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <span className="text-xs text-neutral-400">No Image</span>
          </div>
        )}
      </div>
      {/* Compact text content */}
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-poros-600 dark:text-white md:text-base">
        {article.title}
      </h3>
      <p className="mt-1 text-xs text-neutral-500">
        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}
      </p>
    </Link>
  )
}

function FeaturedCard({ article }: { article: Article }) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group relative block overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
    >
      <div className="aspect-[4/3] lg:aspect-[3/4] lg:min-h-[400px]">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <span className="text-neutral-400">No Image</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute left-4 top-4">
        <span className="inline-block bg-poros-600 px-2 py-1 text-xs font-medium uppercase tracking-wider text-white">
          {article.category.name}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <h3 className="mb-2 text-xl font-bold leading-snug text-white md:text-2xl line-clamp-3">
          {article.title}
        </h3>
        <p className="text-sm text-neutral-300">
          {new Date(article.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>
    </Link>
  )
}

function HorizontalCard({ article }: { article: Article }) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group flex gap-4"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 md:h-28 md:w-28">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <span className="text-xs text-neutral-400">No Image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center">
        <span className="mb-1 inline-block text-xs font-medium uppercase tracking-wider text-poros-600">
          {article.category.name}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-poros-600 dark:text-white md:text-base">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          {new Date(article.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>
    </Link>
  )
}

function LargeCard({ article }: { article: Article }) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group relative block overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
    >
      <div className="aspect-[16/9] min-h-[250px] md:min-h-[300px]">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <span className="text-neutral-400">No Image</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute left-4 top-4 md:left-6 md:top-6">
        <span className="inline-block bg-poros-600 px-2 py-1 text-xs font-medium uppercase tracking-wider text-white">
          {article.category.name}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <h3 className="mb-2 text-lg font-bold leading-snug text-white md:text-xl lg:text-2xl line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-neutral-300">
          {new Date(article.publishedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-neutral-500">Belum ada artikel dalam kategori ini.</p>
    </div>
  )
}

export function CategorySectionVaried({
  categoryName,
  categorySlug,
  articles,
  totalCount,
  variant = 'three-col'
}: CategorySectionVariedProps) {
  switch (variant) {
    case 'two-col-featured':
      return (
        <TwoColFeaturedLayout
          categoryName={categoryName}
          categorySlug={categorySlug}
          articles={articles}
          totalCount={totalCount}
        />
      )
    case 'two-col':
      return (
        <TwoColLayout
          categoryName={categoryName}
          categorySlug={categorySlug}
          articles={articles}
          totalCount={totalCount}
        />
      )
    case 'mixed':
      return (
        <MixedLayout
          categoryName={categoryName}
          categorySlug={categorySlug}
          articles={articles}
          totalCount={totalCount}
        />
      )
    case 'three-col':
    default:
      return (
        <ThreeColLayout
          categoryName={categoryName}
          categorySlug={categorySlug}
          articles={articles}
          totalCount={totalCount}
        />
      )
  }
}
