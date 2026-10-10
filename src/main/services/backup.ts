import { getPaths } from '../paths'
// @ts-ignore
import archiver from 'archiver'
import extract from 'extract-zip'
import fs from 'fs'
import { join } from 'path'
import { app } from 'electron'

export const exportBackup = async (
  destPath: string
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    try {
      const { dbPath, imagesDir } = getPaths()

      const output = fs.createWriteStream(destPath)
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      })

      output.on('close', () => {
        resolve({ success: true })
      })

      archive.on('error', (err) => {
        resolve({ success: false, error: err.message })
      })

      archive.pipe(output)

      // 1. Add manifest
      const manifest = {
        version: app.getVersion(),
        timestamp: new Date().toISOString(),
        type: 'trading_journal_v2_backup'
      }
      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })

      // 2. Add Database
      if (fs.existsSync(dbPath)) {
        archive.file(dbPath, { name: 'data.db' })
      }

      // 3. Add Images
      if (fs.existsSync(imagesDir)) {
        archive.directory(imagesDir, 'images')
      }

      archive.finalize()
    } catch (error: any) {
      resolve({ success: false, error: error.message })
    }
  })
}

export const importBackup = async (
  sourceZipPath: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { dbPath, imagesDir, backupsDir } = getPaths()

    // 1. Create a safe temporary directory
    const tempExtractDir = join(app.getPath('temp'), `tj2_import_${Date.now()}`)
    fs.mkdirSync(tempExtractDir, { recursive: true })

    // 2. Extract zip
    await extract(sourceZipPath, { dir: tempExtractDir })

    // 3. Verify manifest
    const manifestPath = join(tempExtractDir, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Invalid backup file: manifest.json missing.')
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    if (manifest.type !== 'trading_journal_v2_backup') {
      throw new Error('Invalid backup file type.')
    }

    // 4. Backup current data before overwriting
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    const safeBackupPath = join(backupsDir, `pre_import_${Date.now()}.zip`)
    await exportBackup(safeBackupPath)

    // 5. Replace database
    const extractedDbPath = join(tempExtractDir, 'data.db')
    if (fs.existsSync(extractedDbPath)) {
      fs.copyFileSync(extractedDbPath, dbPath)
    }

    // 6. Replace images directory
    const extractedImagesDir = join(tempExtractDir, 'images')
    if (fs.existsSync(extractedImagesDir)) {
      // Clear current images
      if (fs.existsSync(imagesDir)) {
        fs.rmSync(imagesDir, { recursive: true, force: true })
      }
      // Copy new images (fs.cpSync available in Node >= 16)
      fs.cpSync(extractedImagesDir, imagesDir, { recursive: true })
    }

    // Cleanup temp dir
    fs.rmSync(tempExtractDir, { recursive: true, force: true })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const autoBackup = async (): Promise<void> => {
  try {
    const { backupsDir } = getPaths()
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }

    // Auto-backup name e.g. autobackup_20261010.zip
    const dateStr = new Date().toISOString().split('T')[0]
    const backupPath = join(backupsDir, `autobackup_${dateStr}.zip`)

    // Only run auto-backup once a day
    if (!fs.existsSync(backupPath)) {
      await exportBackup(backupPath)
    }
  } catch (error) {
    console.error('Auto backup failed:', error)
  }
}
