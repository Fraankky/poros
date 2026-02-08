import { Link } from '@tanstack/react-router'
import type { Category } from '../../../hooks/use-public-categories'

interface CategoryBadgeProps {
  category: Pick<Category, 'name' | 'slug'>
  size?: 'sm' | 'md'
}

const categoryColors: Record<string, string> = {
  'berita-jogja': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'berita-kampus': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'berita-nasional': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'resensi': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'opini': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'komik': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'riset': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'sastra': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const colorClass = categoryColors[category.slug] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
  const sizeClass = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : 'text-sm px-3 py-1'

  return (
    <Link
      to="/kategori/$slug"
      params={{ slug: category.slug }}
      className={`inline-block font-sans font-semibold uppercase tracking-wide rounded-full hover:opacity-80 transition-opacity ${colorClass} ${sizeClass}`}
    >
      {category.name}
    </Link>
  )
}
