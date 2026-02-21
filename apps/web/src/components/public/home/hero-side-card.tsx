import { Link } from '@tanstack/react-router'
import { Article } from '../../../hooks/use-public-articles'
import { formatDateShort, calculateReadTime } from '../../../lib/utils'

interface HeroSideCardProps {
  article: Article
}

export function HeroSideCard({ article }: HeroSideCardProps) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group relative block overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
    >
      {/* Image Container */}
      <div className="aspect-[16/9] min-h-[180px] md:min-h-[240px]">
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

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Category Badge */}
      <div className="absolute left-3 top-3 md:left-4 md:top-4">
        <span className="inline-block bg-poros-600 px-2 py-1 text-xs font-medium uppercase tracking-wider text-white">
          {article.category.name}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
        <h3 className="mb-2 text-base font-semibold leading-snug text-white md:text-lg line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-neutral-300">
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
