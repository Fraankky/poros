import type { Article } from '@/types'

interface StatusBadgeProps {
  status: Article['status']
}

const statusStyles: Record<Article['status'], string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-black-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded text-xs text-black ${statusStyles[status]}`}>
      {status}
    </span>
  )
}
