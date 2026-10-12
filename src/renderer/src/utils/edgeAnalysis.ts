/**
 * Edge Analysis Engine
 * Calculates Performance by Setup, R-Multiple Distribution, Day x Hour Heatmap, and MAE / MFE Excursion Metrics.
 */

import { TradeRecord, StatMode, getTradeRr, getTradeRecordedMaxRr } from './statistics'

export interface SetupRecord {
  id: number
  name: string
  type?: string
  description?: string
}

export interface SetupPerformanceItem {
  setupId: number | string
  setupName: string
  setupType: string
  totalTrades: number
  share: number // % of total trades
  wins: number
  losses: number
  breakEvens: number
  winRate: number // %
  totalRr: number // Net R
  avgRr: number // Expectancy (R)
  grossProfitRr: number
  grossLossRr: number
  profitFactor: number
  avgWinRr: number
  avgLossRr: number
  maxRr: number
  avgMaxRr: number | null // Potential MFE
  countMaxRr: number
  kellyPct: number // Kelly Criterion % (Edge sizing)
  isBestExpectancy?: boolean
  isBestProfitFactor?: boolean
}

export interface SetupPerformanceResult {
  items: SetupPerformanceItem[]
  totalTrades: number
  bestExpectancySetupId: number | string | null
  bestProfitFactorSetupId: number | string | null
}

/**
 * Calculate Performance by Setup comparing all setups (e.g. HA Model vs SMC Classic)
 */
