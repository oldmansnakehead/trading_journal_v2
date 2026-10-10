import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getPaths } from '../paths'
import { join } from 'path'
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

export const runMigrations = () => {
  const database = getDb()
  const migrationsFolder = app.isPackaged
    ? join(process.resourcesPath, 'app.asar/out/main/db/migrations')
    : join(__dirname, '../../src/main/db/migrations')

  migrate(database, { migrationsFolder })
}

export const closeDb = () => {
  if (sqliteDb) {
    sqliteDb.close()
    sqliteDb = null
    db = null
  }
}
