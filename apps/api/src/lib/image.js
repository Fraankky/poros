import sharp from 'sharp'

const MAX_COVER_WIDTH = 1200
const MAX_COVER_HEIGHT = 630
const MAX_THUMB_WIDTH = 400
const MAX_THUMB_HEIGHT = 210
const COVER_QUALITY = 80
const THUMB_QUALITY = 75

/**
 * Optimize image for cover and thumbnail
 * @param {Buffer} buffer - Raw image buffer
 * @param {string} filename - Original filename
 * @returns {Promise<{cover: Buffer, thumbnail: Buffer, coverKey: string, thumbKey: string}>}
 */
export async function optimizeImage(buffer, filename) {
  // Generate safe filename base
  const baseName = filename
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .substring(0, 50)
  const hash = Date.now().toString(36)
  const coverKey = `covers/${baseName}-${hash}.webp`
  const thumbKey = `thumbs/${baseName}-${hash}.webp`

  // Process cover version (1200x630, 16:9 ratio)
  const cover = await sharp(buffer)
    .resize(MAX_COVER_WIDTH, MAX_COVER_HEIGHT, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: COVER_QUALITY })
    .toBuffer()

  // Process thumbnail version (400x210, 16:9 ratio)
  const thumbnail = await sharp(buffer)
    .resize(MAX_THUMB_WIDTH, MAX_THUMB_HEIGHT, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: THUMB_QUALITY })
    .toBuffer()

  return { cover, thumbnail, coverKey, thumbKey }
}

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Max 10MB' }
  }

  return { valid: true }
}
