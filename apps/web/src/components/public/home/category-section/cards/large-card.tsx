import { Link } from '@tanstack/react-router'
import { Article } from '../../../../../hooks/use-public-articles'

/** Large card 16/9 — dipakai di MixedLayout (kolom kiri 2/3, Riset) */
export function LargeCard({ article }: { article: Article }) {
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
            year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  )
}
