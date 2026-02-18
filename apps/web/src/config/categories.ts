// Centralized category configuration
// These are static and don't change often, so no need to fetch from API

export const CATEGORIES = {
  berita: [
    { name: 'Berita Jogja', slug: 'berita-jogja' },
    { name: 'Berita Kampus', slug: 'berita-kampus' },
    { name: 'Berita Nasional', slug: 'berita-nasional' },
  ],
  others: [
    { name: 'Opini', slug: 'opini' },
    { name: 'Resensi', slug: 'resensi' },
    { name: 'Riset', slug: 'riset' },
    { name: 'Sastra', slug: 'sastra' },
    { name: 'Komik', slug: 'komik' },
  ],
} as const

export const ALL_CATEGORIES = [...CATEGORIES.berita, ...CATEGORIES.others]

export type CategorySlug = (typeof ALL_CATEGORIES)[number]['slug']

// Helper to get category name by slug
export function getCategoryName(slug: string): string {
  const cat = ALL_CATEGORIES.find((c) => c.slug === slug)
  return cat?.name ?? slug
}
