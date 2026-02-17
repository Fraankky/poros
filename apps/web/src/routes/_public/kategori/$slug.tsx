import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { usePublicArticles } from '../../../hooks/use-public-articles'
import { usePublicCategories } from '../../../hooks/use-public-categories'
import { ArticleGrid } from '../../../components/public/article/article-grid'
import { Pagination } from '../../../components/public/ui/pagination'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/kategori/$slug')({
  component: CategoryPage,
})

function CategoryPage() {
  const { slug } = useParams({ from: '/_public/kategori/$slug' })
  const search = useSearch({ from: '/_public/kategori/$slug' }) as { page?: number }
  const navigate = useNavigate()
  
  const currentPage = Number(search.page) || 1
  
  const { data: articlesData, isLoading } = usePublicArticles({
    category: slug,
    page: currentPage,
    limit: 12
  })
  
  const { data: categoriesData } = usePublicCategories()
  
  const category = categoriesData?.categories.find(c => c.slug === slug)
  const articles = articlesData?.articles || []
  const pagination = articlesData?.pagination

  const handlePageChange = (page: number) => {
    navigate({
      to: '/kategori/$slug',
      params: { slug },
      search: page > 1 ? { page } : {}
    })
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <section className="bg-indigo-700 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {category ? (
            <>
              <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-white dark:text-white tracking-tight">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-3 text-white-600 dark:text-white max-w-2xl">
                  {category.description}
                </p>
              )}
            </>
          ) : (
            <div className="animate-pulse">
              <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-64" />
              <div className="mt-3 h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-96" />
            </div>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                <div className="mt-3 h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                <div className="mt-2 h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <ArticleGrid articles={articles} columns={3} />
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  page={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
                <p className="text-center mt-4 text-sm text-neutral-500 dark:text-neutral-500">
                  Halaman {currentPage} dari {pagination.totalPages}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-neutral-500 dark:text-neutral-400">
              Belum ada artikel dalam kategori ini.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
