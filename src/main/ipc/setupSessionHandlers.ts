import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { setupSessions } from '../db/schema'
import { eq } from 'drizzle-orm'

export const registerSetupSessionHandlers = () => {
  // Create a session
  ipcMain.handle('setupSessions:create', async (_, data) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      
      data.setupId = Number(data.setupId)
      console.log('Inserting setup session:', data)
      const result = db.insert(setupSessions).values(data).returning().get()
      console.log('Insert result:', result)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Delete a session
  ipcMain.handle('setupSessions:delete', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(setupSessions).where(eq(setupSessions.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