export function calculatePerformanceBySetup(
  trades: TradeRecord[],
  knownSetups: SetupRecord[] = [],
  mode: StatMode = 'normal'
): SetupPerformanceResult {
  const total = trades.length
  if (total === 0 && knownSetups.length === 0) {
    return {
      items: [],
      totalTrades: 0,
      bestExpectancySetupId: null,
      bestProfitFactorSetupId: null
    }
  }

  // Setup map lookup
  const setupMap = new Map<number | string, { name: string; type: string }>()
  knownSetups.forEach((s) => {
    setupMap.set(s.id, { name: s.name, type: s.type || 'real' })
  })

  // Group trades by setupId
  interface SetupAccumulator {
    setupId: number | string
    setupName: string
    setupType: string
    trades: TradeRecord[]
  }

  const groups = new Map<number | string, SetupAccumulator>()

  // Initialize known setups
  knownSetups.forEach((s) => {
    groups.set(s.id, {
      setupId: s.id,
      setupName: s.name,
      setupType: s.type || 'real',
      trades: []
    })
  })

  // Distribute trades
  trades.forEach((t) => {
    const rawId = t.setupId ?? 'unassigned'
    if (!groups.has(rawId)) {
      const name = t.setupName || (rawId === 'unassigned' ? 'Unassigned' : `Setup #${rawId}`)
      groups.set(rawId, {
        setupId: rawId,
        setupName: name,
        setupType: 'real',
        trades: []
      })
    }
    groups.get(rawId)!.trades.push(t)
  })

  const items: SetupPerformanceItem[] = []

  groups.forEach((group) => {
    const gTrades = group.trades
    const count = gTrades.length

    let wins = 0
    let losses = 0
    let breakEvens = 0
    let totalRr = 0
    let grossProfitRr = 0
    let grossLossRr = 0
    let maxRr = 0
    let sumMaxRr = 0
    let countMaxRr = 0

    gTrades.forEach((t) => {
      const rr = getTradeRr(t, mode)
      const recMax = getTradeRecordedMaxRr(t, mode)

      totalRr += rr
      if (rr > 0) {
        wins++
        grossProfitRr += rr
      } else if (rr < 0) {
        losses++
        grossLossRr += Math.abs(rr)
      } else {
        breakEvens++
      }

      const effectivePeak = recMax !== null ? Math.max(rr, recMax) : rr
      if (effectivePeak > maxRr) {
        maxRr = effectivePeak
      }

      if (recMax !== null && recMax > 0) {
        sumMaxRr += recMax
        countMaxRr++
      }
    })

    const winRate = count > 0 ? Number(((wins / count) * 100).toFixed(1)) : 0
    const avgRr = count > 0 ? Number((totalRr / count).toFixed(2)) : 0
    const avgWinRr = wins > 0 ? Number((grossProfitRr / wins).toFixed(2)) : 0
    const avgLossRr = losses > 0 ? Number((grossLossRr / losses).toFixed(2)) : 0

    let profitFactor = 0
    if (grossLossRr > 0) {
      profitFactor = Number((grossProfitRr / grossLossRr).toFixed(2))
    } else if (grossProfitRr > 0) {
      profitFactor = 999.0
    }

    // Kelly Criterion calculation: K% = W - (1 - W) / R (where R is avgWin / avgLoss)
    let kellyPct = 0
    if (wins > 0 && losses > 0 && avgLossRr > 0) {
      const w = wins / (wins + losses)
      const rRatio = avgWinRr / avgLossRr
      const k = w - (1 - w) / rRatio
      kellyPct = Math.max(0, Number((k * 100).toFixed(1)))
    }

    const share = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
    const avgMaxRr = countMaxRr > 0 ? Number((sumMaxRr / countMaxRr).toFixed(2)) : null

    items.push({
      setupId: group.setupId,
      setupName: group.setupName,
      setupType: group.setupType,
      totalTrades: count,
      share,
      wins,
      losses,
      breakEvens,
      winRate,
      totalRr: Number(totalRr.toFixed(2)),
      avgRr,
      grossProfitRr: Number(grossProfitRr.toFixed(2)),
      grossLossRr: Number(grossLossRr.toFixed(2)),
      profitFactor,
      avgWinRr,
      avgLossRr,
      maxRr: Number(maxRr.toFixed(2)),
      avgMaxRr,
      countMaxRr,
      kellyPct
    })
  })

  // Sort by Expectancy descending, then totalTrades descending
  items.sort((a, b) => {
    if (b.avgRr !== a.avgRr) return b.avgRr - a.avgRr
    return b.totalTrades - a.totalTrades
  })

  // Determine best setups among setups with at least 1 trade
  const activeItems = items.filter((i) => i.totalTrades > 0)
  let bestExpectancySetupId: number | string | null = null
  let bestProfitFactorSetupId: number | string | null = null

  if (activeItems.length > 0) {
    const highestExp = [...activeItems].sort((a, b) => b.avgRr - a.avgRr)[0]
    if (highestExp.avgRr > 0) {
      bestExpectancySetupId = highestExp.setupId
      highestExp.isBestExpectancy = true
    }

    const highestPf = [...activeItems].sort((a, b) => b.profitFactor - a.profitFactor)[0]
    if (highestPf.profitFactor > 1.0) {
      bestProfitFactorSetupId = highestPf.setupId
      highestPf.isBestProfitFactor = true
    }
  }

  return {
    items,
    totalTrades: total,
    bestExpectancySetupId,
    bestProfitFactorSetupId
  }
}

// ---------------------------------------------------------------------------
// 1.1 Multi-Cohort Setup Comparison (เปรียบเทียบ Setup อิสระหลายเงื่อนไข)
// ---------------------------------------------------------------------------

export interface CohortInput {
  id: string
  name: string
  color: string
  filterSummary?: string
  trades: TradeRecord[]
}

export interface CohortPerformanceItem {
  id: string
  name: string
  color: string
  filterSummary: string
  totalTrades: number
  share: number
  wins: number
  losses: number
  breakEvens: number
  winRate: number
  totalRr: number
  avgRr: number
  grossProfitRr: number
  grossLossRr: number
  profitFactor: number
  avgWinRr: number
  avgLossRr: number
  maxRr: number
  avgMaxRr: number | null
  countMaxRr: number
  kellyPct: number
  isBestExpectancy?: boolean
  isBestProfitFactor?: boolean
}

export interface CohortPerformanceResult {
  items: CohortPerformanceItem[]
  totalTrades: number
  bestExpectancyCohortId: string | null
  bestProfitFactorCohortId: string | null
  headToHeadDelta?: {
    tradeDiff: number
    winRateDiff: number
    expectancyDiff: number
    profitFactorDiff: number
    netRrDiff: number
  } | null
}

