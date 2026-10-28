import { BrowserWindow, ipcMain } from 'electron'
import { getDb } from '../db/client'
import {
  researchSetups,
  researchSetupSessions,
  researchSetupPlaybooks,
  researchSetupPlaybookFlows,
  researchCustomColumns,
  researchSetupCustomColumns,
  researchEntries,
  researchEntryZones,
  symbols
} from '../db/schema'
import { eq, desc, asc, and, inArray, gte, lte } from 'drizzle-orm'
import type {
  ResearchEntryInput,
  ResearchFilters,
  ResearchAnalyticsSummary,
  ResearchExportPayload,
  ZoneComparisonMetric
} from '../../shared/types'
import {
  generateResearchAiMarkdown,
  generateResearchAiJson,
  exportResearchAiReportToFile,
  exportResearchTradesToExcel
} from '../services/researchExport'

export const registerResearchHandlers = () => {
  // ==========================================
  // --- Research Setups Handlers ---
  // ==========================================

  // List all research setups
  ipcMain.handle('researchSetups:list', async () => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.select().from(researchSetups).orderBy(desc(researchSetups.id)).all()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get a single setup by ID
  ipcMain.handle('researchSetups:get', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const setup = db.select().from(researchSetups).where(eq(researchSetups.id, id)).get()
      if (!setup) throw new Error('Research setup not found')
      return { success: true, data: setup }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get setup details (sessions, playbooks, flows, linked custom columns)
  ipcMain.handle('researchSetups:getDetails', async (_, setupId: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const setup = db.select().from(researchSetups).where(eq(researchSetups.id, setupId)).get()
      if (!setup) throw new Error('Research setup not found')

      const sessions = db
        .select()
        .from(researchSetupSessions)
        .where(eq(researchSetupSessions.setupId, setupId))
        .all()

      const playbooks = db
        .select()
        .from(researchSetupPlaybooks)
        .where(eq(researchSetupPlaybooks.setupId, setupId))
        .all()

      const flows = db
        .select()
        .from(researchSetupPlaybookFlows)
        .where(eq(researchSetupPlaybookFlows.setupId, setupId))
        .all()

      // Linked custom columns in order
      const linkedColumns = db
        .select({
          id: researchCustomColumns.id,
          name: researchCustomColumns.name,
          type: researchCustomColumns.type,
          options: researchCustomColumns.options,
          description: researchCustomColumns.description,
          orderIndex: researchSetupCustomColumns.orderIndex,
          createdAt: researchCustomColumns.createdAt,
          updatedAt: researchCustomColumns.updatedAt
        })
        .from(researchSetupCustomColumns)
        .innerJoin(
          researchCustomColumns,
          eq(researchSetupCustomColumns.customColumnId, researchCustomColumns.id)
        )
        .where(eq(researchSetupCustomColumns.setupId, setupId))
        .orderBy(asc(researchSetupCustomColumns.orderIndex))
        .all()

      return {
        success: true,
        data: {
          ...setup,
          sessions,
          playbooks,
          flows,
          customColumns: linkedColumns
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Create research setup
  ipcMain.handle(
    'researchSetups:create',
    async (
      _,
      data: {
        name: string
        description?: string
        type: string
        enableExitDate?: boolean
      }
    ) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        const now = new Date().toISOString()
        const result = db
          .insert(researchSetups)
          .values({
            name: data.name,
            description: data.description || null,
            type: data.type,
            enableExitDate: Boolean(data.enableExitDate),
            createdAt: now,
            updatedAt: now
          })
          .returning()
          .get()

        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Update research setup
  ipcMain.handle(
    'researchSetups:update',
    async (
      _,
      id: number,
      data: {
        name?: string
        description?: string
        type?: string
        enableExitDate?: boolean
      }
    ) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        const updatePayload: any = {
          updatedAt: new Date().toISOString()
        }
        if (data.name !== undefined) updatePayload.name = data.name
        if (data.description !== undefined) updatePayload.description = data.description
        if (data.type !== undefined) updatePayload.type = data.type
        if (data.enableExitDate !== undefined)
          updatePayload.enableExitDate = Boolean(data.enableExitDate)

        const result = db
          .update(researchSetups)
          .set(updatePayload)
          .where(eq(researchSetups.id, id))
          .returning()
          .get()

        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Delete research setup
  ipcMain.handle('researchSetups:delete', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(researchSetups).where(eq(researchSetups.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ==========================================
  // --- Research Sessions Handlers ---
  // ==========================================

  // List sessions by setupId
  ipcMain.handle('researchSessions:listBySetup', async (_, setupId: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db
        .select()
        .from(researchSetupSessions)
        .where(eq(researchSetupSessions.setupId, setupId))
        .all()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Create research session
  ipcMain.handle(
    'researchSessions:create',
    async (
      _,
      data: {
        setupId: number
        startTime: string
        endTime: string
        sessionName: string
      }
    ) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')
        const now = new Date().toISOString()

        // Check if session name already exists for this setup
        const existing = db
          .select()
          .from(researchSetupSessions)
          .where(
            and(
              eq(researchSetupSessions.setupId, data.setupId),
              eq(researchSetupSessions.sessionName, data.sessionName)
            )
          )
          .get()

        if (existing) {
          const updated = db
            .update(researchSetupSessions)
            .set({
              startTime: data.startTime,
              endTime: data.endTime,
              updatedAt: now
            })
            .where(eq(researchSetupSessions.id, existing.id))
            .returning()
            .get()
          return { success: true, data: updated }
        }

        const result = db
          .insert(researchSetupSessions)
          .values({
            setupId: data.setupId,
            startTime: data.startTime,
            endTime: data.endTime,
            sessionName: data.sessionName,
            createdAt: now,
            updatedAt: now
          })
          .returning()
          .get()
        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Delete research session
  ipcMain.handle('researchSessions:delete', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(researchSetupSessions).where(eq(researchSetupSessions.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ==========================================
  // --- Research Playbooks & Flow Handlers ---
  // ==========================================

  // Get playbook text content
  ipcMain.handle('researchPlaybooks:get', async (_, setupId: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db
        .select()
        .from(researchSetupPlaybooks)
        .where(eq(researchSetupPlaybooks.setupId, setupId))
        .get()
      return { success: true, data: result || null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Save playbook text content
  ipcMain.handle(
    'researchPlaybooks:save',
    async (_, data: { setupId: number; content: string }) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')
        const now = new Date().toISOString()

        const existing = db
          .select()
          .from(researchSetupPlaybooks)
          .where(eq(researchSetupPlaybooks.setupId, data.setupId))
          .get()

        let result
        if (existing) {
          result = db
            .update(researchSetupPlaybooks)
            .set({ content: data.content, updatedAt: now })
            .where(eq(researchSetupPlaybooks.setupId, data.setupId))
            .returning()
            .get()
        } else {
          result = db
            .insert(researchSetupPlaybooks)
            .values({ setupId: data.setupId, content: data.content, createdAt: now, updatedAt: now })
            .returning()
            .get()
        }
        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Get playbook flow (Vue Flow diagram)
  ipcMain.handle('researchPlaybookFlows:get', async (_, setupId: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db
        .select()
        .from(researchSetupPlaybookFlows)
        .where(eq(researchSetupPlaybookFlows.setupId, setupId))
        .get()
      return { success: true, data: result || null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Save playbook flow (Vue Flow diagram)
  ipcMain.handle(
    'researchPlaybookFlows:save',
    async (_, data: { setupId: number; flowData: any }) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')
        const now = new Date().toISOString()

        const existing = db
          .select()
          .from(researchSetupPlaybookFlows)
          .where(eq(researchSetupPlaybookFlows.setupId, data.setupId))
          .get()

        let result
        if (existing) {
          result = db
            .update(researchSetupPlaybookFlows)
            .set({ flowData: data.flowData, updatedAt: now })
            .where(eq(researchSetupPlaybookFlows.setupId, data.setupId))
            .returning()
            .get()
        } else {
          result = db
            .insert(researchSetupPlaybookFlows)
            .values({
              setupId: data.setupId,
              flowData: data.flowData,
              createdAt: now,
              updatedAt: now
            })
            .returning()
            .get()
        }
        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // ==========================================
  // --- Research Custom Columns Handlers ---
  // ==========================================

  // List all custom columns in the library
  ipcMain.handle('researchCustomColumns:listLibrary', async () => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const allCols = db.select().from(researchCustomColumns).all()
      const allLinks = db.select().from(researchSetupCustomColumns).all()

      const linkMap = new Map<number, number[]>()
      for (const link of allLinks) {
        if (!linkMap.has(link.customColumnId)) {
          linkMap.set(link.customColumnId, [])
        }
        linkMap.get(link.customColumnId)!.push(link.setupId)
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

  // List custom columns for a specific setup (or all columns if no setupId)
  ipcMain.handle('researchCustomColumns:list', async (_, setupId?: number | null) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      if (!setupId) {
        const allCols = db.select().from(researchCustomColumns).all()
        return { success: true, data: allCols }
      }

      const linkedColumns = db
        .select({
          id: researchCustomColumns.id,
          name: researchCustomColumns.name,
          type: researchCustomColumns.type,
          options: researchCustomColumns.options,
          description: researchCustomColumns.description,
          orderIndex: researchSetupCustomColumns.orderIndex,
          createdAt: researchCustomColumns.createdAt,
          updatedAt: researchCustomColumns.updatedAt
        })
        .from(researchSetupCustomColumns)
        .innerJoin(
          researchCustomColumns,
          eq(researchSetupCustomColumns.customColumnId, researchCustomColumns.id)
        )
        .where(eq(researchSetupCustomColumns.setupId, setupId))
        .orderBy(asc(researchSetupCustomColumns.orderIndex))
        .all()

      return { success: true, data: linkedColumns }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Create research custom column
  ipcMain.handle(
    'researchCustomColumns:create',
    async (
      _,
      data: {
        name: string
        type: string
        options?: string[]
        description?: string
      }
    ) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        const now = new Date().toISOString()
        const result = db
          .insert(researchCustomColumns)
          .values({
            name: data.name,
            type: data.type || 'zone_group',
            options: data.options || null,
            description: data.description || null,
            createdAt: now,
            updatedAt: now
          })
          .returning()
          .get()

        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Update research custom column
  ipcMain.handle(
    'researchCustomColumns:update',
    async (
      _,
      id: number,
      data: {
        name?: string
        type?: string
        options?: string[]
        description?: string
      }
    ) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        const updatePayload: any = {
          updatedAt: new Date().toISOString()
        }
        if (data.name !== undefined) updatePayload.name = data.name
        if (data.type !== undefined) updatePayload.type = data.type
        if (data.options !== undefined) updatePayload.options = data.options
        if (data.description !== undefined) updatePayload.description = data.description

        const result = db
          .update(researchCustomColumns)
          .set(updatePayload)
          .where(eq(researchCustomColumns.id, id))
          .returning()
          .get()

        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Delete research custom column
  ipcMain.handle('researchCustomColumns:delete', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(researchCustomColumns).where(eq(researchCustomColumns.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Link column to setup
  ipcMain.handle(
    'researchCustomColumns:linkSetup',
    async (
      _,
      data: {
        setupId: number
        customColumnId: number
        orderIndex?: number
      }
    ) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        const now = new Date().toISOString()
        const existing = db
          .select()
          .from(researchSetupCustomColumns)
          .where(
            and(
              eq(researchSetupCustomColumns.setupId, data.setupId),
              eq(researchSetupCustomColumns.customColumnId, data.customColumnId)
            )
          )
          .get()

        if (existing) {
          const result = db
            .update(researchSetupCustomColumns)
            .set({
              orderIndex: data.orderIndex !== undefined ? data.orderIndex : existing.orderIndex,
              updatedAt: now
            })
            .where(eq(researchSetupCustomColumns.id, existing.id))
            .returning()
            .get()
          return { success: true, data: result }
        }

        const result = db
          .insert(researchSetupCustomColumns)
          .values({
            setupId: data.setupId,
            customColumnId: data.customColumnId,
            orderIndex: data.orderIndex || 0,
            createdAt: now,
            updatedAt: now
          })
          .returning()
          .get()

        return { success: true, data: result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Unlink column from setup
  ipcMain.handle(
    'researchCustomColumns:unlinkSetup',
    async (_, data: { setupId: number; customColumnId: number }) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        db.delete(researchSetupCustomColumns)
          .where(
            and(
              eq(researchSetupCustomColumns.setupId, data.setupId),
              eq(researchSetupCustomColumns.customColumnId, data.customColumnId)
            )
          )
          .run()

        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Batch sync custom columns for a setup
  ipcMain.handle(
    'researchCustomColumns:batchSyncSetup',
    async (_, data: { setupId: number; columnIds: number[] }) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        const now = new Date().toISOString()

        // Remove existing associations
        db.delete(researchSetupCustomColumns)
          .where(eq(researchSetupCustomColumns.setupId, data.setupId))
          .run()

        // Insert new associations in order
        for (let i = 0; i < data.columnIds.length; i++) {
          db.insert(researchSetupCustomColumns)
            .values({
              setupId: data.setupId,
              customColumnId: data.columnIds[i],
              orderIndex: i,
              createdAt: now,
              updatedAt: now
            })
            .run()
        }

        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // ==========================================
  // --- Research Entries Handlers ---
  // ==========================================

  // List research entries with filters
  ipcMain.handle('researchEntries:list', async (_, filters?: ResearchFilters) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      let query = db
        .select({
          id: researchEntries.id,
          setupId: researchEntries.setupId,
          setupName: researchSetups.name,
          symbolId: researchEntries.symbolId,
          symbolName: symbols.name,
          entryDatetime: researchEntries.entryDatetime,
          exitDatetime: researchEntries.exitDatetime,
          sessionName: researchEntries.sessionName,
          timeframe: researchEntries.timeframe,
          news: researchEntries.news,
          quality: researchEntries.quality,
          images: researchEntries.images,
          notes: researchEntries.notes,
          createdAt: researchEntries.createdAt,
          updatedAt: researchEntries.updatedAt
        })
        .from(researchEntries)
        .leftJoin(researchSetups, eq(researchEntries.setupId, researchSetups.id))
        .leftJoin(symbols, eq(researchEntries.symbolId, symbols.id))
        .$dynamic()

      const conditions: any[] = []

      if (filters?.setupId) {
        conditions.push(eq(researchEntries.setupId, filters.setupId))
      }
      if (filters?.symbolId) {
        conditions.push(eq(researchEntries.symbolId, filters.symbolId))
      }
      if (filters?.sessionName) {
        conditions.push(eq(researchEntries.sessionName, filters.sessionName))
      }
      if (filters?.timeframe) {
        conditions.push(eq(researchEntries.timeframe, filters.timeframe))
      }
      if (filters?.news !== undefined) {
        conditions.push(eq(researchEntries.news, filters.news))
      }
      if (filters?.quality) {
        conditions.push(eq(researchEntries.quality, filters.quality))
      }
      if (filters?.startDate) {
        conditions.push(gte(researchEntries.entryDatetime, filters.startDate))
      }
      if (filters?.endDate) {
        const endLimit = filters.endDate.length === 10 ? `${filters.endDate}T23:59:59` : filters.endDate
        conditions.push(lte(researchEntries.entryDatetime, endLimit))
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      const entries = query.orderBy(desc(researchEntries.entryDatetime)).all()

      // Fetch zone entries for all returned entries
      const entryIds = entries.map((e) => e.id)
      let allZones: any[] = []
      if (entryIds.length > 0) {
        allZones = db
          .select({
            id: researchEntryZones.id,
            researchEntryId: researchEntryZones.researchEntryId,
            customColumnId: researchEntryZones.customColumnId,
            customColumnName: researchCustomColumns.name,
            bias: researchEntryZones.bias,
            minRr: researchEntryZones.minRr,
            maxRr: researchEntryZones.maxRr,
            minSlPoints: researchEntryZones.minSlPoints,
            maxSlPoints: researchEntryZones.maxSlPoints,
            isMissed: researchEntryZones.isMissed,
            outcome: researchEntryZones.outcome,
            notes: researchEntryZones.notes,
            createdAt: researchEntryZones.createdAt,
            updatedAt: researchEntryZones.updatedAt
          })
          .from(researchEntryZones)
          .leftJoin(
            researchCustomColumns,
            eq(researchEntryZones.customColumnId, researchCustomColumns.id)
          )
          .where(inArray(researchEntryZones.researchEntryId, entryIds))
          .all()
      }

      const zoneMap = new Map<number, any[]>()
      for (const z of allZones) {
        if (!zoneMap.has(z.researchEntryId)) {
          zoneMap.set(z.researchEntryId, [])
        }
        zoneMap.get(z.researchEntryId)!.push(z)
      }

      const fullEntries = entries.map((e) => ({
        ...e,
        zones: zoneMap.get(e.id) || []
      }))

      return { success: true, data: fullEntries }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get a single research entry by ID
  ipcMain.handle('researchEntries:get', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const entry = db
        .select({
          id: researchEntries.id,
          setupId: researchEntries.setupId,
          setupName: researchSetups.name,
          symbolId: researchEntries.symbolId,
          symbolName: symbols.name,
          entryDatetime: researchEntries.entryDatetime,
          exitDatetime: researchEntries.exitDatetime,
          sessionName: researchEntries.sessionName,
          timeframe: researchEntries.timeframe,
          news: researchEntries.news,
          quality: researchEntries.quality,
          images: researchEntries.images,
          notes: researchEntries.notes,
          createdAt: researchEntries.createdAt,
          updatedAt: researchEntries.updatedAt
        })
        .from(researchEntries)
        .leftJoin(researchSetups, eq(researchEntries.setupId, researchSetups.id))
        .leftJoin(symbols, eq(researchEntries.symbolId, symbols.id))
        .where(eq(researchEntries.id, id))
        .get()

      if (!entry) throw new Error('Research entry not found')

      const zones = db
        .select({
          id: researchEntryZones.id,
          researchEntryId: researchEntryZones.researchEntryId,
          customColumnId: researchEntryZones.customColumnId,
          customColumnName: researchCustomColumns.name,
          bias: researchEntryZones.bias,
          minRr: researchEntryZones.minRr,
          maxRr: researchEntryZones.maxRr,
          minSlPoints: researchEntryZones.minSlPoints,
          maxSlPoints: researchEntryZones.maxSlPoints,
          isMissed: researchEntryZones.isMissed,
          outcome: researchEntryZones.outcome,
          notes: researchEntryZones.notes,
          createdAt: researchEntryZones.createdAt,
          updatedAt: researchEntryZones.updatedAt
        })
        .from(researchEntryZones)
        .leftJoin(
          researchCustomColumns,
          eq(researchEntryZones.customColumnId, researchCustomColumns.id)
        )
        .where(eq(researchEntryZones.researchEntryId, id))
        .all()

      return {
        success: true,
        data: {
          ...entry,
          zones
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Create research entry
  ipcMain.handle('researchEntries:create', async (_, payload: ResearchEntryInput) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const now = new Date().toISOString()

      // 1. Insert main research entry
      const newEntry = db
        .insert(researchEntries)
        .values({
          setupId: payload.setupId,
          symbolId: payload.symbolId,
          entryDatetime: payload.entryDatetime,
          exitDatetime: payload.exitDatetime || null,
          sessionName: payload.sessionName || null,
          timeframe: payload.timeframe || null,
          news: Boolean(payload.news),
          quality: payload.quality || null,
          images: payload.images || [],
          notes: payload.notes || null,
          createdAt: now,
          updatedAt: now
        })
        .returning()
        .get()

      // 2. Insert zones
      if (payload.zones && payload.zones.length > 0) {
        for (const zone of payload.zones) {
          // Derive outcome
          let outcome = zone.outcome
          if (!outcome) {
            if (zone.isMissed) {
              outcome = 'missed'
            } else if (zone.minRr === -1 || zone.maxRr === -1) {
              outcome = 'loss'
            } else if (zone.minRr === 0) {
              outcome = 'be'
            } else if (zone.minRr && zone.minRr > 0) {
              outcome = 'win'
            }
          }

          db.insert(researchEntryZones)
            .values({
              researchEntryId: newEntry.id,
              customColumnId: zone.customColumnId,
              bias: zone.bias || null,
              minRr: zone.isMissed ? null : zone.minRr ?? null,
              maxRr: zone.isMissed ? null : zone.maxRr ?? null,
              minSlPoints: zone.minSlPoints ?? null,
              maxSlPoints: zone.maxSlPoints ?? null,
              isMissed: Boolean(zone.isMissed),
              outcome: outcome || null,
              notes: zone.notes || null,
              createdAt: now,
              updatedAt: now
            })
            .run()
        }
      }

      return { success: true, data: newEntry }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Update research entry
  ipcMain.handle(
    'researchEntries:update',
    async (_, id: number, payload: Partial<ResearchEntryInput>) => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        const now = new Date().toISOString()
        const updatePayload: any = { updatedAt: now }

        if (payload.setupId !== undefined) updatePayload.setupId = payload.setupId
        if (payload.symbolId !== undefined) updatePayload.symbolId = payload.symbolId
        if (payload.entryDatetime !== undefined) updatePayload.entryDatetime = payload.entryDatetime
        if (payload.exitDatetime !== undefined) updatePayload.exitDatetime = payload.exitDatetime
        if (payload.sessionName !== undefined) updatePayload.sessionName = payload.sessionName
        if (payload.timeframe !== undefined) updatePayload.timeframe = payload.timeframe
        if (payload.news !== undefined) updatePayload.news = Boolean(payload.news)
        if (payload.quality !== undefined) updatePayload.quality = payload.quality
        if (payload.images !== undefined) updatePayload.images = payload.images
        if (payload.notes !== undefined) updatePayload.notes = payload.notes

        const updatedEntry = db
          .update(researchEntries)
          .set(updatePayload)
          .where(eq(researchEntries.id, id))
          .returning()
          .get()

        // Update zones if provided
        if (payload.zones !== undefined) {
          db.delete(researchEntryZones).where(eq(researchEntryZones.researchEntryId, id)).run()

          for (const zone of payload.zones) {
            let outcome = zone.outcome
            if (!outcome) {
              if (zone.isMissed) {
                outcome = 'missed'
              } else if (zone.minRr === -1 || zone.maxRr === -1) {
                outcome = 'loss'
              } else if (zone.minRr === 0) {
                outcome = 'be'
              } else if (zone.minRr && zone.minRr > 0) {
                outcome = 'win'
              }
            }

            db.insert(researchEntryZones)
              .values({
                researchEntryId: id,
                customColumnId: zone.customColumnId,
                bias: zone.bias || null,
                minRr: zone.isMissed ? null : zone.minRr ?? null,
                maxRr: zone.isMissed ? null : zone.maxRr ?? null,
                minSlPoints: zone.minSlPoints ?? null,
                maxSlPoints: zone.maxSlPoints ?? null,
                isMissed: Boolean(zone.isMissed),
                outcome: outcome || null,
                notes: zone.notes || null,
                createdAt: now,
                updatedAt: now
              })
              .run()
          }
        }

        return { success: true, data: updatedEntry }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Delete research entry
  ipcMain.handle('researchEntries:delete', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(researchEntries).where(eq(researchEntries.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Delete multiple research entries
  ipcMain.handle('researchEntries:deleteMany', async (_, ids: number[]) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      if (!ids || ids.length === 0) return { success: true }
      db.delete(researchEntries).where(inArray(researchEntries.id, ids)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get Zone Analytics & Comparison Metrics
  ipcMain.handle(
    'researchEntries:getAnalytics',
    async (_, filters?: ResearchFilters): Promise<{ success: boolean; data?: ResearchAnalyticsSummary; error?: string }> => {
      try {
        const db = getDb()
        if (!db) throw new Error('Database not initialized')

        // 1. Filter entries
        let query = db
          .select({
            id: researchEntries.id,
            setupId: researchEntries.setupId,
            setupName: researchSetups.name
          })
          .from(researchEntries)
          .leftJoin(researchSetups, eq(researchEntries.setupId, researchSetups.id))
          .$dynamic()

        const conditions: any[] = []
        if (filters?.setupId) conditions.push(eq(researchEntries.setupId, filters.setupId))
        if (filters?.symbolId) conditions.push(eq(researchEntries.symbolId, filters.symbolId))
        if (filters?.sessionName) conditions.push(eq(researchEntries.sessionName, filters.sessionName))
        if (filters?.timeframe) conditions.push(eq(researchEntries.timeframe, filters.timeframe))
        if (filters?.news !== undefined) conditions.push(eq(researchEntries.news, filters.news))
        if (filters?.quality) conditions.push(eq(researchEntries.quality, filters.quality))
        if (filters?.startDate) conditions.push(gte(researchEntries.entryDatetime, filters.startDate))
        if (filters?.endDate) {
          const endLimit = filters.endDate.length === 10 ? `${filters.endDate}T23:59:59` : filters.endDate
          conditions.push(lte(researchEntries.entryDatetime, endLimit))
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions))
        }

        const entries = query.all()
        const totalEntries = entries.length

        if (totalEntries === 0) {
          return {
            success: true,
            data: {
              totalEntries: 0,
              setupId: filters?.setupId,
              zoneMetrics: []
            }
          }
        }

        const entryIds = entries.map((e) => e.id)

        // 2. Query zones for these entries
        const zones = db
          .select({
            id: researchEntryZones.id,
            researchEntryId: researchEntryZones.researchEntryId,
            customColumnId: researchEntryZones.customColumnId,
            columnName: researchCustomColumns.name,
            bias: researchEntryZones.bias,
            minRr: researchEntryZones.minRr,
            maxRr: researchEntryZones.maxRr,
            minSlPoints: researchEntryZones.minSlPoints,
            maxSlPoints: researchEntryZones.maxSlPoints,
            isMissed: researchEntryZones.isMissed,
            outcome: researchEntryZones.outcome
          })
          .from(researchEntryZones)
          .leftJoin(
            researchCustomColumns,
            eq(researchEntryZones.customColumnId, researchCustomColumns.id)
          )
          .where(inArray(researchEntryZones.researchEntryId, entryIds))
          .all()

        // 3. Group by customColumnId and compute metrics
        const columnMap = new Map<
          number,
          {
            columnName: string
            records: typeof zones
          }
        >()

        for (const z of zones) {
          const colId = z.customColumnId
          if (!columnMap.has(colId)) {
            columnMap.set(colId, {
              columnName: z.columnName || `Column #${colId}`,
              records: []
            })
          }
          columnMap.get(colId)!.records.push(z)
        }

        const zoneMetrics: ZoneComparisonMetric[] = []

        for (const [colId, colData] of columnMap.entries()) {
          const totalSamples = colData.records.length
          const missedCount = colData.records.filter((r) => r.isMissed).length
          const filledRecords = colData.records.filter((r) => !r.isMissed)
          const filledCount = filledRecords.length

          const fillRate = totalSamples > 0 ? (filledCount / totalSamples) * 100 : 0
          const missRate = totalSamples > 0 ? (missedCount / totalSamples) * 100 : 0

          let winCount = 0
          let lossCount = 0
          let beCount = 0
          let winMinRrSum = 0
          let minRrSum = 0
          let maxRrSum = 0
          let slPointsSum = 0
          let slPointsCount = 0

          for (const r of filledRecords) {
            const minRr = r.minRr !== null && r.minRr !== undefined ? Number(r.minRr) : null
            const maxRr = r.maxRr !== null && r.maxRr !== undefined ? Number(r.maxRr) : null
            const minSl =
              r.minSlPoints !== null && r.minSlPoints !== undefined ? Number(r.minSlPoints) : null

            if (minSl !== null && !isNaN(minSl)) {
              slPointsSum += minSl
              slPointsCount++
            }

            if (minRr !== null && !isNaN(minRr)) {
              minRrSum += minRr
              if (minRr > 0) {
                winCount++
                winMinRrSum += minRr
              } else if (minRr === -1) {
                lossCount++
              } else if (minRr === 0) {
                beCount++
              } else if (minRr < 0) {
                lossCount++
              }
            } else if (r.outcome === 'loss') {
              lossCount++
            } else if (r.outcome === 'win') {
              winCount++
            } else if (r.outcome === 'be') {
              beCount++
            }

            if (maxRr !== null && !isNaN(maxRr)) {
              maxRrSum += maxRr
            }
          }

          const winRate = filledCount > 0 ? (winCount / filledCount) * 100 : 0
          const lossRate = filledCount > 0 ? (lossCount / filledCount) * 100 : 0
          const avgMinRr = filledCount > 0 ? minRrSum / filledCount : 0
          const avgMaxRr = filledCount > 0 ? maxRrSum / filledCount : 0
          const avgSlPoints = slPointsCount > 0 ? slPointsSum / slPointsCount : 0
          const avgWinMinRr = winCount > 0 ? winMinRrSum / winCount : 0

          // EV = (WinRate% * AvgWinRR) - (LossRate% * 1)
          const expectedValue = (winRate / 100) * avgWinMinRr - (lossRate / 100) * 1

          zoneMetrics.push({
            customColumnId: colId,
            columnName: colData.columnName,
            totalSamples,
            filledCount,
            missedCount,
            fillRate: Number(fillRate.toFixed(1)),
            missRate: Number(missRate.toFixed(1)),
            winCount,
            lossCount,
            beCount,
            winRate: Number(winRate.toFixed(1)),
            lossRate: Number(lossRate.toFixed(1)),
            avgMinRr: Number(avgMinRr.toFixed(2)),
            avgMaxRr: Number(avgMaxRr.toFixed(2)),
            avgSlPoints: Number(avgSlPoints.toFixed(1)),
            expectedValue: Number(expectedValue.toFixed(2))
          })
        }

        // Calculate badges
        let bestEvZoneId: number | null = null
        let maxEv = -Infinity
        let highestWinRateZoneId: number | null = null
        let maxWinRate = -1
        let lowestMissRateZoneId: number | null = null
        let minMissRate = Infinity
        let highestMaxRrZoneId: number | null = null
        let maxPeakRr = -Infinity

        for (const m of zoneMetrics) {
          if (m.totalSamples >= 1) {
            if (m.expectedValue > maxEv) {
              maxEv = m.expectedValue
              bestEvZoneId = m.customColumnId
            }
            if (m.filledCount >= 1 && m.winRate > maxWinRate) {
              maxWinRate = m.winRate
              highestWinRateZoneId = m.customColumnId
            }
            if (m.missRate < minMissRate) {
              minMissRate = m.missRate
              lowestMissRateZoneId = m.customColumnId
            }
            if (m.avgMaxRr > maxPeakRr) {
              maxPeakRr = m.avgMaxRr
              highestMaxRrZoneId = m.customColumnId
            }
          }
        }

        return {
          success: true,
          data: {
            totalEntries,
            setupId: filters?.setupId,
            setupName: entries[0]?.setupName || undefined,
            zoneMetrics,
            bestEvZoneId,
            highestWinRateZoneId,
            lowestMissRateZoneId,
            highestMaxRrZoneId
          }
        }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // ==========================================
  // --- Research Export Handlers ---
  // ==========================================

  // Export research data to AI Markdown / JSON
  ipcMain.handle('research:exportAi', async (event, payload: ResearchExportPayload) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return { success: false, error: 'No active window found' }
    return await exportResearchAiReportToFile(window, payload)
  })

  // Generate research AI report content string (e.g. for Copy to Clipboard)
  ipcMain.handle(
    'research:generateAiReport',
    async (_, payload: ResearchExportPayload & { format?: 'md' | 'json' }) => {
      try {
        const isJson = payload.format === 'json'
        const content = isJson
          ? generateResearchAiJson(payload)
          : generateResearchAiMarkdown(payload)
        return { success: true, content, format: isJson ? 'json' : 'md' }
      } catch (error: any) {
        return { success: false, error: error?.message || 'Failed to generate research AI report' }
      }
    }
  )

  // Export research entries and zone metrics to Excel (.xlsx) / CSV
  ipcMain.handle(
    'research:exportExcel',
    async (
      event,
      payload: {
        entries: any[]
        analytics?: any
        setupName?: string
        defaultName?: string
      }
    ) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) return { success: false, error: 'No active window found' }
      return await exportResearchTradesToExcel(window, payload)
    }
  )
}
