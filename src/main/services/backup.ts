import { getPaths } from '../paths'
import * as archiverPkg from 'archiver'
import extractZip from 'extract-zip'
import fs from 'fs'
import { join } from 'path'
import { app } from 'electron'
import { checkpointDb, closeDb, getDb, getSqliteDb, runMigrations } from '../db/client'

const createZipArchive = (options: any) => {
  const pkg: any = archiverPkg
  if (pkg.ZipArchive) {
    return new pkg.ZipArchive(options)
  }
  if (typeof pkg.default === 'function') {
    return pkg.default('zip', options)
  }
  if (typeof pkg === 'function') {
    return pkg('zip', options)
  }
  if (pkg.default && pkg.default.ZipArchive) {
    return new pkg.default.ZipArchive(options)
  }
  throw new Error('Could not initialize zip archive engine')
}

const extractZipFile = async (sourceZipPath: string, targetDir: string) => {
  const extractFn: any = typeof extractZip === 'function' ? extractZip : (extractZip as any).default
  if (typeof extractFn !== 'function') {
    throw new Error('Could not initialize zip extraction engine')
  }
  await extractFn(sourceZipPath, { dir: targetDir })
}

export const exportBackup = async (
  destPath: string
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    try {
      // 1. Flush any WAL frames into data.db
      checkpointDb()

      const { dbPath, imagesDir } = getPaths()

      // Ensure destination directory exists
      const parentDir = join(destPath, '..')
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true })
      }

      const output = fs.createWriteStream(destPath)
      const archive = createZipArchive({
        zlib: { level: 9 } // Maximum compression
      })

      output.on('close', () => {
        resolve({ success: true })
      })

      output.on('error', (err: any) => {
        resolve({ success: false, error: err.message })
      })

      archive.on('error', (err: any) => {
        resolve({ success: false, error: err.message })
      })

      archive.pipe(output)

      // 1. Add manifest
      const manifest = {
        version: app ? app.getVersion() : '1.0.0',
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
  const tempExtractDir = join(app ? app.getPath('temp') : process.cwd(), `tj2_import_${Date.now()}`)
  try {
    const { dbPath, imagesDir, backupsDir } = getPaths()

    // 1. Create a safe temporary directory
    fs.mkdirSync(tempExtractDir, { recursive: true })

    // 2. Extract zip
    await extractZipFile(sourceZipPath, tempExtractDir)

    // 3. Verify manifest
    const manifestPath = join(tempExtractDir, 'manifest.json')
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Invalid backup file: manifest.json is missing.')
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    if (manifest.type !== 'trading_journal_v2_backup') {
      throw new Error('Invalid backup file type: not a Trading Journal v2 backup.')
    }

    const extractedDbPath = join(tempExtractDir, 'data.db')
    if (!fs.existsSync(extractedDbPath)) {
      throw new Error('Invalid backup file: data.db is missing.')
    }

    // 4. Backup current data before overwriting
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    const safeBackupPath = join(backupsDir, `pre_import_${Date.now()}.zip`)
    await exportBackup(safeBackupPath)

    // 5. Replace database
    // Close current connection so Windows doesn't lock the file
    closeDb()

    // Clean up old WAL/SHM files
    const walPath = `${dbPath}-wal`
    const shmPath = `${dbPath}-shm`
    if (fs.existsSync(walPath)) {
      try {
        fs.unlinkSync(walPath)
      } catch {}
    }
    if (fs.existsSync(shmPath)) {
      try {
        fs.unlinkSync(shmPath)
      } catch {}
    }

    // Copy new database
    fs.copyFileSync(extractedDbPath, dbPath)

    // Reopen DB and apply any pending migrations
    getDb()
    runMigrations()

    // 6. Replace images directory
    const extractedImagesDir = join(tempExtractDir, 'images')
    if (fs.existsSync(extractedImagesDir)) {
      // Clear current images directory
      if (fs.existsSync(imagesDir)) {
        fs.rmSync(imagesDir, { recursive: true, force: true })
      }
      fs.mkdirSync(imagesDir, { recursive: true })
      fs.cpSync(extractedImagesDir, imagesDir, { recursive: true })
    }

    // Cleanup temp directory
    fs.rmSync(tempExtractDir, { recursive: true, force: true })

    return { success: true }
  } catch (error: any) {
    // If tempExtractDir exists, clean it up
    try {
      if (fs.existsSync(tempExtractDir)) {
        fs.rmSync(tempExtractDir, { recursive: true, force: true })
      }
    } catch {}

    // Ensure database connection is re-established if it was closed
    try {
      getDb()
    } catch {}

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

export const clearDatabase = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { imagesDir, backupsDir } = getPaths()

    // 1. Create a safe backup before wiping
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    const safeBackupPath = join(backupsDir, `pre_clear_${Date.now()}.zip`)
    await exportBackup(safeBackupPath)

    // 2. Truncate all tables via SQLite SQL queries
    // This succeeds reliably even when external tools like Navicat are connected
    const rawDb = getSqliteDb()
    if (rawDb) {
      rawDb.pragma('foreign_keys = OFF')
      const tables = rawDb
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle_%'"
        )
        .all() as { name: string }[]

      for (const { name } of tables) {
        rawDb.exec(`DELETE FROM "${name}"`)
      }

      try {
        rawDb.exec('DELETE FROM sqlite_sequence')
      } catch {}

      rawDb.pragma('foreign_keys = ON')

      try {
        rawDb.pragma('wal_checkpoint(TRUNCATE)')
      } catch {}

      try {
        rawDb.exec('VACUUM')
      } catch {}
    }

    // 3. Clear images
    if (fs.existsSync(imagesDir)) {
      fs.rmSync(imagesDir, { recursive: true, force: true })
      fs.mkdirSync(imagesDir, { recursive: true })
      fs.mkdirSync(join(imagesDir, 'thumbs'), { recursive: true })
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

