import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { setups, setupSessions, setupPlaybooks, customColumns } from '../db/schema'
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

  // Get setup details (sessions, strategies, columns)
  ipcMain.handle('setups:getDetails', async (_, setupId: number | string) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const parsedSetupId = Number(setupId)

      const sessions = db
        .select()
        .from(setupSessions)
        .where(eq(setupSessions.setupId, parsedSetupId))
        .all()
      const playbooks = db.select().from(setupPlaybooks).where(eq(setupPlaybooks.setupId, parsedSetupId)).all()
      const columns = db
        .select()
        .from(customColumns)
        .where(eq(customColumns.setupId, parsedSetupId))
        .all()

      return {
        success: true,
        data: {
          sessions,
          playbooks,
          customColumns: columns
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Save playbook
  ipcMain.handle('setupPlaybooks:save', async (_, data: { setupId: number, content: string }) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      
      const existing = db.select().from(setupPlaybooks).where(eq(setupPlaybooks.setupId, data.setupId)).get()
      if (existing) {
        const result = db.update(setupPlaybooks)
          .set({ content: data.content, updatedAt: new Date().toISOString() })
          .where(eq(setupPlaybooks.setupId, data.setupId))
          .returning().get()
        return { success: true, data: result }
      } else {
        const result = db.insert(setupPlaybooks).values(data).returning().get()
        return { success: true, data: result }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
