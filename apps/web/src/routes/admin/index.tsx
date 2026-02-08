import { createFileRoute, Link } from '@tanstack/react-router'
import { useArticleStats } from '@/hooks/use-articles'

export const Route = createFileRoute('/admin/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { data: stats, isLoading } = useArticleStats()

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Articles</p>
          <p className="text-3xl font-bold">{stats?.total || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">With Cover</p>
          <p className="text-3xl font-bold text-green-600">{stats?.withCover || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Without Cover</p>
          <p className="text-3xl font-bold text-red-600">{stats?.withoutCover || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Cover Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all"
            style={{ width: `${stats?.coverPercentage || 0}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {stats?.coverPercentage || 0}% complete ({stats?.withCover || 0} / {stats?.total || 0})
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          to="/admin/articles"
          search={{ page: 1 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Manage Articles
        </Link>
      </div>
    </div>
  )
}
