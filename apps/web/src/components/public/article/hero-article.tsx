import { Link } from '@tanstack/react-router'
import { CategoryBadge } from '../ui/category-badge'
import { ArticleImage } from './article-image'
import { formatDate, calculateReadTime } from '../../../lib/utils'
import type { Article } from '../../../hooks/use-public-articles'

interface HeroArticleProps {
  article: Article
}

export function HeroArticle({ article }: HeroArticleProps) {
  return (
    <article className="relative group">
      <Link 
        to="/artikel/$slug" 
        params={{ slug: article.slug }}
        className="block"
      >
        {/* Full-width cover with gradient overlay */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl">
          <ArticleImage
            src={article.coverImageUrl}
            alt={article.title}
            className="group-hover:scale-105 transition-transform duration-700"
            priority
            aspectRatio="21/9"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
            <div className="max-w-3xl">
              <CategoryBadge category={article.category} size="md" />
              
              <h1 className="mt-3 md:mt-4 font-sans font-extrabold text-white text-2xl md:text-4xl lg:text-5xl leading-tight">
                {article.title}
              </h1>
              
              {article.excerpt && (
                <p className="mt-3 md:mt-4 text-neutral-200 text-base md:text-lg line-clamp-2 max-w-2xl">
                  {article.excerpt}
                </p>
              )}
              
              <div className="mt-4 flex items-center gap-3 text-neutral-300 text-sm md:text-base">
                <span className="font-medium">{article.author}</span>
                <span>•</span>
                <span>{formatDate(article.publishedAt)}</span>
                <span>•</span>
                <span>{calculateReadTime(article.content)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
