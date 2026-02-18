import { createFileRoute, Link, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUser, logout } from '@/lib/api'
import type { QueryClient } from '@tanstack/react-query'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
  beforeLoad: async ({ context, location }) => {
    // Admin tidak tersedia di static/Cloudflare Pages build
    // @ts-ignore - Vite env
    if (import.meta.env.VITE_DATA_SOURCE === 'static') {
      throw redirect({ to: '/' })
    }

    // Skip auth check if already on login page to prevent infinite loop
    if (location.pathname === '/admin/login') {
      return
    }

    // Check auth - will redirect to login if not authenticated
    try {
      await (context as RouterContext).queryClient.fetchQuery({
        queryKey: ['auth', 'me'],
        queryFn: getCurrentUser,
      })
    } catch {
      throw redirect({ to: '/admin/login' })
    }
  },
})

function AdminLayout() {
  const router = useRouter()
  const { data: userData } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
  })

  const handleLogout = async () => {
    await logout()
    router.invalidate()
    window.location.href = '/admin/login'
  }

  const user = userData?.user

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/admin" className="text-xl font-bold text-blue-600">
                POROS Admin
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link
                  to="/admin"
                  className="text-black-600 hover:text-black-900"
                  activeProps={{ className: 'text-blue-600 font-medium' }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/articles"
                  search={{ page: 1 }}
                  className="text-black-600 hover:text-black-900"
                  activeProps={{ className: 'text-blue-600 font-medium' }}
                >
                  Articles
                </Link>
                <Link
                  to="/admin/categories"
                  className="text-black-600 hover:text-black-900"
                  activeProps={{ className: 'text-blue-600 font-medium' }}
                >
                  Categories
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-black-600">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
