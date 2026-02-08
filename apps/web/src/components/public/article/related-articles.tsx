import { Link } from '@tanstack/react-router'
import { useRelatedArticles } from '../../../hooks/use-public-articles'
import { CategoryBadge } from '../ui/category-badge'
import { ArticleImage } from './article-image'
import { formatDateShort } from '../../../lib/utils'

interface RelatedArticlesProps {
  slug: string
  categoryName: string
}

export function RelatedArticles({ slug, categoryName }: RelatedArticlesProps) {
  const { data, isLoading } = useRelatedArticles(slug)

  if (isLoading) {
    return (
      <div className="py-8">
        <h3 className="font-sans font-bold text-xl mb-4">Memuat artikel terkait...</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="mt-2 h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const articles = data?.articles || []

  if (articles.length === 0) return null

  return (
    <section className="py-8 border-t border-neutral-200 dark:border-neutral-800">
      <h3 className="font-sans font-bold text-xl mb-6 text-neutral-900 dark:text-neutral-100">
        Artikel Terkait dari {categoryName}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {articles.map((article) => (
          <article key={article.id} className="group">
            <Link 
              to="/artikel/$slug" 
              params={{ slug: article.slug }}
              className="block"
            >
              {/* Use thumbnail for related articles (small cards) */}
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <ArticleImage
                  src={article.thumbnailUrl || article.coverImageUrl}
                  alt={article.title}
                  className="group-hover:scale-105 transition-transform duration-500"
                  aspectRatio="16/9"
                />
              </div>
              
              <div className="mt-2">
                <CategoryBadge category={article.category} size="sm" />
                <h4 className="mt-1 font-sans font-semibold text-neutral-900 dark:text-neutral-100 text-sm line-clamp-2 group-hover:text-poros-600 dark:group-hover:text-poros-400 transition-colors">
                  {article.title}
                </h4>
                <p className="mt-1 text-neutral-500 dark:text-neutral-500 text-xs">
                  {formatDateShort(article.publishedAt)}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
