import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { customColumns } from '../db/schema'
import { eq } from 'drizzle-orm'

export const registerCustomColumnHandlers = () => {
  // Get all custom columns for a setup
  ipcMain.handle('customColumns:list', async (_, setupId: number | string) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.select().from(customColumns).where(eq(customColumns.setupId, Number(setupId))).all()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Create a custom column
  ipcMain.handle('customColumns:create', async (_, data) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.insert(customColumns).values(data).returning().get()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Delete a custom column
  ipcMain.handle('customColumns:delete', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(customColumns).where(eq(customColumns.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Update a custom column
  ipcMain.handle('customColumns:update', async (_, id: number, data) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.update(customColumns).set(data).where(eq(customColumns.id, id)).returning().get()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
