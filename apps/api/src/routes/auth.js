import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/db.js'

const router = Router()

const SESSION_COOKIE = 'admin_session'
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

// Middleware to check auth
export const requireAuth = async (req, res, next) => {
  try {
    const cookie = req.cookies[SESSION_COOKIE]
    if (!cookie) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const session = JSON.parse(cookie)
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, isActive: true }
    })
    
    if (!user || !user.isActive) {
      res.clearCookie(SESSION_COOKIE)
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    req.user = session
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
    
    res.cookie(SESSION_COOKIE, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY
    })
    
    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE)
  res.json({ success: true })
})

// Get current user
router.get('/me', (req, res) => {
  try {
    const cookie = req.cookies[SESSION_COOKIE]
    if (!cookie) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    const user = JSON.parse(cookie)
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid session' })
  }
})

export default router
