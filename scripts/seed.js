const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

// Ensure execution runs inside Electron's Node runtime to match better-sqlite3 ABI
if (process.env.ELECTRON_RUN_AS_NODE !== '1') {
  const electron = require('electron')
  const result = spawnSync(electron, [__filename, ...process.argv.slice(2)], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'inherit'
  })
  process.exit(result.status ?? 0)
}

const Database = require('better-sqlite3')
const { drizzle } = require('drizzle-orm/better-sqlite3')
const { migrate } = require('drizzle-orm/better-sqlite3/migrator')

function getDbPath() {
  if (process.env.DB_PATH) {
    return path.resolve(process.env.DB_PATH)
  }

  const appName = 'trading_journal_v2'
  let dataDir = ''

  if (process.platform === 'win32') {
    dataDir = path.join(process.env.APPDATA || '', appName)
  } else if (process.platform === 'darwin') {
    dataDir = path.join(process.env.HOME || '', 'Library', 'Application Support', appName)
  } else {
    dataDir = path.join(process.env.HOME || '', '.config', appName)
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  return path.join(dataDir, 'data.db')
}

async function runSeed() {
  const dbPath = getDbPath()
  console.log(`\n======================================================`)
  console.log(`🚀 Seeding Database: ${dbPath}`)
  console.log(`======================================================\n`)

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite)

  // 1. Run migrations to ensure all tables exist
  console.log('🔄 Checking / running migrations...')
  const migrationsFolder = path.resolve(__dirname, '../src/main/db/migrations')
  try {
    migrate(db, { migrationsFolder })
    console.log('✅ Migrations up to date.')
  } catch (migErr) {
    console.error('Warning during migration:', migErr.message)
  }

  // 2. Load seed-data.json
  const seedJsonPath = path.resolve(__dirname, '../src/main/db/seed-data.json')
  if (!fs.existsSync(seedJsonPath)) {
    throw new Error(`Seed file not found at: ${seedJsonPath}`)
  }

  const seedData = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'))
  console.log(`📦 Loaded seed-data.json successfully.`)

  // 3. Clear existing data in transaction
  console.log('🧹 Clearing existing records in all tables...')
  sqlite.exec(`
    DELETE FROM journal_entries;
    DELETE FROM setup_custom_columns;
    DELETE FROM custom_columns;
    DELETE FROM setup_playbooks;
    DELETE FROM setup_sessions;
    DELETE FROM setups;
    DELETE FROM symbols;
    DELETE FROM sqlite_sequence WHERE name IN ('journal_entries', 'setup_custom_columns', 'custom_columns', 'setup_playbooks', 'setup_sessions', 'setups', 'symbols');
  `)

  // 4. Insert Symbols
  console.log(`📥 Inserting ${seedData.symbols?.length || 0} symbols...`)
  const insertSymbolStmt = sqlite.prepare(`
    INSERT INTO symbols (name, created_at, updated_at)
    VALUES (?, datetime('now'), datetime('now'))
  `)
  const symbolMap = new Map() // name -> id

  const insertAllSymbols = sqlite.transaction((items) => {
    for (const sym of items) {
      const info = insertSymbolStmt.run(sym.name)
      symbolMap.set(sym.name, info.lastInsertRowid)
    }
  })
  insertAllSymbols(seedData.symbols || [])

  // 5. Insert Setups, Sessions, Playbooks & Custom Columns
  console.log(`📥 Inserting ${seedData.setups?.length || 0} setups with sessions, playbooks & custom fields...`)
  const insertSetupStmt = sqlite.prepare(`
    INSERT INTO setups (name, type, description, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `)

  const insertSessionStmt = sqlite.prepare(`
    INSERT INTO setup_sessions (setup_id, session_name, start_time, end_time, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `)

  const insertPlaybookStmt = sqlite.prepare(`
    INSERT INTO setup_playbooks (setup_id, content, created_at, updated_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `)

  const insertColStmt = sqlite.prepare(`
    INSERT INTO custom_columns (setup_id, name, type, options, report_filter, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `)

  const insertLinkStmt = sqlite.prepare(`
    INSERT INTO setup_custom_columns (setup_id, custom_column_id, is_required, order_index, created_at, updated_at)
    VALUES (?, ?, 0, ?, datetime('now'), datetime('now'))
  `)

  const setupMap = new Map() // name -> id
  const colByNameMap = new Map() // name -> id
  const customColMap = new Map() // setupId:colName -> id

  const insertAllSetups = sqlite.transaction((setupItems) => {
    for (const s of setupItems) {
      const setupInfo = insertSetupStmt.run(s.name, s.type || 'real', s.description || null)
      const setupId = Number(setupInfo.lastInsertRowid)
      setupMap.set(s.name, setupId)

      // Sessions
      if (s.sessions && Array.isArray(s.sessions)) {
        for (const sess of s.sessions) {
          insertSessionStmt.run(setupId, sess.sessionName, sess.startTime, sess.endTime)
        }
      }

      // Playbook
      if (s.playbook) {
        insertPlaybookStmt.run(setupId, s.playbook)
      }

      // Custom Columns
      if (s.customColumns && Array.isArray(s.customColumns)) {
        for (let order = 0; order < s.customColumns.length; order++) {
          const col = s.customColumns[order]
          let colId = colByNameMap.get(col.name)
          if (!colId) {
            const optionsJson = col.options ? JSON.stringify(col.options) : null
            const reportFilterVal = col.reportFilter ? 1 : 0
            const colInfo = insertColStmt.run(
              null, // Shared in library
              col.name,
              col.type,
              optionsJson,
              reportFilterVal,
              col.description || null
            )
            colId = Number(colInfo.lastInsertRowid)
            colByNameMap.set(col.name, colId)
          }

          // Link column to setup in setup_custom_columns
          insertLinkStmt.run(setupId, colId, order)
          customColMap.set(`${setupId}:${col.name}`, colId)
        }
      }
    }
  })
  insertAllSetups(seedData.setups || [])

  // 6. Insert Journal Entries
  const journalEntries = seedData.journalEntries || []
  console.log(`📥 Inserting ${journalEntries.length} journal trade entries...`)

  const insertTradeStmt = sqlite.prepare(`
    INSERT INTO journal_entries (
      setup_id,
      symbol_id,
      entry_datetime,
      exit_datetime,
      session_name,
      position,
      direction_bias,
      entry_timeframe,
      news,
      quality,
      is_test,
      images,
      notes,
      normal_sl_points,
      normal_rr,
      normal_max_rr,
      normal_tp_points,
      be_sl_points,
      be_rr,
      be_max_rr,
      be_tp_points,
      trail_sl_points,
      trail_rr,
      trail_max_rr,
      trail_tp_points,
      custom_data,
      created_at,
      updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      datetime('now'), datetime('now')
    )
  `)

  let tradeCount = 0
  const insertAllTrades = sqlite.transaction((trades) => {
    for (const t of trades) {
      const setupId = setupMap.get(t.setupName)
      if (!setupId) {
        console.warn(`Warning: Setup "${t.setupName}" not found. Skipping trade.`);
        continue
      }

      const symbolId = symbolMap.get(t.symbol)
      if (!symbolId) {
        console.warn(`Warning: Symbol "${t.symbol}" not found. Skipping trade.`);
        continue
      }

      // Map customData: convert column names to column IDs while retaining names
      let dbCustomData = {}
      if (t.customData && typeof t.customData === 'object') {
        for (const [key, val] of Object.entries(t.customData)) {
          const colId = customColMap.get(`${setupId}:${key}`)
          if (colId !== undefined) {
            dbCustomData[colId] = val
          }
          // Also store with key name for named lookups like MAE
          dbCustomData[key] = val
        }
      }

      const customDataJson = Object.keys(dbCustomData).length > 0 ? JSON.stringify(dbCustomData) : null
      const imagesJson = t.images && t.images.length > 0 ? JSON.stringify(t.images) : null

      insertTradeStmt.run(
        setupId,
        symbolId,
        t.entryDatetime,
        t.exitDatetime || null,
        t.sessionName || null,
        t.position || null,
        t.directionBias || null,
        t.entryTimeframe || null,
        t.news ? 1 : 0,
        t.quality || null,
        t.isTest ? 1 : 0,
        imagesJson,
        t.notes || null,
        t.normalSlPoints ?? null,
        t.normalRr ?? null,
        t.normalMaxRr ?? null,
        t.normalTpPoints ?? null,
        t.beSlPoints ?? null,
        t.beRr ?? null,
        t.beMaxRr ?? null,
        t.beTpPoints ?? null,
        t.trailSlPoints ?? null,
        t.trailRr ?? null,
        t.trailMaxRr ?? null,
        t.trailTpPoints ?? null,
        customDataJson
      )
      tradeCount++
    }
  })

  insertAllTrades(journalEntries)

  // 7. Checkpoint WAL and finalize
  sqlite.pragma('wal_checkpoint(TRUNCATE)')
  sqlite.close()

  console.log(`\n======================================================`)
  console.log(`🎉 Seeding Completed Successfully!`)
  console.log(`- Symbols: ${symbolMap.size}`)
  console.log(`- Setups: ${setupMap.size}`)
  console.log(`- Custom Columns: ${customColMap.size}`)
  console.log(`- Journal Entries: ${tradeCount} trades inserted`)
  console.log(`======================================================\n`)
}

runSeed().catch((err) => {
  console.error('\n❌ Fatal Seeding Error:', err)
  process.exit(1)
})
