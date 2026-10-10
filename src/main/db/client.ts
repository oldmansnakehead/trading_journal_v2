import Database from 'better-sqlite3'
import { getPaths } from '../paths'

let db: Database.Database | null = null

export const getDb = () => {
  if (!db) {
    const { dbPath } = getPaths()
    db = new Database(dbPath)
    
    // Config recommended by requirements
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export const closeDb = () => {
  if (db) {
    db.close()
    db = null
  }
}
