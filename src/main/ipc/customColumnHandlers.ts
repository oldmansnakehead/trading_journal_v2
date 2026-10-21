import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { customColumns, setupCustomColumns } from '../db/schema'
import { eq, asc, and } from 'drizzle-orm'

export const registerCustomColumnHandlers = () => {
  // Get all custom columns in the Master Library (with list of setups using each)
  ipcMain.handle('customColumns:listLibrary', async () => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const allCols = db.select().from(customColumns).all()
      const allLinks = db.select().from(setupCustomColumns).all()

      // Group linked setup IDs per column
      const linkMap = new Map<number, number[]>()
      for (const link of allLinks) {
        if (!linkMap.has(link.customColumnId)) {
          linkMap.set(link.customColumnId, [])
        }
        linkMap.get(link.customColumnId)!.push(link.setupId)
      }

      // Also account for legacy setupId
      for (const col of allCols) {
        if (col.setupId) {
          if (!linkMap.has(col.id)) {
            linkMap.set(col.id, [])
          }
          const list = linkMap.get(col.id)!
          if (!list.includes(col.setupId)) {
            list.push(col.setupId)
          }
        }
      }

      const enriched = allCols.map((col) => ({
        ...col,
        linkedSetupIds: linkMap.get(col.id) || []
      }))

      return { success: true, data: enriched }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get all custom columns for a specific setup (or all columns if no setupId)
  ipcMain.handle('customColumns:list', async (_, setupId?: number | string | null) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      if (!setupId) {
        const allCols = db.select().from(customColumns).all()
        return { success: true, data: allCols }
      }

      const parsedSetupId = Number(setupId)

      // Fetch linked columns via junction table
      const linked = db
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

      // Legacy direct setupId check
      const direct = db
        .select()
        .from(customColumns)
        .where(eq(customColumns.setupId, parsedSetupId))
        .all()

      const seenIds = new Set(linked.map((c) => c.id))
      const result = [...linked]
      for (const d of direct) {
        if (!seenIds.has(d.id)) {
          result.push({
            ...d,
            setupId: d.setupId ?? parsedSetupId,
            isRequired: false,
            orderIndex: result.length
          })
        }
      }

      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Create a custom column
  ipcMain.handle('customColumns:create', async (_, data: any) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const setupIdToLink = data.setupId ? Number(data.setupId) : null
      const colData = {
        name: data.name,
        type: data.type,
        options: data.options,
        reportFilter: Boolean(data.reportFilter),
        description: data.description || null,
        setupId: setupIdToLink
      }

      const created = db.insert(customColumns).values(colData).returning().get()

      // If created with a setupId, also link it in the junction table
      if (setupIdToLink && created) {
        db.insert(setupCustomColumns)
          .values({
            setupId: setupIdToLink,
            customColumnId: created.id,
            isRequired: Boolean(data.isRequired),
            orderIndex: Number(data.orderIndex || 0)
          })
          .run()
      }

      return { success: true, data: created }
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

  // Update a custom column definition
  ipcMain.handle('customColumns:update', async (_, id: number, data: any) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const updateData: any = {
        name: data.name,
        type: data.type,
        options: data.options,
        reportFilter: Boolean(data.reportFilter),
        updatedAt: new Date().toISOString()
      }
      if (data.description !== undefined) {
        updateData.description = data.description
      }

      const result = db.update(customColumns).set(updateData).where(eq(customColumns.id, id)).returning().get()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Link an existing custom column to a setup
  ipcMain.handle('customColumns:linkSetup', async (_, data: { setupId: number; customColumnId: number; isRequired?: boolean; orderIndex?: number }) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const existing = db
        .select()
        .from(setupCustomColumns)
        .where(
          and(
            eq(setupCustomColumns.setupId, Number(data.setupId)),
            eq(setupCustomColumns.customColumnId, Number(data.customColumnId))
          )
        )
        .get()

      if (existing) {
        db.update(setupCustomColumns)
          .set({
            isRequired: data.isRequired ?? existing.isRequired,
            orderIndex: data.orderIndex ?? existing.orderIndex,
            updatedAt: new Date().toISOString()
          })
          .where(eq(setupCustomColumns.id, existing.id))
          .run()
      } else {
        db.insert(setupCustomColumns)
          .values({
            setupId: Number(data.setupId),
            customColumnId: Number(data.customColumnId),
            isRequired: Boolean(data.isRequired),
            orderIndex: Number(data.orderIndex || 0)
          })
          .run()
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Unlink a custom column from a setup
  ipcMain.handle('customColumns:unlinkSetup', async (_, data: { setupId: number; customColumnId: number }) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const parsedSetupId = Number(data.setupId)
      const parsedColId = Number(data.customColumnId)

      db.delete(setupCustomColumns)
        .where(
          and(
            eq(setupCustomColumns.setupId, parsedSetupId),
            eq(setupCustomColumns.customColumnId, parsedColId)
          )
        )
        .run()

      // Also clean up legacy direct setupId if it pointed to this setup
      const col = db.select().from(customColumns).where(eq(customColumns.id, parsedColId)).get()
      if (col && col.setupId === parsedSetupId) {
        db.update(customColumns)
          .set({ setupId: null, updatedAt: new Date().toISOString() })
          .where(eq(customColumns.id, parsedColId))
          .run()
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Batch sync linked columns for a setup
  ipcMain.handle('customColumns:batchSyncSetup', async (_, data: { setupId: number; columnIds: number[] }) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const parsedSetupId = Number(data.setupId)
      const targetIds = (data.columnIds || []).map(Number)

      // Get current linked
      const current = db
        .select()
        .from(setupCustomColumns)
        .where(eq(setupCustomColumns.setupId, parsedSetupId))
        .all()

      const currentColIds = current.map((c) => c.customColumnId)

      // Remove unselected
      for (const c of current) {
        if (!targetIds.includes(c.customColumnId)) {
          db.delete(setupCustomColumns).where(eq(setupCustomColumns.id, c.id)).run()
          
          // Clear legacy setupId if matched
          const col = db.select().from(customColumns).where(eq(customColumns.id, c.customColumnId)).get()
          if (col && col.setupId === parsedSetupId) {
            db.update(customColumns)
              .set({ setupId: null, updatedAt: new Date().toISOString() })
              .where(eq(customColumns.id, c.customColumnId))
              .run()
          }
        }
      }

      // Add new
      for (let i = 0; i < targetIds.length; i++) {
        const colId = targetIds[i]
        if (!currentColIds.includes(colId)) {
          db.insert(setupCustomColumns)
            .values({
              setupId: parsedSetupId,
              customColumnId: colId,
              isRequired: false,
              orderIndex: i
            })
            .run()
        }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
