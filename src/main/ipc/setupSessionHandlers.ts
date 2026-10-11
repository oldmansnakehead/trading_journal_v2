import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { setupSessions } from '../db/schema'
import { eq, and } from 'drizzle-orm'

export const ALLOWED_SESSION_NAMES = ['London', 'New York', 'London Close', 'Asia', 'Tokyo'] as const

export const registerSetupSessionHandlers = () => {
  // Create a session
  ipcMain.handle('setupSessions:create', async (_, data) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      
      data.setupId = Number(data.setupId)
      const sessionName = String(data.sessionName || '').trim()

      if (!ALLOWED_SESSION_NAMES.includes(sessionName as any)) {
        return {
          success: false,
          error: `Invalid session name "${sessionName}". Allowed session names are: ${ALLOWED_SESSION_NAMES.join(', ')}`
        }
      }

      // Check if session name already exists for this setup
      const existing = db
        .select()
        .from(setupSessions)
        .where(
          and(
            eq(setupSessions.setupId, data.setupId),
            eq(setupSessions.sessionName, sessionName)
          )
        )
        .get()

      if (existing) {
        return {
          success: false,
          error: `Session "${sessionName}" already exists for this setup.`
        }
      }

      data.sessionName = sessionName
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
