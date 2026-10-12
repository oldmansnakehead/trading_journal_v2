import { ipcMain, BrowserWindow } from 'electron'
import { getDb } from '../db/client'
import { journalEntries, symbols, setups } from '../db/schema'
import { eq, sql, desc, inArray } from 'drizzle-orm'
import { exportTradesToExcel } from '../services/excelExport'
import {
  exportAiReportToFile,
  generateAiMarkdownReport,
  generateAiJsonReport,
  AiExportPayload
} from '../services/aiExport'

export const registerJournalHandlers = () => {
  ipcMain.handle('journal:get', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db
        .select({
          id: journalEntries.id,
          entryDatetime: journalEntries.entryDatetime,
          exitDatetime: journalEntries.exitDatetime,
          position: journalEntries.position,
          directionBias: journalEntries.directionBias,
          entryTimeframe: journalEntries.entryTimeframe,
          news: journalEntries.news,
          quality: journalEntries.quality,
          isTest: journalEntries.isTest,
          images: journalEntries.images,
          notes: journalEntries.notes,
          normalRr: journalEntries.normalRr,
          normalMaxRr: journalEntries.normalMaxRr,
          normalSlPoints: journalEntries.normalSlPoints,
          normalTpPoints: journalEntries.normalTpPoints,
          beRr: journalEntries.beRr,
          beMaxRr: journalEntries.beMaxRr,
          beSlPoints: journalEntries.beSlPoints,
          beTpPoints: journalEntries.beTpPoints,
          trailRr: journalEntries.trailRr,
          trailMaxRr: journalEntries.trailMaxRr,
          trailSlPoints: journalEntries.trailSlPoints,
          trailTpPoints: journalEntries.trailTpPoints,
          sessionName: journalEntries.sessionName,
          customData: journalEntries.customData,
          setupId: journalEntries.setupId,
          symbolId: journalEntries.symbolId,
          symbolName: symbols.name,
          setupName: setups.name
        })
        .from(journalEntries)
        .leftJoin(symbols, eq(journalEntries.symbolId, symbols.id))
        .leftJoin(setups, eq(journalEntries.setupId, setups.id))
        .where(eq(journalEntries.id, id))
        .get()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get all trades with basic related data
  ipcMain.handle('journal:list', async () => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      const result = db
        .select({
          id: journalEntries.id,
          entryDatetime: journalEntries.entryDatetime,
          exitDatetime: journalEntries.exitDatetime,
          position: journalEntries.position,
          quality: journalEntries.quality,
          normalRr: journalEntries.normalRr,
          normalMaxRr: journalEntries.normalMaxRr,
          beRr: journalEntries.beRr,
          beMaxRr: journalEntries.beMaxRr,
          trailRr: journalEntries.trailRr,
          trailMaxRr: journalEntries.trailMaxRr,
          normalTpPoints: journalEntries.normalTpPoints,
          normalSlPoints: journalEntries.normalSlPoints,
          sessionName: journalEntries.sessionName,
          customData: journalEntries.customData,
          setupId: journalEntries.setupId,
          symbolId: journalEntries.symbolId,
          symbolName: symbols.name,
          setupName: setups.name,
          isTest: journalEntries.isTest
        })
        .from(journalEntries)
        .leftJoin(symbols, eq(journalEntries.symbolId, symbols.id))
        .leftJoin(setups, eq(journalEntries.setupId, setups.id))
        .orderBy(desc(journalEntries.entryDatetime))
        .all()

      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get KPIs for the dashboard
  ipcMain.handle('journal:kpi', async (_, mode: 'normal' | 'be' | 'trail' = 'normal') => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')

      // Determine which RR column to use
      let rrCol: any = journalEntries.normalRr
      if (mode === 'be') rrCol = journalEntries.beRr
      if (mode === 'trail') rrCol = journalEntries.trailRr

      const stats = db
        .select({
          totalTrades: sql<number>`count(*)`,
          wins: sql<number>`sum(case when ${rrCol} > 0 then 1 else 0 end)`,
          losses: sql<number>`sum(case when ${rrCol} <= 0 then 1 else 0 end)`,
          totalRr: sql<number>`sum(${rrCol})`,
          avgRr: sql<number>`avg(${rrCol})`
        })
        .from(journalEntries)
        .where(eq(journalEntries.isTest, false)) // Exclude paper trades from main KPIs?
        .get()

      return { success: true, data: stats }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Create a journal entry
  ipcMain.handle('journal:create', async (_, data) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      const result = db.insert(journalEntries).values(data).returning().get()
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Delete a single journal entry
  ipcMain.handle('journal:delete', async (_, id: number) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      db.delete(journalEntries).where(eq(journalEntries.id, id)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Delete multiple journal entries
  ipcMain.handle('journal:deleteMany', async (_, ids: number[]) => {
    try {
      const db = getDb()
      if (!db) throw new Error('Database not initialized')
      if (!ids || ids.length === 0) return { success: true }
      db.delete(journalEntries).where(inArray(journalEntries.id, ids)).run()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Export filtered trades and KPIs to Excel / CSV
  ipcMain.handle(
    'journal:exportExcel',
    async (
      event,
      payload: {
        trades: any[]
        kpis?: any
        statMode?: string
        filters?: any
        defaultName?: string
      }
    ) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) return { success: false, error: 'No active window found' }
      return await exportTradesToExcel(window, payload)
    }
  )

  // Export filtered trades and KPIs to AI Markdown / JSON
  ipcMain.handle('journal:exportAi', async (event, payload: AiExportPayload) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return { success: false, error: 'No active window found' }
    return await exportAiReportToFile(window, payload)
  })

  // Generate AI Markdown or JSON report content string (e.g. for Copy to Clipboard)
  ipcMain.handle(
    'journal:generateAiReport',
    async (_, payload: AiExportPayload & { format?: 'md' | 'json' }) => {
      try {
        const isJson = payload.format === 'json'
        const content = isJson
          ? generateAiJsonReport(payload)
          : generateAiMarkdownReport(payload)
        return { success: true, content, format: isJson ? 'json' : 'md' }
      } catch (error: any) {
        return { success: false, error: error?.message || 'Failed to generate AI report' }
      }
    }
  )
}