/**
 * Calculate performance comparison across unlimited setup filter cohorts
 */
export function calculateCohortsPerformance(
  cohorts: CohortInput[],
  mode: StatMode = 'normal'
): CohortPerformanceResult {
  const totalTrades = cohorts.reduce((acc, c) => acc + c.trades.length, 0)
  const items: CohortPerformanceItem[] = []

  cohorts.forEach((cohort) => {
    const cTrades = cohort.trades
    const count = cTrades.length

    let wins = 0
    let losses = 0
    let breakEvens = 0
    let totalRr = 0
    let grossProfitRr = 0
    let grossLossRr = 0
    let maxRr = 0
    let sumMaxRr = 0
    let countMaxRr = 0

    cTrades.forEach((t) => {
      const rr = getTradeRr(t, mode)
      const recMax = getTradeRecordedMaxRr(t, mode)

      totalRr += rr
      if (rr > 0) {
        wins++
        grossProfitRr += rr
      } else if (rr < 0) {
        losses++
        grossLossRr += Math.abs(rr)
      } else {
        breakEvens++
      }

      const effectivePeak = recMax !== null ? Math.max(rr, recMax) : rr
      if (effectivePeak > maxRr) {
        maxRr = effectivePeak
      }

      if (recMax !== null && recMax > 0) {
        sumMaxRr += recMax
        countMaxRr++
      }
    })

    const winRate = count > 0 ? Number(((wins / count) * 100).toFixed(1)) : 0
    const avgRr = count > 0 ? Number((totalRr / count).toFixed(2)) : 0
    const avgWinRr = wins > 0 ? Number((grossProfitRr / wins).toFixed(2)) : 0
    const avgLossRr = losses > 0 ? Number((grossLossRr / losses).toFixed(2)) : 0

    let profitFactor = 0
    if (grossLossRr > 0) {
      profitFactor = Number((grossProfitRr / grossLossRr).toFixed(2))
    } else if (grossProfitRr > 0) {
      profitFactor = 999.0
    }

    let kellyPct = 0
    if (wins > 0 && losses > 0 && avgLossRr > 0) {
      const w = wins / (wins + losses)
      const rRatio = avgWinRr / avgLossRr
      const k = w - (1 - w) / rRatio
      kellyPct = Math.max(0, Number((k * 100).toFixed(1)))
    }

    const share = totalTrades > 0 ? Number(((count / totalTrades) * 100).toFixed(1)) : 0
    const avgMaxRr = countMaxRr > 0 ? Number((sumMaxRr / countMaxRr).toFixed(2)) : null

    items.push({
      id: cohort.id,
      name: cohort.name,
      color: cohort.color,
      filterSummary: cohort.filterSummary || '',
      totalTrades: count,
      share,
      wins,
      losses,
      breakEvens,
      winRate,
      totalRr: Number(totalRr.toFixed(2)),
      avgRr,
      grossProfitRr: Number(grossProfitRr.toFixed(2)),
      grossLossRr: Number(grossLossRr.toFixed(2)),
      profitFactor,
      avgWinRr,
      avgLossRr,
      maxRr: Number(maxRr.toFixed(2)),
      avgMaxRr,
      countMaxRr,
      kellyPct
    })
  })

  // Identify best expectancy and best profit factor
  const activeItems = items.filter((i) => i.totalTrades > 0)
  let bestExpectancyCohortId: string | null = null
  let bestProfitFactorCohortId: string | null = null

  if (activeItems.length > 0) {
    const highestExp = [...activeItems].sort((a, b) => b.avgRr - a.avgRr)[0]
    if (highestExp.avgRr > 0) {
      bestExpectancyCohortId = highestExp.id
      highestExp.isBestExpectancy = true
    }

    const highestPf = [...activeItems].sort((a, b) => b.profitFactor - a.profitFactor)[0]
    if (highestPf.profitFactor > 1.0) {
      bestProfitFactorCohortId = highestPf.id
      highestPf.isBestProfitFactor = true
    }
  }

  // Head-to-Head Delta if exactly 2 cohorts
  let headToHeadDelta: CohortPerformanceResult['headToHeadDelta'] = null
  if (items.length === 2) {
    const first = items[0]
    const second = items[1]
    headToHeadDelta = {
      tradeDiff: first.totalTrades - second.totalTrades,
      winRateDiff: Number((first.winRate - second.winRate).toFixed(1)),
      expectancyDiff: Number((first.avgRr - second.avgRr).toFixed(2)),
      profitFactorDiff: Number((first.profitFactor - second.profitFactor).toFixed(2)),
      netRrDiff: Number((first.totalRr - second.totalRr).toFixed(2))
    }
  }

  return {
    items,
    totalTrades,
    bestExpectancyCohortId,
    bestProfitFactorCohortId,
    headToHeadDelta
  }
}

