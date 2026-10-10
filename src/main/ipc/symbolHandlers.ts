import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { symbols } from '../db/schema'

export const registerSymbolHandlers = () => {
  ipcMain.handle('symbols:list', async () => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.select().from(symbols).all()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('symbols:create', async (_, data: { name: string }) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.insert(symbols).values({ name: data.name.toUpperCase() }).returning().get()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('symbols:delete', async (_, id: number) => {
    try {
      const { eq } = require('drizzle-orm')
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(symbols).where(eq(symbols.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
