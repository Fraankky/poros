import { useState, useEffect, useRef } from 'react'
import { Search, X, Command } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { usePublicSearch } from '../../../hooks/use-public-articles'
import { CategoryBadge } from './category-badge'
import { ArticleImage } from '../article/article-image'
import { formatDateShort } from '../../../lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { data, isLoading } = usePublicSearch(query, 1, 5)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          // This should be handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const articles = data?.articles || []
  const hasResults = articles.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel..."
            className="flex-1 bg-transparent text-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-sans font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded">
              <Command className="w-3 h-3" />
              <span>K</span>
            </kbd>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && query.length > 0 && (
            <div className="p-8 text-center text-neutral-500">
              Mencari...
            </div>
          )}

          {!isLoading && query.length > 0 && !hasResults && (
            <div className="p-8 text-center">
              <p className="text-neutral-500">
                Tidak ada artikel ditemukan untuk &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                Coba kata kunci lain
              </p>
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to="/artikel/$slug"
                  params={{ slug: article.slug }}
                  onClick={onClose}
                  className="flex gap-4 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Use thumbnail for search results (small display) */}
                  <div className="w-20 h-14 flex-shrink-0 rounded-md overflow-hidden">
                    <ArticleImage
                      src={article.thumbnailUrl || article.coverImageUrl}
                      alt={article.title}
                      className="w-full h-full"
                      aspectRatio="20/14"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CategoryBadge category={article.category} size="sm" />
                    <h4 className="mt-1 font-sans font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {article.title}
                    </h4>
                    <p className="text-sm text-neutral-500">
                      {formatDateShort(article.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
              
              {/* View all results */}
              <Link
                to="/search"
                search={{ q: query }}
                onClick={onClose}
                className="block px-4 py-3 text-center text-poros-600 dark:text-poros-400 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                Lihat semua hasil →
              </Link>
            </div>
          )}

          {query.length === 0 && (
            <div className="p-8 text-center text-neutral-400">
              <p>Ketik untuk mencari artikel</p>
              <p className="text-sm mt-1">atau tekan ESC untuk menutup</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
