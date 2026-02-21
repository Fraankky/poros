import { useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Article } from '../../../hooks/use-public-articles'
import { formatDateShort, calculateReadTime } from '../../../lib/utils'

interface HeroFeaturedCardProps {
  articles: Article[]
  priority?: boolean
}

export function HeroFeaturedCard({ articles, priority = false }: HeroFeaturedCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
  }, [articles.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
  }, [articles.length])

  useEffect(() => {
    if (isPaused || articles.length <= 1) return
    const interval = setInterval(goToNext, 2000)
    return () => clearInterval(interval)
  }, [isPaused, goToNext, articles.length])

  if (articles.length === 0) return null

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 h-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-full min-h-[400px]">
        {articles.map((article, i) => (
          <Link
            key={article.id}
            to="/artikel/$slug"
            params={{ slug: article.slug }}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Image */}
            {article.coverImageUrl ? (
              <img
                src={article.coverImageUrl}
                alt={article.title}
                loading={priority && i === 0 ? 'eager' : 'lazy'}
                crossOrigin="anonymous"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
                <span className="text-neutral-400">No Image</span>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Category Badge */}
            <div className="absolute left-4 top-4 md:left-6 md:top-6">
              <span className="inline-block bg-poros-600 px-2 py-1 text-xs font-medium uppercase tracking-wider text-white">
                {article.category.name}
              </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-14 left-0 right-0 p-4 md:p-6">
              <h2 className="mb-3 text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl line-clamp-3">
                {article.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <span>{article.author}</span>
                <span className="text-neutral-500">|</span>
                <span>{formatDateShort(article.publishedAt)}</span>
                <span className="text-neutral-500">|</span>
                <span>{calculateReadTime(article.content)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Controls */}
      {articles.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
          {/* Dot Indicators */}
          <div className="flex gap-2">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex gap-2">
            <button
              onClick={goToPrev}
              aria-label="Slide sebelumnya"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors text-lg leading-none"
            >
              ‹
            </button>
            <button
              onClick={goToNext}
              aria-label="Slide berikutnya"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors text-lg leading-none"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
