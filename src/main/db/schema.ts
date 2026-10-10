import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// --- Symbols ---
export const symbols = sqliteTable('symbols', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(), // e.g., XAUUSD, EURUSD
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// --- Setups ---
export const setups = sqliteTable('setups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // demo, real
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// --- Setup Sessions ---
export const setupSessions = sqliteTable('setup_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  setupId: integer('setup_id')
    .notNull()
    .references(() => setups.id, { onDelete: 'cascade' }),
  startTime: text('start_time').notNull(), // HH:mm
  endTime: text('end_time').notNull(), // HH:mm
  sessionName: text('session_name').notNull(), // Asia, Tokyo, London, London Close, New York
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// --- Setup Playbooks ---
export const setupPlaybooks = sqliteTable('setup_playbooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  setupId: integer('setup_id')
    .notNull()
    .references(() => setups.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})


// --- Custom Columns ---
export const customColumns = sqliteTable('custom_columns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  setupId: integer('setup_id')
    .notNull()
    .references(() => setups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // checkbox, multiple_selector, single_selector, number, string, boolean
  options: text('options', { mode: 'json' }), // JSON Array of strings for selectors
  reportFilter: integer('report_filter', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// --- Journal Entries ---
export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  setupId: integer('setup_id')
    .notNull()
    .references(() => setups.id, { onDelete: 'cascade' }),
  entryDatetime: text('entry_datetime').notNull(),
  exitDatetime: text('exit_datetime'),
  symbolId: integer('symbol_id')
    .notNull()
    .references(() => symbols.id),
  sessionName: text('session_name'),
  position: text('position'), // Buy, Sell
  directionBias: text('direction_bias'), // Bullish, Bearish
  entryTimeframe: text('entry_timeframe'),
  news: integer('news', { mode: 'boolean' }).default(false),
  quality: text('quality'), // Red, Orange, Yellow, Blue, Green
  isTest: integer('is_test', { mode: 'boolean' }).default(false),
  images: text('images', { mode: 'json' }), // JSON Array of image paths
  notes: text('notes'),

  // Normal RR Data
  normalRr: real('normal_rr'),
  normalMaxRr: real('normal_max_rr'),
  normalSlPoints: real('normal_sl_points'),
  normalTpPoints: real('normal_tp_points'),

  // Break Even RR Data
  beRr: real('be_rr'),
  beMaxRr: real('be_max_rr'),
  beSlPoints: real('be_sl_points'),
  beTpPoints: real('be_tp_points'),

  // Trail + Break Even RR Data
  trailRr: real('trail_rr'),
  trailMaxRr: real('trail_max_rr'),
  trailSlPoints: real('trail_sl_points'),
  trailTpPoints: real('trail_tp_points'),

  // Custom Column Data (JSON map of custom_column_id -> value)
  customData: text('custom_data', { mode: 'json' }),

  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})
