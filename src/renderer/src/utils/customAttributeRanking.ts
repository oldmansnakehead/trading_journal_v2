export interface AttributeRankingItem {
  value: string
  label: string
  totalTrades: number
  sharePercent: number
  wins: number
  losses: number
  breakEvens: number
  winRate: number
  lossRate: number
  breakEvenRate: number
  avgRr: number
  totalNetR: number
  totalPnl: number
  profitFactor: number
  isTopPerformer: boolean
}

export interface AttributeRankingSummary {
  columnId: number
  columnName: string
  totalAnalyzedTrades: number
  items: AttributeRankingItem[]
}

/**
 * Parses options list safely from string, json, or array
 */
export function parseColumnOptions(options: any): string[] {
  if (!options) return []
  if (Array.isArray(options)) return options.map(String)
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      return options
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }
  return []
}

/**
 * Extracts trade realized RR based on selected statMode
 */
function getTradeRr(trade: any, statMode: 'normal' | 'be' | 'trail' = 'normal'): number {
  if (statMode === 'be') {
    return Number(trade.beRr ?? trade.be_rr ?? trade.normalRr ?? trade.normal_rr ?? 0)
  }
  if (statMode === 'trail') {
    return Number(trade.trailRr ?? trade.trail_rr ?? trade.normalRr ?? trade.normal_rr ?? 0)
  }
  return Number(trade.normalRr ?? trade.normal_rr ?? 0)
}

/**
 * Normalizes customData of a trade into a key-value record
 */
export function extractTradeCustomData(trade: any): Record<string, any> {
  if (!trade || !trade.customData) return {}
  if (typeof trade.customData === 'string') {
    try {
      return JSON.parse(trade.customData)
    } catch {
      return {}
    }
  }
  return typeof trade.customData === 'object' ? trade.customData : {}
}

/**
 * Computes performance ranking for a selected custom column across the given trades
 */
export function calculateAttributeRanking(
  trades: any[],
  column: { id: number; name: string; type?: string; options?: any },
  statMode: 'normal' | 'be' | 'trail' = 'normal'
): AttributeRankingSummary {
  const columnIdStr = String(column.id)
  const predefinedOptions = parseColumnOptions(column.options)

  // Map to collect stats per distinct value
  interface ValueStats {
    totalTrades: number
    wins: number
    losses: number
    breakEvens: number
    rList: number[]
    pnlList: number[]
    grossProfit: number
    grossLoss: number
  }

  const map = new Map<string, ValueStats>()

  const initStats = (): ValueStats => ({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    breakEvens: 0,
    rList: [],
    pnlList: [],
    grossProfit: 0,
    grossLoss: 0
  })

  // Pre-populate predefined options so even options with 0 trades appear
  for (const opt of predefinedOptions) {
    map.set(opt, initStats())
  }

  let totalAnalyzedTrades = 0

  for (const trade of trades) {
    const cd = extractTradeCustomData(trade)
    const val = cd[columnIdStr] ?? cd[column.name]

    if (val === undefined || val === null || val === '') {
      continue
    }

    const tradeRr = getTradeRr(trade, statMode)
    const tradePnl = Number(trade.pnl ?? 0)

    // Handle multiple values (e.g. multiple_selector or array)
    const values = Array.isArray(val) ? val.map(String) : [String(val)]

    for (const v of values) {
      if (!v.trim()) continue
      totalAnalyzedTrades++

      if (!map.has(v)) {
        map.set(v, initStats())
      }

      const st = map.get(v)!
      st.totalTrades++
      st.rList.push(tradeRr)
      st.pnlList.push(tradePnl)

      if (tradeRr > 0.05) {
        st.wins++
        st.grossProfit += tradePnl > 0 ? tradePnl : tradeRr
      } else if (tradeRr < -0.05) {
        st.losses++
        st.grossLoss += tradePnl < 0 ? Math.abs(tradePnl) : Math.abs(tradeRr)
      } else {
        st.breakEvens++
      }
    }
  }

  const items: AttributeRankingItem[] = []

  for (const [val, st] of map.entries()) {
    const decidedTrades = st.wins + st.losses
    const winRate = decidedTrades > 0 ? (st.wins / decidedTrades) * 100 : 0
    const lossRate = decidedTrades > 0 ? (st.losses / decidedTrades) * 100 : 0
    const breakEvenRate = st.totalTrades > 0 ? (st.breakEvens / st.totalTrades) * 100 : 0
    const totalNetR = st.rList.reduce((acc, r) => acc + r, 0)
    const totalPnl = st.pnlList.reduce((acc, p) => acc + p, 0)
    const avgRr = st.totalTrades > 0 ? totalNetR / st.totalTrades : 0
    const sharePercent = totalAnalyzedTrades > 0 ? (st.totalTrades / totalAnalyzedTrades) * 100 : 0

    let profitFactor = 0
    if (st.grossLoss > 0) {
      profitFactor = st.grossProfit / st.grossLoss
    } else if (st.grossProfit > 0) {
      profitFactor = 99.9
    }

    items.push({
      value: val,
      label: val,
      totalTrades: st.totalTrades,
      sharePercent: Math.round(sharePercent * 10) / 10,
      wins: st.wins,
      losses: st.losses,
      breakEvens: st.breakEvens,
      winRate: Math.round(winRate * 10) / 10,
      lossRate: Math.round(lossRate * 10) / 10,
      breakEvenRate: Math.round(breakEvenRate * 10) / 10,
      avgRr: Math.round(avgRr * 100) / 100,
      totalNetR: Math.round(totalNetR * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      isTopPerformer: false
    })
  }

  // Sort by Win Rate descending, then by totalTrades descending
  items.sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate
    if (b.totalTrades !== a.totalTrades) return b.totalTrades - a.totalTrades
    return b.avgRr - a.avgRr
  })

  // Mark top performer (item with highest Win Rate having at least 1 trade)
  const topCandidate = items.find((it) => it.totalTrades > 0 && it.wins > 0)
  if (topCandidate) {
    topCandidate.isTopPerformer = true
  }

  return {
    columnId: column.id,
    columnName: column.name,
    totalAnalyzedTrades,
    items
  }
}
