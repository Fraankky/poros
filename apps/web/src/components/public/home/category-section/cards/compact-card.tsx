import { Link } from '@tanstack/react-router'
import { Article } from '../../../../../hooks/use-public-articles'

export function CompactCard({ article }: { article: Article }) {
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
            crossOrigin="anonymous"
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
          year: 'numeric',
        })}
      </p>
    </Link>
  )
}
