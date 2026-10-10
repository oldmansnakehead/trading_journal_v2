import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { setups, setupSessions, setupPlaybooks, strategies, customColumns } from '../db/schema'
import { eq } from 'drizzle-orm'

export const registerSetupHandlers = () => {
  // Get all setups
  ipcMain.handle('setups:list', async () => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.select().from(setups).all()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Create a setup
  ipcMain.handle('setups:create', async (_, data) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.insert(setups).values(data).returning().get()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Delete a setup
  ipcMain.handle('setups:delete', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(setups).where(eq(setups.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