// ---------------------------------------------------------------------------
// 2. R-Multiple Distribution
// ---------------------------------------------------------------------------

export interface RDistributionBin {
  label: string
  min: number // inclusive lower bound
  max: number // exclusive upper bound, infinity for top bin
  count: number
  pct: number
  colorType: 'loss' | 'be' | 'win'
}

export interface RDistributionResult {
  bins: RDistributionBin[]
  totalTrades: number
  meanRr: number
  medianRr: number
  stdDevRr: number
  skewness: number
  top3SharePct: number // % of total positive R from top 3 trades
  top10PercentSharePct: number // % of total positive R from top 10% trades
  isConcentratedInFewOutliers: boolean
  highestR: number
  lowestR: number
}

/**
 * Standard fixed R-multiple bins for trading journals
 */
const DEFAULT_R_BINS: {
  label: string
  min: number
  max: number
  colorType: 'loss' | 'be' | 'win'
}[] = [
  { label: '< -1R', min: -Infinity, max: -1.0001, colorType: 'loss' },
  { label: '-1R', min: -1.0001, max: -0.9999, colorType: 'loss' },
  { label: '(-1, 0)R', min: -0.9999, max: -0.0001, colorType: 'loss' },
  { label: '0R (BE)', min: -0.0001, max: 0.0001, colorType: 'be' },
  { label: '(0, 1]R', min: 0.0001, max: 1.0001, colorType: 'win' },
  { label: '(1, 2]R', min: 1.0001, max: 2.0001, colorType: 'win' },
  { label: '(2, 3]R', min: 2.0001, max: 3.0001, colorType: 'win' },
  { label: '(3, 5]R', min: 3.0001, max: 5.0001, colorType: 'win' },
  { label: '> 5R', min: 5.0001, max: Infinity, colorType: 'win' }
]

/**
 * Calculate R-Multiple Distribution and Outlier Concentration analysis
 */
