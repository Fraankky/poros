import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories'
import { CategoryForm } from '@/components/admin/category-form'
import type { CategoryWithCount } from '@/types'

export const Route = createFileRoute('/admin/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [forceDeleteCat, setForceDeleteCat] = useState<CategoryWithCount | null>(null)

  const { data, isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const categories = data?.categories || []

  const startEdit = (cat: CategoryWithCount) => {
    setEditingId(cat.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleCreate = (formData: { name: string; description?: string }) => {
    createMutation.mutate(formData, {
      onSuccess: () => setShowCreate(false),
    })
  }

  const handleUpdate = (formData: { name: string; description?: string }) => {
    if (!editingId) return
    updateMutation.mutate(
      { id: editingId, data: formData },
      { onSuccess: () => setEditingId(null) }
    )
  }

  const handleDelete = (cat: CategoryWithCount) => {
    if (cat._count.articles > 0) {
      // Show force delete confirmation
      setForceDeleteCat(cat)
      return
    }
    if (confirm(`Delete category "${cat.name}"?`)) {
      deleteMutation.mutate({ id: cat.id })
    }
  }

  const handleForceDelete = () => {
    if (!forceDeleteCat) return
    deleteMutation.mutate({ id: forceDeleteCat.id, force: true })
    setForceDeleteCat(null)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          {showCreate ? 'Cancel' : '+ New Category'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-sm text-gray-700 mb-3">New Category</h2>
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isPending={createMutation.isPending}
            submitLabel="Create"
          />
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Articles</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) =>
              editingId === cat.id ? (
                <tr key={cat.id} className="bg-blue-50">
                  <td className="px-4 py-3" colSpan={5}>
                    <CategoryForm
                      initial={{ name: cat.name, description: cat.description || '' }}
                      onSubmit={handleUpdate}
                      onCancel={cancelEdit}
                      isPending={updateMutation.isPending}
                      submitLabel="Save"
                    />
                  </td>
                </tr>
              ) : (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {cat.description || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                      {cat._count.articles}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">No categories found</div>
        )}
      </div>

      {/* Force Delete Confirmation Modal */}
      {forceDeleteCat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Force Delete Category?
            </h3>
            <p className="text-gray-600 mb-4">
              Category "{forceDeleteCat.name}" has {forceDeleteCat._count.articles} article(s). 
              These articles will be moved to "Uncategorized" category.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setForceDeleteCat(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleForceDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Force Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
