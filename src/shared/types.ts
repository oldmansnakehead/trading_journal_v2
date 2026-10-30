export interface IpcResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface Setup {
  id: number
  name: string
  description: string
  type: string
  created_at: string
  updated_at: string
}

export interface SetupPlaybookFlow {
  id?: number
  setupId: number
  flowData: {
    nodes: any[]
    edges: any[]
    viewport?: { x: number; y: number; zoom: number }
  }
  createdAt?: string
  updatedAt?: string
}

// ==========================================
// --- Trade Research & Zone Statistics Types ---
// ==========================================

export interface ResearchSetup {
  id: number
  name: string
  description?: string | null
  type: string
  enableExitDate: boolean
  createdAt: string
  updatedAt: string
}

export interface ResearchSession {
  id: number
  setupId: number
  startTime: string
  endTime: string
  sessionName: string
  createdAt: string
  updatedAt: string
}

export interface ResearchPlaybook {
  id: number
  setupId: number
  content: string
  createdAt: string
  updatedAt: string
}

export interface ResearchPlaybookFlow {
  id?: number
  setupId: number
  flowData: {
    nodes: any[]
    edges: any[]
    viewport?: { x: number; y: number; zoom: number }
  }
  createdAt?: string
  updatedAt?: string
}

export interface ResearchCustomColumn {
  id: number
  name: string
  type: string // zone_group, single_selector, multiple_selector, checkbox, string, number
  options?: string[] | null
  defaultValue?: any
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface ResearchSetupCustomColumn {
  id: number
  setupId: number
  customColumnId: number
  orderIndex: number
  createdAt: string
  updatedAt: string
  column?: ResearchCustomColumn
}

export interface ResearchEntryZoneInput {
  customColumnId: number
  bias?: 'Bullish' | 'Bearish' | string
  minRr?: number | null
  maxRr?: number | null
  slPoints?: number | null
  realSlPoints?: number | null
  minSlPoints?: number | null
  maxSlPoints?: number | null
  isMissed?: boolean
  outcome?: 'win' | 'loss' | 'be' | 'missed'
  notes?: string | null
}

export interface ResearchEntryZone extends ResearchEntryZoneInput {
  id: number
  researchEntryId: number
  customColumnName?: string
  createdAt: string
  updatedAt: string
}

export interface ResearchEntryInput {
  setupId: number
  symbolId: number
  entryDatetime: string
  exitDatetime?: string | null
  sessionName?: string | null
  timeframe?: string | null
  news?: boolean
  quality?: string | null
  images?: string[]
  notes?: string | null
  customData?: Record<string | number, any> | null
  zones: ResearchEntryZoneInput[]
}

export interface ResearchEntry {
  id: number
  setupId: number
  setupName?: string
  symbolId: number
  symbolName?: string
  entryDatetime: string
  exitDatetime?: string | null
  sessionName?: string | null
  timeframe?: string | null
  news?: boolean
  quality?: string | null
  images?: string[]
  notes?: string | null
  customData?: Record<string | number, any> | null
  zones: ResearchEntryZone[]
  createdAt: string
  updatedAt: string
}

export interface ZoneComparisonMetric {
  customColumnId: number
  columnName: string
  totalSamples: number
  filledCount: number
  missedCount: number
  fillRate: number // % (0-100)
  missRate: number // % (0-100)
  winCount: number
  lossCount: number
  beCount: number
  winRate: number // % (0-100) based on filled trades
  lossRate: number // % (0-100) based on filled trades
  avgMinRr: number
  avgMaxRr: number
  avgSlPoints: number
  avgRealSlPoints?: number
  expectedValue: number // EV score
}

export interface ResearchAnalyticsSummary {
  totalEntries: number
  setupId?: number
  setupName?: string
  zoneMetrics: ZoneComparisonMetric[]
  bestEvZoneId?: number | null
  highestWinRateZoneId?: number | null
  lowestMissRateZoneId?: number | null
  highestMaxRrZoneId?: number | null
}

export interface ResearchFilters {
  setupId?: number
  symbolId?: number
  sessionName?: string
  timeframe?: string
  news?: boolean
  quality?: string
  bias?: string
  startDate?: string
  endDate?: string
}

export interface ResearchExportPayload {
  setupName?: string
  setupDescription?: string
  playbookContent?: string
  filters?: ResearchFilters
  analytics?: ResearchAnalyticsSummary
  entries: any[]
  format?: 'md' | 'json'
  defaultName?: string
}

