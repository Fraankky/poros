import { Router } from 'express'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'
import { requireAuth } from './auth.js'
import { optimizeImage, validateImage } from '../lib/image.js'

const router = Router()
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

const BUCKET = process.env.R2_BUCKET_NAME
const PUBLIC_URL = process.env.R2_PUBLIC_URL

// Validate R2_PUBLIC_URL format
if (!PUBLIC_URL) {
  console.error('❌ ERROR: R2_PUBLIC_URL is not set in environment variables')
  console.error('Please set it to your r2.dev URL (e.g., https://bucket-name.xxxxxxxx.r2.dev)')
}
if (PUBLIC_URL && PUBLIC_URL.includes('r2.cloudflarestorage.com')) {
  console.warn('⚠️  WARNING: R2_PUBLIC_URL appears to be using S3 API endpoint')
  console.warn('Images will NOT load publicly. Please use r2.dev URL instead.')
  console.warn('See R2_SETUP_GUIDE.md for instructions.')
}

// Upload image with optimization
router.post('/image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Validate
    const validation = validateImage(req.file)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }

    // Optimize image
    const { cover, thumbnail, coverKey, thumbKey } = await optimizeImage(
      req.file.buffer,
      req.file.originalname
    )

    // Upload both versions to R2 (parallel)
    await Promise.all([
      R2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: coverKey,
        Body: cover,
        ContentType: 'image/webp'
      })),
      R2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: thumbKey,
        Body: thumbnail,
        ContentType: 'image/webp'
      }))
    ])

    const coverUrl = `${PUBLIC_URL}/${coverKey}`
    const thumbnailUrl = `${PUBLIC_URL}/${thumbKey}`

    res.json({
      success: true,
      coverUrl,
      thumbnailUrl,
      coverKey,
      thumbKey
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

export default router
