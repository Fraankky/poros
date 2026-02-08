import { createFileRoute, useParams } from '@tanstack/react-router'
import { usePublicArticle } from '../../../hooks/use-public-articles'
import { ReadingProgress } from '../../../components/public/ui/reading-progress'
import { MarkdownRenderer } from '../../../components/public/article/markdown-renderer'
import { RelatedArticles } from '../../../components/public/article/related-articles'
import { CategoryBadge } from '../../../components/public/ui/category-badge'
import { ArticleImage } from '../../../components/public/article/article-image'
import { formatDate, calculateReadTime, formatNumber } from '../../../lib/utils'

export const Route = createFileRoute('/_public/artikel/$slug')({
  component: ArticlePage,
})

function ArticlePage() {
  const { slug } = useParams({ from: '/_public/artikel/$slug' })
  const { data, isLoading } = usePublicArticle(slug)
  
  const article = data?.article

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-32" />
            <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
            <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-lg mt-8" />
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Artikel Tidak Ditemukan
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Maaf, artikel yang Anda cari tidak tersedia.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-8">
          <CategoryBadge category={article.category} />
          
          <h1 className="mt-4 font-sans font-extrabold text-[28px] md:text-[40px] leading-[1.15] tracking-[-0.025em] text-neutral-900 dark:text-white">
            {article.title}
          </h1>
          
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-neutral-600 dark:text-neutral-400">
            <span className="font-medium text-neutral-900 dark:text-neutral-200">
              {article.author}
            </span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{calculateReadTime(article.content)}</span>
            <span>•</span>
            <span>{formatNumber(article.viewCount)} views</span>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImageUrl && (
          <div className="mb-12 rounded-lg overflow-hidden">
            <ArticleImage
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full"
              priority
              aspectRatio="16/9"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="font-serif text-[18px] md:text-[20px] leading-[1.75] tracking-[-0.003em] text-neutral-800 dark:text-neutral-200">
          <MarkdownRenderer content={article.content} />
        </div>
      </article>

      {/* Related Articles */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedArticles 
          slug={slug} 
          categoryName={article.category.name} 
        />
      </div>
    </div>
  )
}
