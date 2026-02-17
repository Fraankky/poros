import { Link } from '@tanstack/react-router'
import { Article } from '../../../hooks/use-public-articles'
import { formatDateShort, calculateReadTime } from '../../../lib/utils'

interface HeroFeaturedCardProps {
  article: Article
  priority?: boolean
}

export function HeroFeaturedCard({ article, priority = false }: HeroFeaturedCardProps) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group relative block overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800"
    >
      {/* Image Container */}
      <div className="aspect-[4/3] min-h-[400px] md:min-h-[500px]">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
            <span className="text-neutral-400">No Image</span>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Category Badge */}
      <div className="absolute left-4 top-4 md:left-6 md:top-6">
        <span className="inline-block bg-poros-600 px-2 py-1 text-xs font-medium uppercase tracking-wider text-white">
          {article.category.name}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <h2 className="mb-3 text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl line-clamp-3">
          {article.title}
        </h2>
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <span>{article.author}</span>
          <span className="text-neutral-500">|</span>
          <span>{formatDateShort(article.publishedAt)}</span>
          <span className="text-neutral-500">|</span>
          <span>{calculateReadTime(article.content)}</span>
        </div>
      </div>
    </Link>
  )
}
