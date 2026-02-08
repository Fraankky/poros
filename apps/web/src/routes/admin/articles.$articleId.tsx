import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useArticle, useUpdateArticleCategory, useUploadCover, useDeleteCover, useDeleteArticle } from '@/hooks/use-articles'
import { useCategories } from '@/hooks/use-categories'
import { CoverUpload } from '@/components/admin/cover-upload'
import { StatusBadge } from '@/components/admin/status-badge'
import { Trash2 } from 'lucide-react'

export const Route = createFileRoute('/admin/articles/$articleId')({
  component: ArticleEditPage,
})

function ArticleEditPage() {
  const { articleId } = Route.useParams()
  const navigate = useNavigate()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: articleData, isLoading } = useArticle(articleId)
  const { data: categoriesData } = useCategories()
  const uploadCover = useUploadCover(articleId)
  const deleteCover = useDeleteCover(articleId)
  const updateCategory = useUpdateArticleCategory(articleId)
  const deleteArticle = useDeleteArticle()

  const article = articleData?.article

  useEffect(() => {
    if (article?.categoryId) {
      setSelectedCategoryId(article.categoryId)
    }
  }, [article?.categoryId])

  const categoryChanged = selectedCategoryId !== (article?.categoryId || '')

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{article?.title || 'Edit Article'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Slug: {article?.slug}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 px-4 py-2 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => navigate({ to: '/admin/articles', search: { page: 1 } })}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 border rounded-lg"
          >
            ← Back to Articles
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Article Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Details Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Article Details</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2">
                  {article && <StatusBadge status={article.status} />}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="ml-2 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(categoriesData?.categories || []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-gray-500">Author:</span>
                <span className="ml-2">{article?.author}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2">
                  {article?.updatedAt
                    ? new Date(article.updatedAt).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
            </div>

            {article?.excerpt && (
              <div className="mt-4">
                <span className="text-gray-500 text-sm">Excerpt:</span>
                <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">
                  {article.excerpt}
                </p>
              </div>
            )}

            <div className="mt-4">
              <span className="text-gray-500 text-sm">Content Preview:</span>
              <div className="mt-1 text-gray-700 bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                <div dangerouslySetInnerHTML={{
                  __html: article?.content?.substring(0, 500) + '...' || 'No content'
                }} />
              </div>
            </div>

            {/* Category Save/Cancel Buttons */}
            {categoryChanged && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => updateCategory.mutate(selectedCategoryId)}
                  disabled={updateCategory.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                >
                  {updateCategory.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setSelectedCategoryId(article?.categoryId || '')}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Cover Image Management */}
        <div className="space-y-6">
          <CoverUpload
            currentImageUrl={article?.coverImageUrl || null}
            onUpload={(file) => uploadCover.mutate(file)}
            onDelete={() => deleteCover.mutate()}
            isUploading={uploadCover.isPending}
            isDeleting={deleteCover.isPending}
          />

          {/* Image Info Card */}
          {article?.coverImageUrl && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Current Cover</h3>
              <p className="text-xs text-blue-700 break-all">
                {article.coverImageUrl}
              </p>
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-900 mb-2">Danger Zone</h3>
            <p className="text-xs text-red-700 mb-3">
              Deleting this article is permanent and cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Article
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Article?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{article?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteArticle.mutate(articleId)}
                disabled={deleteArticle.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteArticle.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
