import { describe, it, expect } from 'vitest'
import {
  parseColumnOptions,
  extractTradeCustomData,
  calculateAttributeRanking
} from './customAttributeRanking'

describe('customAttributeRanking utility', () => {
  it('parses column options correctly from array, JSON, and comma strings', () => {
    expect(parseColumnOptions(['FVG', 'OB', 'BREAKER BLOCK'])).toEqual([
      'FVG',
      'OB',
      'BREAKER BLOCK'
    ])
    expect(parseColumnOptions('["FVG", "OB"]')).toEqual(['FVG', 'OB'])
    expect(parseColumnOptions('FVG, OB, Breaker')).toEqual(['FVG', 'OB', 'Breaker'])
    expect(parseColumnOptions(null)).toEqual([])
  })

  it('extracts trade customData properly', () => {
    expect(extractTradeCustomData({ customData: { 1: 'FVG' } })).toEqual({ 1: 'FVG' })
    expect(extractTradeCustomData({ customData: JSON.stringify({ 1: 'OB' }) })).toEqual({
      1: 'OB'
    })
    expect(extractTradeCustomData(null)).toEqual({})
    expect(extractTradeCustomData({ customData: 'invalid json' })).toEqual({})
  })

  it('calculates attribute win rate, loss rate, and ranking accurately', () => {
    const mockColumn = {
      id: 10,
      name: 'Zone',
      type: 'single_selector',
      options: ['FVG', 'OB', 'BREAKER BLOCK']
    }

    const mockTrades = [
      // FVG: 2 wins (2R, 3R), 1 loss (-1R) -> WR: 2/3 = 66.7%
      { normalRr: 2.0, pnl: 200, customData: { '10': 'FVG' } },
      { normalRr: 3.0, pnl: 300, customData: { '10': 'FVG' } },
      { normalRr: -1.0, pnl: -100, customData: { '10': 'FVG' } },

      // OB: 1 win (1.5R), 2 losses (-1R, -1R) -> WR: 1/3 = 33.3%
      { normalRr: 1.5, pnl: 150, customData: { '10': 'OB' } },
      { normalRr: -1.0, pnl: -100, customData: { '10': 'OB' } },
      { normalRr: -1.0, pnl: -100, customData: { '10': 'OB' } },

      // BREAKER BLOCK: 2 wins (4R, 2R), 0 loss -> WR: 100%
      { normalRr: 4.0, pnl: 400, customData: { '10': 'BREAKER BLOCK' } },
      { normalRr: 2.0, pnl: 200, customData: { '10': 'BREAKER BLOCK' } }
    ]

    const result = calculateAttributeRanking(mockTrades, mockColumn, 'normal')

    expect(result.columnName).toBe('Zone')
    expect(result.totalAnalyzedTrades).toBe(8)
    expect(result.items.length).toBe(3)

    // BREAKER BLOCK should be #1 (100% win rate)
    expect(result.items[0].value).toBe('BREAKER BLOCK')
    expect(result.items[0].winRate).toBe(100)
    expect(result.items[0].lossRate).toBe(0)
    expect(result.items[0].totalTrades).toBe(2)
    expect(result.items[0].totalNetR).toBe(6)
    expect(result.items[0].isTopPerformer).toBe(true)

    // FVG should be #2 (66.7% win rate)
    expect(result.items[1].value).toBe('FVG')
    expect(result.items[1].winRate).toBe(66.7)
    expect(result.items[1].totalTrades).toBe(3)
    expect(result.items[1].totalNetR).toBe(4)
    expect(result.items[1].isTopPerformer).toBe(false)

    // OB should be #3 (33.3% win rate)
    expect(result.items[2].value).toBe('OB')
    expect(result.items[2].winRate).toBe(33.3)
    expect(result.items[2].totalTrades).toBe(3)
    expect(result.items[2].totalNetR).toBe(-0.5)
  })

  it('supports statMode switching (beRr, trailRr)', () => {
    const mockColumn = { id: 5, name: 'Zone', options: ['FVG'] }
    const trades = [
      { normalRr: 2.0, beRr: 1.0, trailRr: 1.5, customData: { '5': 'FVG' } }
    ]

    const normalRes = calculateAttributeRanking(trades, mockColumn, 'normal')
    expect(normalRes.items[0].avgRr).toBe(2.0)

    const beRes = calculateAttributeRanking(trades, mockColumn, 'be')
    expect(beRes.items[0].avgRr).toBe(1.0)

    const trailRes = calculateAttributeRanking(trades, mockColumn, 'trail')
    expect(trailRes.items[0].avgRr).toBe(1.5)
  })

  it('handles multiple_selector array values in trades', () => {
    const mockColumn = { id: 7, name: 'Confluence', options: ['FVG', 'Liquidity Sweep'] }
    const trades = [
      { normalRr: 3.0, customData: { '7': ['FVG', 'Liquidity Sweep'] } }
    ]

    const res = calculateAttributeRanking(trades, mockColumn, 'normal')
    const fvg = res.items.find((it) => it.value === 'FVG')
    const sweep = res.items.find((it) => it.value === 'Liquidity Sweep')

    expect(fvg?.totalTrades).toBe(1)
    expect(sweep?.totalTrades).toBe(1)
  })
})
