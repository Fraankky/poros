// @ts-ignore - Vite env
const IS_STATIC = import.meta.env.VITE_DATA_SOURCE === 'static'
// @ts-ignore - Vite env
const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type ArticleSummary = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  thumbnailUrl: string | null
  author: string
  viewCount: number
  status: string
  publishedAt: string
  createdAt: string
  category: { id: string; name: string; slug: string }
}

type ArticleFull = ArticleSummary & {
  content: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ArticlesResponse {
  articles: ArticleSummary[]
  pagination: Pagination
}

// ── Hero / Homepage ───────────────────────────────────────────────────────────

export async function fetchHeroArticles(
  limit = 7
): Promise<ArticlesResponse> {
  if (IS_STATIC) {
    const res = await fetch('/data/articles.json')
    const { articles } = await res.json()
    const sliced = articles.slice(0, limit)
    return {
      articles: sliced,
      pagination: {
        page: 1,
        limit,
        total: sliced.length,
        totalPages: 1,
      },
    }
  }
  const res = await fetch(`${BASE_API}/api/public/articles?limit=${limit}&page=1`)
  if (!res.ok) throw new Error('Failed to fetch hero articles')
  return res.json()
}

// ── Category sections di homepage ────────────────────────────────────────────

export async function fetchCategoryArticles(
  slug: string,
  opts: { limit?: number; page?: number; excludeIds?: string[] } = {}
): Promise<ArticlesResponse> {
  const { limit = 3, page = 1, excludeIds = [] } = opts

  if (IS_STATIC) {
    const res = await fetch(`/data/categories/${slug}.json`)
    if (!res.ok)
      return {
        articles: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      }
    const { articles: all } = await res.json()
    const filtered = excludeIds.length
      ? all.filter((a: ArticleSummary) => !excludeIds.includes(a.id))
      : all
    const start = (page - 1) * limit
    return {
      articles: filtered.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    }
  }
  const qp = new URLSearchParams({ limit: String(limit), page: String(page) })
  if (excludeIds.length) qp.append('exclude', excludeIds.join(','))
  const res = await fetch(
    `${BASE_API}/api/public/categories/${slug}/articles?${qp}`
  )
  if (!res.ok) throw new Error(`Failed to fetch articles for ${slug}`)
  return res.json()
}

// ── Article listing (category page) ─────────────────────────────────────────

export async function fetchArticlesByCategory(
  slug: string,
  opts: { limit?: number; page?: number } = {}
): Promise<ArticlesResponse> {
  const { limit = 12, page = 1 } = opts

  if (IS_STATIC) {
    const res = await fetch(`/data/categories/${slug}.json`)
    if (!res.ok)
      return {
        articles: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      }
    const { articles: all } = await res.json()
    const start = (page - 1) * limit
    return {
      articles: all.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total: all.length,
        totalPages: Math.ceil(all.length / limit),
      },
    }
  }
  const qp = new URLSearchParams({ limit: String(limit), page: String(page) })
  const res = await fetch(
    `${BASE_API}/api/public/articles?category=${slug}&${qp}`
  )
  if (!res.ok) throw new Error('Failed to fetch articles')
  return res.json()
}

// ── Article detail ────────────────────────────────────────────────────────────

export async function fetchArticleDetail(slug: string): Promise<{
  article: ArticleFull
  related: ArticleSummary[]
}> {
  if (IS_STATIC) {
    const res = await fetch(`/data/articles/${slug}.json`)
    if (!res.ok) throw new Error('Article not found')
    return res.json() // { article, related }
  }
  const [articleRes, relatedRes] = await Promise.all([
    fetch(`${BASE_API}/api/public/articles/${slug}`),
    fetch(`${BASE_API}/api/public/articles/${slug}/related`),
  ])
  if (!articleRes.ok) throw new Error('Article not found')
  const { article } = await articleRes.json()
  const { articles: related } = await relatedRes.json()
  return { article, related }
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function fetchSearch(query: string, page = 1, limit = 12) {
  if (IS_STATIC) {
    const res = await fetch('/data/articles.json')
    const { articles } = await res.json()
    const q = query.toLowerCase().trim()
    const filtered = articles.filter(
      (a: ArticleSummary) =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt?.toLowerCase().includes(q) ?? false)
    )
    // NOTE: search hanya pada title + excerpt (content tidak ada di articles.json)
    const start = (page - 1) * limit
    return {
      articles: filtered.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
      query,
    }
  }
  const res = await fetch(
    `${BASE_API}/api/public/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  )
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}