export function calculateRDistribution(
  trades: TradeRecord[],
  mode: StatMode = 'normal'
): RDistributionResult {
  const total = trades.length
  if (total === 0) {
    return {
      bins: DEFAULT_R_BINS.map((b) => ({ ...b, count: 0, pct: 0 })),
      totalTrades: 0,
      meanRr: 0,
      medianRr: 0,
      stdDevRr: 0,
      skewness: 0,
      top3SharePct: 0,
      top10PercentSharePct: 0,
      isConcentratedInFewOutliers: false,
      highestR: 0,
      lowestR: 0
    }
  }

  const rValues: number[] = trades.map((t) => getTradeRr(t, mode))
  rValues.sort((a, b) => a - b)

  const lowestR = rValues[0]
  const highestR = rValues[rValues.length - 1]

  // Bins initialization
  const bins: RDistributionBin[] = DEFAULT_R_BINS.map((b) => ({
    label: b.label,
    min: b.min,
    max: b.max,
    count: 0,
    pct: 0,
    colorType: b.colorType
  }))

  // Fill bins
  rValues.forEach((r) => {
    for (const bin of bins) {
      if (r >= bin.min && r < bin.max) {
        bin.count++
        break
      }
    }
  })

  bins.forEach((b) => {
    b.pct = Number(((b.count / total) * 100).toFixed(1))
  })

  // Descriptive stats
  const sum = rValues.reduce((acc, v) => acc + v, 0)
  const meanRr = Number((sum / total).toFixed(2))

  // Median
  const mid = Math.floor(total / 2)
  const medianRr =
    total % 2 !== 0 ? rValues[mid] : Number(((rValues[mid - 1] + rValues[mid]) / 2).toFixed(2))

  // Standard Deviation
  const variance = rValues.reduce((acc, v) => acc + Math.pow(v - meanRr, 2), 0) / total
  const stdDevRr = Number(Math.sqrt(variance).toFixed(2))

  // Skewness: Sample skewness
  let skewness = 0
  if (stdDevRr > 0) {
    const m3 = rValues.reduce((acc, v) => acc + Math.pow(v - meanRr, 3), 0) / total
    skewness = Number((m3 / Math.pow(stdDevRr, 3)).toFixed(2))
  }

  // Profit concentration test: Are profits coming from a few outsized trades?
  const positiveRs = rValues.filter((r) => r > 0).sort((a, b) => b - a)
  const totalPositiveR = positiveRs.reduce((acc, v) => acc + v, 0)

  let top3SharePct = 0
  let top10PercentSharePct = 0

  if (totalPositiveR > 0) {
    const top3Sum = positiveRs.slice(0, 3).reduce((acc, v) => acc + v, 0)
    top3SharePct = Number(((top3Sum / totalPositiveR) * 100).toFixed(1))

    const top10Count = Math.max(1, Math.ceil(positiveRs.length * 0.1))
    const top10Sum = positiveRs.slice(0, top10Count).reduce((acc, v) => acc + v, 0)
    top10PercentSharePct = Number(((top10Sum / totalPositiveR) * 100).toFixed(1))
  }

  // Heavy concentration condition: Top 3 trades account for >= 60% of total profit (if >= 6 winning trades)
  const isConcentratedInFewOutliers = positiveRs.length >= 6 && top3SharePct >= 60

  return {
    bins,
    totalTrades: total,
    meanRr,
    medianRr,
    stdDevRr,
    skewness,
    top3SharePct,
    top10PercentSharePct,
    isConcentratedInFewOutliers,
    highestR: Number(highestR.toFixed(2)),
    lowestR: Number(lowestR.toFixed(2))
  }
}

// ---------------------------------------------------------------------------
// 3. Day x Hour Heatmap
// ---------------------------------------------------------------------------

export interface HeatmapCell {
  dayIndex: number // 0 = Sun, 1 = Mon ... 6 = Sat
  dayName: string
  hour: number // 0 .. 23
  totalTrades: number
  wins: number
  losses: number
  breakEvens: number
  winRate: number | null
  netRr: number
  avgRr: number | null
}

export interface DaySummary {
  dayIndex: number
  dayName: string
  totalTrades: number
  winRate: number | null
  netRr: number
  avgRr: number | null
}

export interface HourSummary {
  hour: number
  totalTrades: number
  winRate: number | null
  netRr: number
  avgRr: number | null
}

