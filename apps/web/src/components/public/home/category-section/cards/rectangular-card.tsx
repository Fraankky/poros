import { Link } from '@tanstack/react-router'
import { Article } from '../../../../../hooks/use-public-articles'

/** Rectangular card 16/9 — dipakai di TwoColLayout (Resensi 2×2 grid) */
export function RectangularCard({ article }: { article: Article }) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group block"
    >
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
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-poros-600 dark:text-white md:text-base">
        {article.title}
      </h3>
      <p className="mt-1 text-xs text-neutral-500">
        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    </Link>
  )
}
