/**
 * Trading Journal Statistics Engine
 * Pure calculations for KPIs, Directional Performance, and Session Metrics.
 */

export interface TradeRecord {
  id?: number | string
  entryDatetime: string
  exitDatetime?: string | null
  symbolId?: number | string
  sessionName?: string | null
  position?: string | null // 'Buy' | 'Sell'
  isTest?: boolean | number | null // Paper trade flag
  normalRr?: number | null
  normalMaxRr?: number | null
  beRr?: number | null
  beMaxRr?: number | null
  trailRr?: number | null
  trailMaxRr?: number | null
  [key: string]: any
}

export type StatMode = 'normal' | 'be' | 'trail'
export type ReturnCalculation = 'simple' | 'log'

export interface SimulationConfig {
  initialBalance: number
  riskPerTrade: number // in percentage, e.g. 1 = 1%
  returnCalculation: ReturnCalculation
}

/**
 * Get trade realized RR based on StatMode
 */
export function getTradeRr(trade: TradeRecord, mode: StatMode = 'normal'): number {
  if (mode === 'normal') return Number(trade.normalRr ?? 0)
  if (mode === 'be') return Number(trade.beRr ?? trade.normalRr ?? 0)
  if (mode === 'trail') return Number(trade.trailRr ?? trade.normalRr ?? 0)
  return 0
}

/**
 * Get pure recorded MFE / Max RR for a trade (NO fallback to realized RR)
 */
export function getTradeRecordedMaxRr(trade: TradeRecord, mode: StatMode = 'normal'): number | null {
  let val: any = null
  if (mode === 'normal') val = trade.normalMaxRr
  else if (mode === 'be') val = trade.beMaxRr ?? trade.normalMaxRr
  else if (mode === 'trail') val = trade.trailMaxRr ?? trade.normalMaxRr

  if (val !== null && val !== undefined && val !== '' && !isNaN(Number(val))) {
    return Number(val)
  }
  return null
}

export interface KpiResults {
  totalTrades: number
  winRate: number // %
  wins: number
  losses: number
  breakEvens: number
  grossProfit: number // $
  grossLoss: number // $
  netPnl: number // $
  profitFactor: number
  avgWin: number // $
  avgLoss: number // $
  finalBalance: number // $
  totalRr: number // R
  avgRr: number // Expectancy (R) = totalRr / totalTrades
  avgWinLossRr: number // Payoff Ratio = avgWin / avgLoss
  avgWinRr: number // R
  maxRr: number // Peak single trade RR
  avgMaxRr: number | null // Potential MFE (R), null if no MFE recorded
  countMaxRr: number // Number of trades with recorded MFE
  consecWins: number
  consecLosses: number
  maxDrawdown: number // % (positive number for calculations, e.g. 0.99)
}

/**
 * Calculate complete KPIs for a collection of trades
 */
