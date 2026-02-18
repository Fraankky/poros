import { Article } from '../../../../hooks/use-public-articles'
import { ThreeColLayout } from './layouts/three-col'
import { TwoColFeaturedLayout } from './layouts/two-col-featured'
import { TwoColLayout } from './layouts/two-col'
import { MixedLayout } from './layouts/mixed'

export type CategorySectionVariant = 'three-col' | 'two-col-featured' | 'two-col' | 'mixed'

interface CategorySectionVariedProps {
  categoryName: string
  categorySlug: string
  articles: Article[]
  totalCount?: number
  variant?: CategorySectionVariant
}

export function CategorySectionVaried({
  categoryName,
  categorySlug,
  articles,
  totalCount,
  variant = 'three-col',
}: CategorySectionVariedProps) {
  const props = { categoryName, categorySlug, articles, totalCount }

  switch (variant) {
    case 'two-col-featured':
      return <TwoColFeaturedLayout {...props} />
    case 'two-col':
      return <TwoColLayout {...props} />
    case 'mixed':
      return <MixedLayout {...props} />
    case 'three-col':
    default:
      return <ThreeColLayout {...props} />
  }
}
