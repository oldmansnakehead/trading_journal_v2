import { getDb } from './client'
import {
  symbols,
  setups,
  setupSessions,
  setupPlaybooks,
  customColumns,
  setupCustomColumns,
  journalEntries
} from './schema'
import fs from 'fs'
import path from 'path'

export interface SeedJsonStructure {
  symbols: Array<{ name: string }>
  setups: Array<{
    name: string
    type?: string
    description?: string
    sessions?: Array<{ sessionName: string; startTime: string; endTime: string }>
    playbook?: string
    customColumns?: Array<{
      name: string
      type: string
      options?: string[]
      reportFilter?: boolean
      description?: string
    }>
  }>
  journalEntries: Array<{
    setupName: string
    symbol: string
    entryDatetime: string
    exitDatetime?: string
    sessionName?: string
    position?: string
    directionBias?: string
    entryTimeframe?: string
    news?: boolean
    quality?: string
    isTest?: boolean
    images?: string[] | null
    notes?: string
    normalSlPoints?: number
    normalRr?: number
    normalMaxRr?: number
    normalTpPoints?: number
    beSlPoints?: number | null
    beRr?: number | null
    beMaxRr?: number | null
    beTpPoints?: number | null
    trailSlPoints?: number | null
    trailRr?: number | null
    trailMaxRr?: number | null
    trailTpPoints?: number | null
    customData?: Record<string, any>
  }>
}

export async function seed(customSeedFilePath?: string) {
  const db = getDb()
  if (!db) throw new Error('Database not initialized')

  const seedFilePath =
    customSeedFilePath || path.resolve(__dirname, '../../src/main/db/seed-data.json')

  if (!fs.existsSync(seedFilePath)) {
    console.warn(`Seed data file not found at ${seedFilePath}. Skipping seed.`)
    return
  }

  const seedData: SeedJsonStructure = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'))

  try {
    console.log('Clearing existing data...')
    db.delete(journalEntries).run()
    db.delete(setupCustomColumns).run()
    db.delete(customColumns).run()
    db.delete(setupPlaybooks).run()
    db.delete(setupSessions).run()
    db.delete(setups).run()
    db.delete(symbols).run()

    console.log(`Inserting ${seedData.symbols?.length || 0} symbols...`)
    const symbolMap = new Map<string, number>()
    if (seedData.symbols && seedData.symbols.length > 0) {
      const inserted = db
        .insert(symbols)
        .values(seedData.symbols.map((s) => ({ name: s.name })))
        .returning()
        .all()
      inserted.forEach((s) => symbolMap.set(s.name, s.id))
    }

    console.log(`Inserting ${seedData.setups?.length || 0} setups...`)
    const setupMap = new Map<string, number>()
    const colByNameMap = new Map<string, number>()
    const customColMap = new Map<string, number>() // `${setupId}:${colName}` -> colId

    for (const setupItem of seedData.setups || []) {
      const insertedSetup = db
        .insert(setups)
        .values({
          name: setupItem.name,
          type: setupItem.type || 'real',
          description: setupItem.description
        })
        .returning()
        .get()

      setupMap.set(setupItem.name, insertedSetup.id)

      if (setupItem.sessions && setupItem.sessions.length > 0) {
        db.insert(setupSessions)
          .values(
            setupItem.sessions.map((sess) => ({
              setupId: insertedSetup.id,
              sessionName: sess.sessionName,
              startTime: sess.startTime,
              endTime: sess.endTime
            }))
          )
          .run()
      }

      if (setupItem.playbook) {
        db.insert(setupPlaybooks)
          .values({
            setupId: insertedSetup.id,
            content: setupItem.playbook
          })
          .run()
      }

      if (setupItem.customColumns && setupItem.customColumns.length > 0) {
        for (let i = 0; i < setupItem.customColumns.length; i++) {
          const col = setupItem.customColumns[i]
          let colId = colByNameMap.get(col.name)
          if (!colId) {
            const insertedCol = db
              .insert(customColumns)
              .values({
                setupId: null,
                name: col.name,
                type: col.type,
                options: col.options || null,
                reportFilter: !!col.reportFilter,
                description: col.description || null
              })
              .returning()
              .get()
            colId = insertedCol.id
            colByNameMap.set(col.name, colId)
          }

          db.insert(setupCustomColumns)
            .values({
              setupId: insertedSetup.id,
              customColumnId: colId,
              orderIndex: i,
              isRequired: false
            })
            .run()

          customColMap.set(`${insertedSetup.id}:${col.name}`, colId)
        }
      }
    }

    console.log(`Inserting ${seedData.journalEntries?.length || 0} journal entries...`)
    for (const entry of seedData.journalEntries || []) {
      const setupId = setupMap.get(entry.setupName)
      const symbolId = symbolMap.get(entry.symbol)

      if (!setupId || !symbolId) continue

      const dbCustomData: Record<string, any> = {}
      if (entry.customData && typeof entry.customData === 'object') {
        for (const [key, val] of Object.entries(entry.customData)) {
          const colId = customColMap.get(`${setupId}:${key}`)
          if (colId !== undefined) {
            dbCustomData[colId] = val
          }
          dbCustomData[key] = val
        }
      }

      db.insert(journalEntries)
        .values({
          setupId,
          symbolId,
          entryDatetime: entry.entryDatetime,
          exitDatetime: entry.exitDatetime,
          sessionName: entry.sessionName,
          position: entry.position,
          directionBias: entry.directionBias,
          entryTimeframe: entry.entryTimeframe,
          news: !!entry.news,
          quality: entry.quality,
          isTest: !!entry.isTest,
          images: entry.images || null,
          notes: entry.notes,
          normalSlPoints: entry.normalSlPoints,
          normalRr: entry.normalRr,
          normalMaxRr: entry.normalMaxRr,
          normalTpPoints: entry.normalTpPoints,
          beSlPoints: entry.beSlPoints,
          beRr: entry.beRr,
          beMaxRr: entry.beMaxRr,
          beTpPoints: entry.beTpPoints,
          trailSlPoints: entry.trailSlPoints,
          trailRr: entry.trailRr,
          trailMaxRr: entry.trailMaxRr,
          trailTpPoints: entry.trailTpPoints,
          customData: Object.keys(dbCustomData).length > 0 ? dbCustomData : null
        })
        .run()
    }

    console.log('✅ Database seeding complete from seed-data.json!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}
