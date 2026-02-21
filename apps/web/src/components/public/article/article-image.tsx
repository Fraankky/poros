import { useState } from 'react'
import { ImageIcon, AlertCircle } from 'lucide-react'

interface ArticleImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  priority?: boolean    // true = eager load (for hero)
  aspectRatio?: string  // CSS aspect-ratio value
}

export function ArticleImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  aspectRatio
}: ArticleImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Detect if URL is using wrong R2 endpoint (S3 API instead of r2.dev)
  const isWrongEndpoint = src?.includes('r2.cloudflarestorage.com')

  // Show placeholder if no src or error loading
  if (!src || hasError) {
    return (
      <div 
        className={`bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <div className="flex flex-col items-center gap-2 text-neutral-400 dark:text-neutral-500">
          <ImageIcon className="w-8 h-8" />
          <span className="text-xs font-medium">POROS</span>
          {isWrongEndpoint && (
            <span className="text-[10px] text-amber-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Image config issue
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={aspectRatio ? { aspectRatio } : undefined}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 animate-pulse" />
      )}
      
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
       
        onError={() => {
          setHasError(true)
          setIsLoading(false)
          // Log error for debugging
          if (isWrongEndpoint) {
            console.error(`Image failed to load from S3 API endpoint: ${src}`)
            console.error('Please update R2_PUBLIC_URL to use r2.dev subdomain. See R2_SETUP_GUIDE.md')
          }
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
