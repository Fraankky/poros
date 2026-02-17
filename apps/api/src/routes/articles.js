import { Router } from 'express'
import { requireAuth } from './auth.js'
import { prisma } from '../lib/db.js'

const router = Router()

// Get all articles
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const filter = req.query.filter || 'all'
    const search = req.query.search || ''

    const where = {}
    if (filter === 'with-cover') where.coverImageUrl = { not: null }
    if (filter === 'without-cover') where.coverImageUrl = null
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
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
    console.error('Error fetching articles:', error)
    res.status(500).json({ error: 'Failed to fetch articles' })
  }
})

// Get single article
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }
    
    res.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    res.status(500).json({ error: 'Failed to fetch article' })
  }
})

// Get stats
router.get('/stats/summary', requireAuth, async (req, res) => {
  try {
    const [total, withCover, withoutCover] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { coverImageUrl: { not: null } } }),
      prisma.article.count({ where: { coverImageUrl: null } })
    ])

    res.json({
      total,
      withCover,
      withoutCover,
      coverPercentage: total > 0 ? Math.round((withCover / total) * 100) : 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Update article category
router.patch('/:id/category', requireAuth, async (req, res) => {
  try {
    const { categoryId } = req.body

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' })
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { categoryId, updatedAt: new Date() },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })

    res.json({ success: true, article })
  } catch (error) {
    console.error('Error updating article category:', error)
    res.status(500).json({ error: 'Failed to update article category' })
  }
})

// Update cover
router.post('/:id/cover', requireAuth, async (req, res) => {
  try {
    const { coverImageUrl, thumbnailUrl } = req.body
    
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { 
        coverImageUrl: coverImageUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        updatedAt: new Date()
      }
    })
    
    res.json({ success: true, article })
  } catch (error) {
    console.error('Error updating cover:', error)
    res.status(500).json({ error: 'Failed to update cover' })
  }
})

// Delete cover
router.delete('/:id/cover', requireAuth, async (req, res) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { 
        coverImageUrl: null,
        thumbnailUrl: null,
        updatedAt: new Date()
      }
    })
    
    res.json({ success: true, article })
  } catch (error) {
    console.error('Error deleting cover:', error)
    res.status(500).json({ error: 'Failed to delete cover' })
  }
})

// Toggle featured status for an article
router.patch('/:id/featured', requireAuth, async (req, res) => {
  try {
    const { isFeatured } = req.body

    if (typeof isFeatured !== 'boolean') {
      return res.status(400).json({ error: 'isFeatured must be a boolean' })
    }

    // If setting as featured, first un-feature all other articles
    if (isFeatured) {
      await prisma.article.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false }
      })
    }

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { isFeatured },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      }
    })

    res.json({ success: true, article })
  } catch (error) {
    console.error('Error toggling featured status:', error)
    res.status(500).json({ error: 'Failed to toggle featured status' })
  }
})

// Delete article
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.article.delete({
      where: { id: req.params.id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting article:', error)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Article not found' })
    }
    res.status(500).json({ error: 'Failed to delete article' })
  }
})

export default router
