import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getPaths } from '../paths'
import { join } from 'path'
import { existsSync } from 'fs'
import { app } from 'electron'

let sqliteDb: Database.Database | null = null
let db: ReturnType<typeof drizzle> | null = null

export const getDb = () => {
  if (!db) {
    const { dbPath } = getPaths()
    sqliteDb = new Database(dbPath)

    // Config recommended by requirements
    sqliteDb.pragma('journal_mode = WAL')
    sqliteDb.pragma('foreign_keys = ON')

    db = drizzle(sqliteDb)
  }
  return db
}

export const getSqliteDb = () => {
  getDb()
  return sqliteDb
}

export const runMigrations = () => {
  const database = getDb()
  let migrationsFolder = join(__dirname, '../../src/main/db/migrations')

  if (app.isPackaged) {
    const resourceMigrations = join(process.resourcesPath, 'migrations')
    const asarMigrations = join(process.resourcesPath, 'app.asar/out/main/db/migrations')

    if (existsSync(resourceMigrations)) {
      migrationsFolder = resourceMigrations
    } else if (existsSync(asarMigrations)) {
      migrationsFolder = asarMigrations
    }
  }

  try {
    migrate(database, { migrationsFolder })
  } catch (err) {
    console.error('Failed to run database migrations:', err)
  }
}

export const checkpointDb = () => {
  if (sqliteDb) {
    try {
      sqliteDb.pragma('wal_checkpoint(TRUNCATE)')
    } catch (e) {
      console.error('Failed to checkpoint WAL:', e)
    }
  }
}

export const closeDb = () => {
  if (sqliteDb) {
    checkpointDb()
    sqliteDb.close()
    sqliteDb = null
    db = null
  }
}
