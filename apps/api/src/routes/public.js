import { Router } from 'express'
import { prisma } from '../lib/db.js'

const router = Router()

// Cookie name for view tracking
const VIEW_COOKIE_NAME = 'poros_viewed'
const VIEW_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

// Helper to get viewed articles from cookie
function getViewedArticles(req) {
  try {
    const cookie = req.cookies[VIEW_COOKIE_NAME]
    if (!cookie) return []
    return JSON.parse(cookie)
  } catch {
    return []
  }
}

// Helper to set viewed articles cookie
function setViewedArticles(res, slugs) {
  res.cookie(VIEW_COOKIE_NAME, JSON.stringify(slugs), {
    maxAge: VIEW_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax'
  })
}

// GET /api/public/articles - List articles with pagination, category filter, search
router.get('/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const categorySlug = req.query.category
    const search = req.query.search

    const where = {
      status: 'PUBLISHED'
    }

    if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } }
        }
      }),
      prisma.article.count({ where })
    ])

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching public articles:', error)
    res.status(500).json({ error: 'Failed to fetch articles' })
  }
})

// GET /api/public/articles/:slug - Get single article by slug (with view count)
router.get('/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    // Get article
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })

    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    // Only increment view count for published articles
    if (article.status === 'PUBLISHED') {
      const viewedSlugs = getViewedArticles(req)
      
      if (!viewedSlugs.includes(slug)) {
        // Increment view count
        await prisma.article.update({
          where: { id: article.id },
          data: { viewCount: { increment: 1 } }
        })
        
        // Update cookie
        viewedSlugs.push(slug)
        setViewedArticles(res, viewedSlugs)
        
        // Update article object to reflect new count
        article.viewCount += 1
      }
    }

    res.json({ article })
  } catch (error) {
    console.error('Error fetching public article:', error)
    res.status(500).json({ error: 'Failed to fetch article' })
  }
})

// GET /api/public/articles/:slug/related - Get related articles
router.get('/articles/:slug/related', async (req, res) => {
  try {
    const { slug } = req.params

    // Get the article to find its category
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { categoryId: true }
    })

    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    // Get related articles from same category (exclude current)
    const relatedArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: article.categoryId,
        slug: { not: slug }
      },
      take: 4,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })

    res.json({ articles: relatedArticles })
  } catch (error) {
    console.error('Error fetching related articles:', error)
    res.status(500).json({ error: 'Failed to fetch related articles' })
  }
})

// GET /api/public/categories - Get all categories with published article count
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    })

    // Transform _count to articleCount for cleaner response
    const transformedCategories = categories.map(cat => ({
      ...cat,
      articleCount: cat._count.articles,
      _count: undefined
    }))

    res.json({ categories: transformedCategories })
  } catch (error) {
    console.error('Error fetching public categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/public/featured - Get featured article + grid articles
router.get('/featured', async (req, res) => {
  try {
    // First try to get featured article
    let hero = await prisma.article.findFirst({
      where: {
        status: 'PUBLISHED',
        isFeatured: true
      },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })

    // Fallback: get latest published article if no featured
    if (!hero) {
      hero = await prisma.article.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } }
        }
      })
    }

    // Get 6 latest articles excluding hero
    const grid = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: hero?.id }
      },
      take: 6,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })

    res.json({ hero, grid })
  } catch (error) {
    console.error('Error fetching featured articles:', error)
    res.status(500).json({ error: 'Failed to fetch featured articles' })
  }
})

// GET /api/public/search - Search articles
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12

    if (!q || q.trim().length === 0) {
      return res.json({
        articles: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        query: ''
      })
    }

    const searchQuery = q.trim()

    const where = {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { excerpt: { contains: searchQuery, mode: 'insensitive' } },
        { content: { contains: searchQuery, mode: 'insensitive' } }
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } }
        }
      }),
      prisma.article.count({ where })
    ])

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      query: searchQuery
    })
  } catch (error) {
    console.error('Error searching articles:', error)
    res.status(500).json({ error: 'Failed to search articles' })
  }
})

// GET /api/public/hero - Get featured article + 2 side articles for hero section
router.get('/hero', async (req, res) => {
  try {
    // First try to get featured article
    let featured = await prisma.article.findFirst({
      where: {
        status: 'PUBLISHED',
        isFeatured: true
      },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })

    // Fallback: get latest published article if no featured
    if (!featured) {
      featured = await prisma.article.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } }
        }
      })
    }

    // Get 2 latest articles excluding featured for side articles
    const sideArticles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: featured?.id }
      },
      take: 2,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })

    res.json({ featured, sideArticles })
  } catch (error) {
    console.error('Error fetching hero articles:', error)
    res.status(500).json({ error: 'Failed to fetch hero articles' })
  }
})

// GET /api/public/categories/:slug/articles - Get articles by category
router.get('/categories/:slug/articles', async (req, res) => {
  try {
    const { slug } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const excludeParam = req.query.exclude

    // Parse exclude IDs from comma-separated string
    const excludeIds = excludeParam 
      ? excludeParam.split(',').filter(id => id.trim())
      : []

    const where = {
      status: 'PUBLISHED',
      category: { slug }
    }

    // Add exclude filter if there are IDs to exclude
    if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds }
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } }
        }
      }),
      prisma.article.count({ where })
    ])

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching category articles:', error)
    res.status(500).json({ error: 'Failed to fetch category articles' })
  }
})

export default router
