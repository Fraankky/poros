import { ArticleCard } from './article-card'
import type { Article } from '../../../hooks/use-public-articles'

interface ArticleGridProps {
  articles: Article[]
  columns?: 2 | 3 | 4
}

export function ArticleGrid({ articles, columns = 3 }: ArticleGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 md:gap-8`}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
