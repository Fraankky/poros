import { Router } from 'express'
import { requireAuth } from './auth.js'
import { prisma } from '../lib/db.js'

const router = Router()

// Get all categories
router.get('/', requireAuth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { articles: true } }
      }
    })

    res.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Get single category
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { articles: true } }
      }
    })

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ error: 'Failed to fetch category' })
  }
})

// Create category
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' })
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] }
    })
    if (existing) {
      return res.status(409).json({ error: 'Category with this name already exists' })
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null
      }
    })

    res.status(201).json({ success: true, category })
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// Update category
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' })
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    // Check for duplicate name/slug (excluding current)
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug }],
        NOT: { id: req.params.id }
      }
    })
    if (existing) {
      return res.status(409).json({ error: 'Category with this name already exists' })
    }

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null
      }
    })

    res.json({ success: true, category })
  } catch (error) {
    console.error('Error updating category:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// Delete category
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { force } = req.query
    const categoryId = req.params.id

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const articleCount = await prisma.article.count({
      where: { categoryId }
    })

    if (articleCount > 0 && force !== 'true') {
      return res.status(400).json({
        error: `Cannot delete category: ${articleCount} article(s) still use this category`,
        articleCount,
        canForceDelete: true
      })
    }

    // If force delete, move articles to "Uncategorized" category
    if (force === 'true' && articleCount > 0) {
      // Find or create "Uncategorized" category
      let uncategorized = await prisma.category.findUnique({
        where: { slug: 'uncategorized' }
      })

      if (!uncategorized) {
        uncategorized = await prisma.category.create({
          data: {
            name: 'Uncategorized',
            slug: 'uncategorized',
            description: 'Articles without a category'
          }
        })
      }

      // Move articles to uncategorized
      await prisma.article.updateMany({
        where: { categoryId },
        data: { categoryId: uncategorized.id }
      })
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    res.json({ success: true, articlesMoved: force === 'true' ? articleCount : 0 })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router
