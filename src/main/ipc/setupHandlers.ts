import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { setups, setupSessions, setupPlaybooks, setupPlaybookFlows, customColumns, setupCustomColumns } from '../db/schema'
import { eq, asc } from 'drizzle-orm'

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

  // Get setup details (sessions, strategies, columns, flows)
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
      const flows = db.select().from(setupPlaybookFlows).where(eq(setupPlaybookFlows.setupId, parsedSetupId)).all()
      // Fetch custom columns linked via setup_custom_columns junction table
      const linkedColumns = db
        .select({
          id: customColumns.id,
          setupId: setupCustomColumns.setupId,
          name: customColumns.name,
          type: customColumns.type,
          options: customColumns.options,
          reportFilter: customColumns.reportFilter,
          description: customColumns.description,
          isRequired: setupCustomColumns.isRequired,
          orderIndex: setupCustomColumns.orderIndex,
          createdAt: customColumns.createdAt,
          updatedAt: customColumns.updatedAt
        })
        .from(setupCustomColumns)
        .innerJoin(customColumns, eq(setupCustomColumns.customColumnId, customColumns.id))
        .where(eq(setupCustomColumns.setupId, parsedSetupId))
        .orderBy(asc(setupCustomColumns.orderIndex))
        .all()

      // Legacy fallback for any columns having direct setupId
      const directColumns = db
        .select()
        .from(customColumns)
        .where(eq(customColumns.setupId, parsedSetupId))
        .all()

      const seenIds = new Set(linkedColumns.map((c) => c.id))
      const columns = [...linkedColumns]
      for (const dc of directColumns) {
        if (!seenIds.has(dc.id)) {
          columns.push({
            ...dc,
            setupId: dc.setupId ?? parsedSetupId,
            isRequired: false,
            orderIndex: columns.length
          })
        }
      }

      let parsedFlow: any = null
      if (flows.length > 0 && flows[0]) {
        let flowData = flows[0].flowData
        if (typeof flowData === 'string') {
          try {
            flowData = JSON.parse(flowData)
          } catch {}
        }
        parsedFlow = { ...flows[0], flowData }
      }

      return {
        success: true,
        data: {
          sessions,
          playbooks,
          flows,
          flow: parsedFlow,
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

  // Get playbook flow
  ipcMain.handle('setupPlaybookFlows:get', async (_, setupId: number | string) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const parsedSetupId = Number(setupId)
      const result = db.select().from(setupPlaybookFlows).where(eq(setupPlaybookFlows.setupId, parsedSetupId)).get()
      if (result) {
        let flowData = result.flowData
        if (typeof flowData === 'string') {
          try {
            flowData = JSON.parse(flowData)
          } catch {}
        }
        return { success: true, data: { ...result, flowData } }
      }
      return { success: true, data: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Save playbook flow
  ipcMain.handle('setupPlaybookFlows:save', async (_, data: { setupId: number, flowData: any }) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const existing = db.select().from(setupPlaybookFlows).where(eq(setupPlaybookFlows.setupId, data.setupId)).get()
      if (existing) {
        const result = db.update(setupPlaybookFlows)
          .set({ flowData: data.flowData, updatedAt: new Date().toISOString() })
          .where(eq(setupPlaybookFlows.setupId, data.setupId))
          .returning().get()
        return { success: true, data: result }
      } else {
        const result = db.insert(setupPlaybookFlows).values(data).returning().get()
        return { success: true, data: result }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