export interface HeatmapResult {
  matrix: HeatmapCell[][] // [dayIndex][hour]
  daySummaries: DaySummary[]
  hourSummaries: HourSummary[]
  bestWindow: HeatmapCell | null
  worstWindow: HeatmapCell | null
  totalTrades: number
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Calculate Day x Hour performance heatmap
 */
export function calculateDayHourHeatmap(
  trades: TradeRecord[],
  mode: StatMode = 'normal'
): HeatmapResult {
  // Initialize matrix 7 days x 24 hours
  const matrix: HeatmapCell[][] = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => ({
      dayIndex: d,
      dayName: DAY_NAMES[d],
      hour: h,
      totalTrades: 0,
      wins: 0,
      losses: 0,
      breakEvens: 0,
      winRate: null,
      netRr: 0,
      avgRr: null
    }))
  )

  trades.forEach((trade) => {
    if (!trade.entryDatetime) return
    const date = new Date(trade.entryDatetime)
    if (isNaN(date.getTime())) return

    const d = date.getDay()
    const h = date.getHours()

    const rr = getTradeRr(trade, mode)
    const cell = matrix[d][h]

    cell.totalTrades++
    cell.netRr += rr
    if (rr > 0) cell.wins++
    else if (rr < 0) cell.losses++
    else cell.breakEvens++
  })

  let bestCell: HeatmapCell | null = null
  let worstCell: HeatmapCell | null = null

  // Finalize cells
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const cell = matrix[d][h]
      cell.netRr = Number(cell.netRr.toFixed(2))
      if (cell.totalTrades > 0) {
        cell.winRate = Number(((cell.wins / cell.totalTrades) * 100).toFixed(1))
        cell.avgRr = Number((cell.netRr / cell.totalTrades).toFixed(2))

        if (!bestCell || cell.netRr > bestCell.netRr) {
          bestCell = cell
        }
        if (!worstCell || cell.netRr < worstCell.netRr) {
          worstCell = cell
        }
      }
    }
  }

  // Day summaries
  const daySummaries: DaySummary[] = Array.from({ length: 7 }, (_, d) => {
    let dayTrades = 0
    let dayWins = 0
    let dayNetRr = 0

    for (let h = 0; h < 24; h++) {
      const c = matrix[d][h]
      dayTrades += c.totalTrades
      dayWins += c.wins
      dayNetRr += c.netRr
    }

    return {
      dayIndex: d,
      dayName: DAY_NAMES[d],
      totalTrades: dayTrades,
      winRate: dayTrades > 0 ? Number(((dayWins / dayTrades) * 100).toFixed(1)) : null,
      netRr: Number(dayNetRr.toFixed(2)),
      avgRr: dayTrades > 0 ? Number((dayNetRr / dayTrades).toFixed(2)) : null
    }
  })

  // Hour summaries
  const hourSummaries: HourSummary[] = Array.from({ length: 24 }, (_, h) => {
    let hourTrades = 0
    let hourWins = 0
    let hourNetRr = 0

    for (let d = 0; d < 7; d++) {
      const c = matrix[d][h]
      hourTrades += c.totalTrades
      hourWins += c.wins
      hourNetRr += c.netRr
    }

    return {
      hour: h,
      totalTrades: hourTrades,
      winRate: hourTrades > 0 ? Number(((hourWins / hourTrades) * 100).toFixed(1)) : null,
      netRr: Number(hourNetRr.toFixed(2)),
      avgRr: hourTrades > 0 ? Number((hourNetRr / hourTrades).toFixed(2)) : null
    }
  })

  return {
    matrix,
    daySummaries,
    hourSummaries,
    bestWindow: bestCell && bestCell.netRr > 0 ? bestCell : null,
    worstWindow: worstCell && worstCell.netRr < 0 ? worstCell : null,
    totalTrades: trades.length
  }
}

// ---------------------------------------------------------------------------
// 4. MAE / MFE Scatter Plot & Excursion Analysis
// ---------------------------------------------------------------------------

export interface MaeMfeTradePoint {
  id: number | string
  entryDatetime: string
  symbolName: string
  setupName: string
  realizedRr: number
  maxRr: number // Potential MFE
  mae: number // Maximum Adverse Excursion (in R, typically <= 0)
  leftOnTableRr: number
  captureEfficiencyPct: number | null
  isReversalLoss: boolean // Win turned into loss
  isEarlyExit: boolean // Left significant R on table
}

export interface MaeMfeScatterResult {
  points: MaeMfeTradePoint[]
  totalTradesWithMfe: number
  avgCaptureEfficiencyPct: number
  totalLeftOnTableRr: number
  reversalLossesCount: number
  reversalLossesLostRr: number
  maxObservedMfe: number
  worstObservedMae: number
}

/**
 * Extract MAE (Maximum Adverse Excursion) from trade
 * If custom column has MAE, use it.
 * If loss, MAE is -1.0R (hit SL) unless otherwise specified.
 * If win with no MAE recorded, default is 0 or parsed from customData.
 */