export function calculateKpis(
  trades: TradeRecord[],
  mode: StatMode = 'normal',
  sim: SimulationConfig = { initialBalance: 10000, riskPerTrade: 1, returnCalculation: 'simple' }
): KpiResults {
  const total = trades.length
  const initialBalance = Number(sim.initialBalance) || 10000
  const riskPercent = (Number(sim.riskPerTrade) || 1) / 100
  const fixedRiskAmount = initialBalance * riskPercent
  const isSimple = sim.returnCalculation === 'simple'

  if (total === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      wins: 0,
      losses: 0,
      breakEvens: 0,
      grossProfit: 0,
      grossLoss: 0,
      netPnl: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      finalBalance: initialBalance,
      totalRr: 0,
      avgRr: 0,
      avgWinLossRr: 0,
      avgWinRr: 0,
      maxRr: 0,
      avgMaxRr: null,
      countMaxRr: 0,
      consecWins: 0,
      consecLosses: 0,
      maxDrawdown: 0
    }
  }

  let wins = 0
  let losses = 0
  let breakEvens = 0
  let grossProfit = 0
  let grossLoss = 0
  let totalRr = 0
  let winningRr = 0
  let currentBalance = initialBalance
  let peak = currentBalance
  let maxDrawdown = 0

  let consecWins = 0
  let currentWins = 0
  let consecLosses = 0
  let currentLosses = 0

  let maxSingleRr = 0
  let sumMaxRr = 0
  let countMaxRr = 0

  for (const trade of trades) {
    const rr = getTradeRr(trade, mode)
    const recMaxRr = getTradeRecordedMaxRr(trade, mode)

    totalRr += rr

    const riskAmount = isSimple ? fixedRiskAmount : currentBalance * riskPercent
    const pnl = riskAmount * rr
    currentBalance += pnl

    // Effective single trade peak for Max RR
    const effectivePeakRr = recMaxRr !== null ? Math.max(rr, recMaxRr) : rr
    if (effectivePeakRr > maxSingleRr) {
      maxSingleRr = effectivePeakRr
    }

    // Only count pure recorded MFE (do NOT fallback to realized RR)
    if (recMaxRr !== null && recMaxRr > 0) {
      sumMaxRr += recMaxRr
      countMaxRr++
    }

    if (rr > 0) {
      wins++
      winningRr += rr
      grossProfit += pnl
      currentWins++
      currentLosses = 0
      if (currentWins > consecWins) consecWins = currentWins
    } else if (rr < 0) {
      losses++
      grossLoss += Math.abs(pnl)
      currentLosses++
      currentWins = 0
      if (currentLosses > consecLosses) consecLosses = currentLosses
    } else {
      breakEvens++
      currentWins = 0
      currentLosses = 0
    }

    if (currentBalance > peak) peak = currentBalance
    const dd = peak > 0 ? ((peak - currentBalance) / peak) * 100 : 0
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  const netPnl = grossProfit - grossLoss

  // Profit Factor: Gross Profit / Gross Loss
  let profitFactor = 0
  if (grossLoss > 0) {
    profitFactor = Number((grossProfit / grossLoss).toFixed(2))
  } else if (grossProfit > 0) {
    profitFactor = 999.0
  }

  // Avg Win / Avg Loss ($)
  const avgWin = wins > 0 ? Number((grossProfit / wins).toFixed(2)) : 0
  const avgLoss = losses > 0 ? Number((grossLoss / losses).toFixed(2)) : 0

  const finalBalance = Number((initialBalance + netPnl).toFixed(2))

  // Payoff Ratio: Avg Win $ / Avg Loss $
  const avgWinLossRr =
    avgLoss > 0
      ? Number((avgWin / avgLoss).toFixed(3))
      : wins > 0
        ? Number((winningRr / wins).toFixed(3))
        : 0

  const avgWinRr = wins > 0 ? Number((winningRr / wins).toFixed(2)) : 0
  const avgMaxRr = countMaxRr > 0 ? Number((sumMaxRr / countMaxRr).toFixed(2)) : null

  return {
    totalTrades: total,
    winRate: Number(((wins / total) * 100).toFixed(1)),
    wins,
    losses,
    breakEvens,
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    netPnl: Number(netPnl.toFixed(2)),
    profitFactor,
    avgWin,
    avgLoss,
    finalBalance,
    totalRr: Number(totalRr.toFixed(2)),
    avgRr: Number((totalRr / total).toFixed(2)),
    avgWinLossRr: Number(avgWinLossRr.toFixed(2)), // formatted e.g. 1.88
    avgWinRr,
    maxRr: Number(maxSingleRr.toFixed(2)),
    avgMaxRr,
    countMaxRr,
    consecWins,
    consecLosses,
    maxDrawdown: Number(maxDrawdown.toFixed(2))
  }
}

export interface PositionSideStats {
  total: number
  wins: number
  losses: number
  breakEvens: number
  grossProfit: number
  grossLoss: number
  netPnl: number
  winRate: number
  totalRr: number
  avgRr: number // Expectancy in R
  share: number // % of total trades
}

export interface PositionPerformanceResult {
  buy: PositionSideStats
  sell: PositionSideStats
}

export const DIRECTION_BIAS_THRESHOLD = 55 // %

export function calculatePositionPerformance(
  trades: TradeRecord[],
  mode: StatMode = 'normal',
  sim: SimulationConfig = { initialBalance: 10000, riskPerTrade: 1, returnCalculation: 'simple' }
): PositionPerformanceResult {
  const isSimple = sim.returnCalculation === 'simple'
  const initialBalance = Number(sim.initialBalance) || 10000
  const riskPercent = (Number(sim.riskPerTrade) || 1) / 100
  const fixedRiskAmount = initialBalance * riskPercent

  const buy: PositionSideStats = {
    total: 0,
    wins: 0,
    losses: 0,
    breakEvens: 0,
    grossProfit: 0,
    grossLoss: 0,
    netPnl: 0,
    winRate: 0,
    totalRr: 0,
    avgRr: 0,
    share: 0
  }

  const sell: PositionSideStats = {
    total: 0,
    wins: 0,
    losses: 0,
    breakEvens: 0,
    grossProfit: 0,
    grossLoss: 0,
    netPnl: 0,
    winRate: 0,
    totalRr: 0,
    avgRr: 0,
    share: 0
  }

  let currentBalance = initialBalance

  for (const trade of trades) {
    const rr = getTradeRr(trade, mode)
    const riskAmount = isSimple ? fixedRiskAmount : currentBalance * riskPercent
    const pnl = riskAmount * rr
    currentBalance += pnl

    const pos = (trade.position || '').toLowerCase()
    const isSell = pos === 'sell' || pos === 'short'
    const target = isSell ? sell : buy

    target.total++
    target.totalRr += rr
    if (rr > 0) {
      target.wins++
      target.grossProfit += pnl
    } else if (rr < 0) {
      target.losses++
      target.grossLoss += Math.abs(pnl)
    } else {
      target.breakEvens++
    }
  }

  const totalCount = trades.length || 1

  buy.netPnl = Number((buy.grossProfit - buy.grossLoss).toFixed(2))
  buy.winRate = buy.total > 0 ? Number(((buy.wins / buy.total) * 100).toFixed(1)) : 0
  buy.avgRr = buy.total > 0 ? Number((buy.totalRr / buy.total).toFixed(2)) : 0
  buy.share = Number(((buy.total / totalCount) * 100).toFixed(1))

  sell.netPnl = Number((sell.grossProfit - sell.grossLoss).toFixed(2))
  sell.winRate = sell.total > 0 ? Number(((sell.wins / sell.total) * 100).toFixed(1)) : 0
  sell.avgRr = sell.total > 0 ? Number((sell.totalRr / sell.total).toFixed(2)) : 0
  sell.share = Number(((sell.total / totalCount) * 100).toFixed(1))

  return { buy, sell }
}

