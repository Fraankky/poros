import { Link } from '@tanstack/react-router'
import { Article } from '../../../../../hooks/use-public-articles'

/** Tall compact card — dipakai di MixedLayout (kolom kanan, 2 cards stacked) */
export function CompactCardTall({ article }: { article: Article }) {
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
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