export function extractTradeMae(trade: TradeRecord): number {
  // Check customData
  if (trade.customData) {
    let cd: any = trade.customData
    if (typeof cd === 'string') {
      try {
        cd = JSON.parse(cd)
      } catch {
        cd = {}
      }
    }
    for (const key of Object.keys(cd)) {
      if (key.toLowerCase() === 'mae' || key.toLowerCase().includes('adverse')) {
        const val = parseFloat(cd[key])
        if (!isNaN(val)) return val < 0 ? val : -Math.abs(val)
      }
    }
  }

  if (typeof trade.normalMae === 'number') {
    return trade.normalMae < 0 ? trade.normalMae : -Math.abs(trade.normalMae)
  }

  // Loss default: stopped out at full SL = -1.0R
  const normalRr = Number(trade.normalRr ?? 0)
  if (normalRr < 0) {
    return normalRr
  }

  return 0
}

/**
 * Calculate MAE / MFE Scatter points and efficiency metrics
 */
export function calculateMaeMfeScatter(
  trades: TradeRecord[],
  mode: StatMode = 'normal'
): MaeMfeScatterResult {
  const points: MaeMfeTradePoint[] = []

  let sumEfficiency = 0
  let countEfficiency = 0
  let totalLeftOnTableRr = 0
  let reversalLossesCount = 0
  let reversalLossesLostRr = 0
  let maxObservedMfe = 0
  let worstObservedMae = 0

  trades.forEach((t) => {
    const realizedRr = getTradeRr(t, mode)
    const recMaxRr = getTradeRecordedMaxRr(t, mode)
    const effectiveMfe =
      recMaxRr !== null ? Math.max(recMaxRr, realizedRr) : Math.max(0, realizedRr)
    const mae = extractTradeMae(t)

    if (effectiveMfe > maxObservedMfe) {
      maxObservedMfe = effectiveMfe
    }
    if (mae < worstObservedMae) {
      worstObservedMae = mae
    }

    // Left on table: difference between peak potential MFE and realized positive outcome
    let leftOnTable = 0
    if (effectiveMfe > 0 && effectiveMfe > realizedRr) {
      leftOnTable = Number((effectiveMfe - Math.max(0, realizedRr)).toFixed(2))
      totalLeftOnTableRr += leftOnTable
    }

    // Capture efficiency for winners: (realized / MFE) * 100
    let captureEfficiency: number | null = null
    if (realizedRr > 0 && effectiveMfe > 0) {
      captureEfficiency = Number(Math.min(100, (realizedRr / effectiveMfe) * 100).toFixed(1))
      sumEfficiency += captureEfficiency
      countEfficiency++
    }

    // Reversal loss: Trade was in >= 1R profit, but ended up as a loss
    const isReversalLoss = realizedRr < 0 && effectiveMfe >= 1.0
    if (isReversalLoss) {
      reversalLossesCount++
      reversalLossesLostRr += Math.abs(realizedRr)
    }

    // Early exit: realized RR is less than half of potential MFE (for MFE >= 2R)
    const isEarlyExit = realizedRr > 0 && effectiveMfe >= 2.0 && realizedRr <= effectiveMfe * 0.5

    points.push({
      id: t.id ?? Math.random(),
      entryDatetime: t.entryDatetime,
      symbolName: t.symbolName || 'Trade',
      setupName: t.setupName || 'Setup',
      realizedRr,
      maxRr: Number(effectiveMfe.toFixed(2)),
      mae: Number(mae.toFixed(2)),
      leftOnTableRr: leftOnTable,
      captureEfficiencyPct: captureEfficiency,
      isReversalLoss,
      isEarlyExit
    })
  })

  const avgCaptureEfficiencyPct =
    countEfficiency > 0 ? Number((sumEfficiency / countEfficiency).toFixed(1)) : 0

  return {
    points,
    totalTradesWithMfe: points.filter((p) => p.maxRr > 0).length,
    avgCaptureEfficiencyPct,
    totalLeftOnTableRr: Number(totalLeftOnTableRr.toFixed(2)),
    reversalLossesCount,
    reversalLossesLostRr: Number(reversalLossesLostRr.toFixed(2)),
    maxObservedMfe: Number(maxObservedMfe.toFixed(2)),
    worstObservedMae: Number(worstObservedMae.toFixed(2))
  }
}
