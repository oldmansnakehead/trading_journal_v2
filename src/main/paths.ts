import { app } from 'electron'
import { join } from 'path'

export const getPaths = () => {
  const dataDir = app.getPath('userData')
  return {
    dataDir,
    dbPath: join(dataDir, 'data.db'),
    imagesDir: join(dataDir, 'images'),
    thumbsDir: join(dataDir, 'images', 'thumbs'),
    backupsDir: join(dataDir, 'backups')
  }
}
