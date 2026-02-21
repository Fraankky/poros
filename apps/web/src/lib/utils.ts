export function calculateReadTime(content: string | undefined | null): string {
  if (!content) return '1 min read'
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-'
  try {
  const d = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
    return d.toLocaleDateString('id-ID', options)
  } catch {
    return '-'
  }
}

export function formatDateShort(date: string | Date | undefined | null): string {
  if (!date) return '-'
  try {
  const d = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }
    return d.toLocaleDateString('id-ID', options)
  } catch {
    return '-'
  }
}

export function formatNumber(num: number | undefined | null): string {
  if (num == null) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
