export interface TradeFiltersState {
  setup: string | number
  symbol: string | number
  session: string
  includePaperTrades: boolean
  startDate: string
  endDate: string
  customFields: Record<string, any>
}

export function createDefaultFilters(): TradeFiltersState {
  return {
    setup: 'all',
    symbol: 'all',
    session: 'all',
    includePaperTrades: false,
    startDate: '',
    endDate: '',
    customFields: {}
  }
}

/**
 * Single source of truth for filtering trades across Dashboard, Reports, and Monte Carlo.
 */
export function filterTrades(
  trades: any[],
  filters: TradeFiltersState,
  reportCustomColumns: any[] = []
): any[] {
  if (!trades || !Array.isArray(trades)) return []

  return trades.filter((t) => {
    // Setup filter
    if (filters.setup !== 'all' && t.setupId?.toString() !== String(filters.setup)) {
      return false
    }

    // Symbol filter
    if (filters.symbol !== 'all' && t.symbolId?.toString() !== String(filters.symbol)) {
      return false
    }

    // Session filter
    if (
      filters.session !== 'all' &&
      (!t.sessionName || t.sessionName.trim() !== String(filters.session).trim())
    ) {
      return false
    }

    // Paper trades toggle: default false excludes paper trades (t.isTest)
    if (!filters.includePaperTrades && t.isTest) {
      return false
    }

    // Start date filter
    if (filters.startDate && t.entryDatetime) {
      const [y, m, d] = filters.startDate.split('-').map(Number)
      const sDate = new Date(y, m - 1, d, 0, 0, 0, 0)
      if (new Date(t.entryDatetime) < sDate) return false
    }

    // End date filter
    if (filters.endDate && t.entryDatetime) {
      const [y, m, d] = filters.endDate.split('-').map(Number)
      const eDate = new Date(y, m - 1, d, 23, 59, 59, 999)
      if (new Date(t.entryDatetime) > eDate) return false
    }

    // Custom Fields filtering
    if (reportCustomColumns && reportCustomColumns.length > 0) {
      for (const col of reportCustomColumns) {
        const filterVal = filters.customFields?.[col.id]
        if (filterVal !== undefined && filterVal !== '' && filterVal !== 'all') {
          const tradeCustomData = t.customData
            ? typeof t.customData === 'string'
              ? JSON.parse(t.customData)
              : t.customData
            : {}

          const actualVal = tradeCustomData[col.id]
          if (col.type === 'switch' || col.type === 'checkbox') {
            const boolActual = String(actualVal) === 'true'
            const boolFilter = String(filterVal) === 'true'
            if (boolActual !== boolFilter) return false
          } else if (col.type === 'multiple_selector') {
            if (Array.isArray(actualVal)) {
              if (!actualVal.includes(filterVal)) return false
            } else if (!actualVal || !String(actualVal).includes(String(filterVal))) {
              return false
            }
          } else if (col.type === 'string') {
            if (
              !actualVal ||
              !String(actualVal).toLowerCase().includes(String(filterVal).toLowerCase())
            ) {
              return false
            }
          } else if (col.type === 'number') {
            if (
              actualVal === undefined ||
              actualVal === null ||
              Number(actualVal) !== Number(filterVal)
            ) {
              return false
            }
          } else {
            if (String(actualVal) !== String(filterVal)) return false
          }
        }
      }
    }

    return true
  })
}
