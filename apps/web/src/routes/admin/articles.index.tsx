import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useArticles } from '@/hooks/use-articles'
import { Pagination } from '@/components/admin/pagination'
import { StatusBadge } from '@/components/admin/status-badge'

export const Route = createFileRoute('/admin/articles/')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
  }),
  component: ArticlesPage,
})

const LIMIT = 20

function ArticlesPage() {
  const { page } = Route.useSearch()
  const navigate = useNavigate()

  const { data, isLoading } = useArticles(page, LIMIT)

  const articles = data?.articles || []
  const pagination = data?.pagination

  const goToPage = (newPage: number) => {
    navigate({
      to: '/admin/articles',
      search: { page: newPage },
    })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Articles</h1>
        {pagination && (
          <span className="text-sm text-gray-500">
            Total: {pagination.total} articles
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-16">Cover</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Published</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {article.thumbnailUrl || article.coverImageUrl ? (
                    <img
                      src={article.thumbnailUrl || article.coverImageUrl!}
                      alt=""
                      className="w-14 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-14 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="line-clamp-2">{article.title}</span>
                </td>
                <td className="px-4 py-3 text-sm">{article.category?.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={article.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to="/admin/articles/$articleId"
                    params={{ articleId: article.id }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <div className="text-center py-8 text-gray-500">No articles found</div>
        )}
      </div>

      {pagination && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={LIMIT}
          onPageChange={goToPage}
        />
      )}
    </div>
  )
}
