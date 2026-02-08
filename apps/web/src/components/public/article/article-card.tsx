import { Link } from '@tanstack/react-router'
import { CategoryBadge } from '../ui/category-badge'
import { ArticleImage } from './article-image'
import { formatDateShort } from '../../../lib/utils'
import type { Article } from '../../../hooks/use-public-articles'

interface ArticleCardProps {
  article: Article
  size?: 'sm' | 'md' | 'lg'
}

export function ArticleCard({ article, size = 'md' }: ArticleCardProps) {
  const isSmall = size === 'sm'
  const isLarge = size === 'lg'

  // Optimized image selection:
  // - Large cards: use coverImageUrl (full resolution)
  // - Small/Medium cards: use thumbnailUrl (bandwidth efficient)
  const imageUrl = isLarge
    ? (article.coverImageUrl || article.thumbnailUrl)
    : (article.thumbnailUrl || article.coverImageUrl)

  const aspectRatio = isLarge ? '16/9' : isSmall ? '4/3' : '16/10'

  return (
    <article className="group">
      <Link 
        to="/artikel/$slug" 
        params={{ slug: article.slug }}
        className="block"
      >
        {/* Cover Image */}
        <div className={`relative overflow-hidden rounded-lg ${
          isLarge ? 'aspect-[16/9]' : isSmall ? 'aspect-[4/3]' : 'aspect-[16/10]'
        }`}>
          <ArticleImage
            src={imageUrl}
            alt={article.title}
            className="group-hover:scale-105 transition-transform duration-500"
            aspectRatio={aspectRatio}
          />
        </div>

        {/* Content */}
        <div className={`${isSmall ? 'mt-2' : 'mt-3'}`}>
          <div className="mb-2">
            <CategoryBadge category={article.category} size={isSmall ? 'sm' : 'sm'} />
          </div>
          
          <h3 className={`font-sans font-bold text-neutral-900 dark:text-neutral-100 leading-tight group-hover:text-poros-600 dark:group-hover:text-poros-400 transition-colors ${
            isLarge ? 'text-xl' : isSmall ? 'text-sm' : 'text-lg'
          }`}>
            {article.title}
          </h3>
          
          {!isSmall && article.excerpt && (
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">
              {article.excerpt}
            </p>
          )}
          
          <div className={`mt-2 flex items-center gap-2 text-neutral-500 dark:text-neutral-500 ${
            isSmall ? 'text-xs' : 'text-sm'
          }`}>
            <span>{formatDateShort(article.publishedAt)}</span>
            <span>•</span>
            <span>{article.viewCount} views</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
