import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/articles')({
  component: ArticlesLayout,
})

function ArticlesLayout() {
  return <Outlet />
}
