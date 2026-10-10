import sharp from 'sharp'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { join, extname } from 'path'
import { getPaths } from '../paths'

export const saveImage = async (buffer: Buffer, originalName: string) => {
  const { imagesDir, thumbsDir } = getPaths()

  // Ensure directories exist
  await fs.mkdir(imagesDir, { recursive: true })
  await fs.mkdir(thumbsDir, { recursive: true })

  // Create hash for file name
  const hash = createHash('sha256').update(buffer).digest('hex')
  const ext = extname(originalName).toLowerCase() || '.png'
  const fileName = `${hash}${ext}`
  const thumbName = `${hash}.webp`

  const destPath = join(imagesDir, fileName)
  const thumbPath = join(thumbsDir, thumbName)

  // Check if file already exists
  try {
    await fs.access(destPath)
    // If it exists, we just return the relative path (de-duplication)
    return `images/${fileName}`
  } catch {
    // Save original image
    await fs.writeFile(destPath, buffer)

    // Create and save thumbnail (max width 300px)
    await sharp(buffer)
      .resize({ width: 300, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumbPath)

    return `images/${fileName}`
  }
}
