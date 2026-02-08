import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { usePublicSearch } from '../../hooks/use-public-articles'
import { ArticleGrid } from '../../components/public/article/article-grid'
import { Pagination } from '../../components/public/ui/pagination'

export const Route = createFileRoute('/_public/search')({
  component: SearchPage,
})

function SearchPage() {
  const searchParams = useSearch({ from: '/_public/search' })
  const navigate = useNavigate()
  
  const initialQuery = (searchParams.q as string) || ''
  const initialPage = Number(searchParams.page) || 1
  
  const [query, setQuery] = useState(initialQuery)
  const [inputValue, setInputValue] = useState(initialQuery)
  
  const { data, isLoading } = usePublicSearch(query, initialPage, 12)
  
  const articles = data?.articles || []
  const pagination = data?.pagination
  const hasSearched = query.length > 0

  // Update URL when query changes
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(inputValue)
    navigate({
      to: '/search',
      search: inputValue ? { q: inputValue } : {}
    })
  }

  const handlePageChange = (page: number) => {
    navigate({
      to: '/search',
      search: { q: query, ...(page > 1 && { page }) }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Update input when URL changes
  useEffect(() => {
    setInputValue(initialQuery)
    setQuery(initialQuery)
  }, [initialQuery])

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-neutral-900 dark:text-white mb-6">
            Cari Artikel
          </h1>
          
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik kata kunci..."
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-poros-500 dark:text-white"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('')
                  setQuery('')
                  navigate({ to: '/search' })
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        {hasSearched && (
          <div>
            {/* Results Count */}
            {!isLoading && (
              <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                {pagination?.total === 0 ? (
                  <>Tidak ada hasil untuk &ldquo;{query}&rdquo;</>
                ) : (
                  <>Menampilkan {pagination?.total} hasil untuk &ldquo;{query}&rdquo;</>
                )}
              </p>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[16/10] bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                    <div className="mt-3 h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                    <div className="mt-2 h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && articles.length === 0 && (
              <div className="text-center py-16">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Coba kata kunci yang berbeda atau periksa ejaan Anda.
                </p>
              </div>
            )}

            {/* Articles Grid */}
            {!isLoading && articles.length > 0 && (
              <>
                <ArticleGrid articles={articles} columns={3} />
                
                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      page={initialPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-16 text-neutral-400">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Ketik kata kunci untuk mencari artikel</p>
            <p className="text-sm mt-2">atau tekan Ctrl+K kapan saja</p>
          </div>
        )}
      </div>
    </div>
  )
}
