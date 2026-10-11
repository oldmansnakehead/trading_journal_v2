import { describe, it, expect } from 'vitest'
import { filterTrades, createDefaultFilters } from './tradeFilters'

describe('filterTrades utility', () => {
  const sampleTrades = [
    {
      id: 1,
      setupId: 10,
      symbolId: 100,
      sessionName: 'London',
      isTest: false,
      entryDatetime: '2026-10-01T10:00:00',
      customData: { col1: 'TrueTrend', col2: 15 }
    },
    {
      id: 2,
      setupId: 20,
      symbolId: 100,
      sessionName: 'New York',
      isTest: true,
      entryDatetime: '2026-10-05T14:30:00',
      customData: { col1: 'FalseTrend', col2: 25 }
    },
    {
      id: 3,
      setupId: 10,
      symbolId: 200,
      sessionName: 'London',
      isTest: false,
      entryDatetime: '2026-10-10T09:00:00',
      customData: { col1: 'TrueTrend', col2: 30 }
    }
  ]

  it('excludes paper trades by default when includePaperTrades is false', () => {
    const filters = createDefaultFilters()
    const result = filterTrades(sampleTrades, filters)
    expect(result.length).toBe(2)
    expect(result.some((t) => t.isTest)).toBe(false)
  })

  it('includes paper trades when includePaperTrades is true', () => {
    const filters = createDefaultFilters()
    filters.includePaperTrades = true
    const result = filterTrades(sampleTrades, filters)
    expect(result.length).toBe(3)
  })

  it('filters by setupId and symbolId', () => {
    const filters = createDefaultFilters()
    filters.setup = 10
    filters.symbol = 100
    const result = filterTrades(sampleTrades, filters)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe(1)
  })

  it('filters by date range', () => {
    const filters = createDefaultFilters()
    filters.startDate = '2026-10-02'
    filters.endDate = '2026-10-11'
    const result = filterTrades(sampleTrades, filters)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe(3)
  })

  it('filters by custom fields', () => {
    const customCols = [
      { id: 'col1', name: 'Trend Mode', type: 'string', reportFilter: true },
      { id: 'col2', name: 'ATR Level', type: 'number', reportFilter: true }
    ]

    const filters = createDefaultFilters()
    filters.customFields = { col1: 'TrueTrend', col2: '15' }
    const result = filterTrades(sampleTrades, filters, customCols)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe(1)
  })
})
