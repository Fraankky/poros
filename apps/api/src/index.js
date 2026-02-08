import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: '../../.env' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.API_PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Routes (will be imported dynamically)
const { default: authRoutes } = await import('./routes/auth.js')
const { default: articleRoutes } = await import('./routes/articles.js')
const { default: uploadRoutes } = await import('./routes/upload.js')
const { default: categoryRoutes } = await import('./routes/categories.js')
const { default: publicRoutes } = await import('./routes/public.js')

app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/public', publicRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
})