export interface SessionMetricsEntry {
  session: string
  total: number
  wins: number
  losses: number
  be: number
  sumRr: number
  avgRr: number | null
  winRate: number | null
  netPnl: number | null
}

export interface SessionMultiMetricsResult {
  labels: string[]
  activeSessionNames: string[]
  stats: Record<string, SessionMetricsEntry>
  winRateData: (number | null)[]
  totalTradesData: number[]
  avgRrData: (number | null)[]
  profitData: (number | null)[]
}

/**
 * Multi-Dimensional Session Performance
 * Preserves user sessions without unauthorized merging (e.g. AS vs Asia, LD vs London)
 */
export function calculateSessionPerformance(
  trades: TradeRecord[],
  mode: StatMode = 'normal',
  sim: SimulationConfig = { initialBalance: 10000, riskPerTrade: 1, returnCalculation: 'simple' },
  extraKnownSessions: string[] = []
): SessionMultiMetricsResult {
  const isSimple = sim.returnCalculation === 'simple'
  const initialBalance = Number(sim.initialBalance) || 10000
  const riskPercent = (Number(sim.riskPerTrade) || 1) / 100
  const fixedRiskAmount = initialBalance * riskPercent

  // Collect unique sessions in order of appearance
  const sessionOrder: string[] = []
  const stats: Record<string, SessionMetricsEntry> = {}

  // Function to ensure a session is initialized
  const ensureSession = (name: string) => {
    const s = name.trim()
    if (!s) return
    if (!stats[s]) {
      stats[s] = {
        session: s,
        total: 0,
        wins: 0,
        losses: 0,
        be: 0,
        sumRr: 0,
        avgRr: null,
        winRate: null,
        netPnl: null
      }
      sessionOrder.push(s)
    }
  }

  // First register sessions with trades
  trades.forEach((trade) => {
    if (trade.sessionName && trade.sessionName.trim()) {
      ensureSession(trade.sessionName)
    }
  })

  // Then register extra known sessions from setups
  extraKnownSessions.forEach((s) => {
    ensureSession(s)
  })

  let runningBalance = initialBalance

  trades.forEach((trade) => {
    const rr = getTradeRr(trade, mode)
    const riskAmount = isSimple ? fixedRiskAmount : runningBalance * riskPercent
    const pnl = riskAmount * rr
    runningBalance += pnl

    const s = (trade.sessionName || '').trim()
    if (!s) return

    ensureSession(s)
    const st = stats[s]
    st.total++
    st.sumRr += rr
    st.netPnl = (st.netPnl ?? 0) + pnl
    if (rr > 0) st.wins++
    else if (rr < 0) st.losses++
    else st.be++
  })

  // Compute finalized metrics for each session
  sessionOrder.forEach((s) => {
    const st = stats[s]
    if (st.total > 0) {
      st.winRate = Number(((st.wins / st.total) * 100).toFixed(1))
      st.avgRr = Number((st.sumRr / st.total).toFixed(2))
      st.netPnl = Number(st.netPnl!.toFixed(2))
    } else {
      // 0 trades: values must be null / '-'
      st.winRate = null
      st.avgRr = null
      st.netPnl = null
    }
  })

  const labels = [...sessionOrder]
  const activeSessionNames = labels.filter((s) => stats[s].total > 0)

  const winRateData = labels.map((s) => stats[s].winRate)
  const totalTradesData = labels.map((s) => stats[s].total)
  const avgRrData = labels.map((s) => stats[s].avgRr)
  const profitData = labels.map((s) => stats[s].netPnl)

  return {
    labels,
    activeSessionNames,
    stats,
    winRateData,
    totalTradesData,
    avgRrData,
    profitData
  }
}
