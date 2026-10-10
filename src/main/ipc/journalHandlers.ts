import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { journalEntries, symbols, setups } from '../db/schema'
import { eq, sql, desc } from 'drizzle-orm'

export const registerJournalHandlers = () => {
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
          beRr: journalEntries.beRr,
          trailRr: journalEntries.trailRr,
          normalTpPoints: journalEntries.normalTpPoints,
          normalSlPoints: journalEntries.normalSlPoints,
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
}
