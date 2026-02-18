import { Article } from '../../../hooks/use-public-articles'
import { HeroFeaturedCard } from './hero-featured-card'
import { HeroSideCard } from './hero-side-card'

interface HeroSectionProps {
  carouselArticles: Article[]
  sideArticles: Article[]
}

export function HeroSection({ carouselArticles, sideArticles }: HeroSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      {/* Carousel - Left Column (7/12) */}
      <div className="md:col-span-7 h-full">
        <HeroFeaturedCard articles={carouselArticles} priority />
      </div>

      {/* Side Articles - Right Column (5/12) */}
      <div className="flex flex-col gap-4 md:col-span-5">
        {sideArticles.slice(0, 2).map((article) => (
          <HeroSideCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
