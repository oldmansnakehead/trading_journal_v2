import { describe, it, expect } from 'vitest'
import {
  calculatePerformanceBySetup,
  calculateCohortsPerformance,
  calculateRDistribution,
  calculateDayHourHeatmap,
  calculateMaeMfeScatter,
  extractTradeMae
} from './edgeAnalysis'
import type { TradeRecord } from './statistics'

describe('Edge Analysis Engine', () => {
  const mockTrades: TradeRecord[] = [
    // Setup 1: "HA Model" (setupId: 1)
    {
      id: 1,
      setupId: 1,
      setupName: 'HA Model',
      entryDatetime: '2026-10-05T14:30:00.000Z', // Monday 14:30 UTC
      normalRr: 3.5,
      normalMaxRr: 4.5,
      customData: JSON.stringify({ MAE: -0.2 })
    },
    {
      id: 2,
      setupId: 1,
      setupName: 'HA Model',
      entryDatetime: '2026-10-06T15:00:00.000Z', // Tuesday 15:00 UTC
      normalRr: 2.0,
      normalMaxRr: 2.0,
      customData: JSON.stringify({ MAE: -0.5 })
    },
    {
      id: 3,
      setupId: 1,
      setupName: 'HA Model',
      entryDatetime: '2026-10-07T14:15:00.000Z', // Wednesday 14:15 UTC
      normalRr: -1.0,
      normalMaxRr: 0.3
    },
    {
      id: 4,
      setupId: 1,
      setupName: 'HA Model',
      entryDatetime: '2026-10-08T16:00:00.000Z', // Thursday 16:00 UTC
      normalRr: 1.5,
      normalMaxRr: 3.0,
      customData: JSON.stringify({ MAE: -0.1 })
    },

    // Setup 2: "SMC Classic" (setupId: 2)
    {
      id: 5,
      setupId: 2,
      setupName: 'SMC Classic',
      entryDatetime: '2026-10-05T09:00:00.000Z', // Monday 09:00 UTC
      normalRr: -1.0,
      normalMaxRr: 1.5 // Reversal loss: was up 1.5R, hit -1R
    },
    {
      id: 6,
      setupId: 2,
      setupName: 'SMC Classic',
      entryDatetime: '2026-10-06T09:30:00.000Z', // Tuesday 09:30 UTC
      normalRr: -1.0,
      normalMaxRr: 0.2
    },
    {
      id: 7,
      setupId: 2,
      setupName: 'SMC Classic',
      entryDatetime: '2026-10-07T10:00:00.000Z', // Wednesday 10:00 UTC
      normalRr: 5.0,
      normalMaxRr: 6.0,
      customData: JSON.stringify({ MAE: -0.8 })
    },
    {
      id: 8,
      setupId: 2,
      setupName: 'SMC Classic',
      entryDatetime: '2026-10-08T10:30:00.000Z', // Thursday 10:30 UTC
      normalRr: 0.0, // BE
      normalMaxRr: 1.0
    }
  ]

  const mockSetups = [
    { id: 1, name: 'HA Model', type: 'real' },
    { id: 2, name: 'SMC Classic', type: 'real' },
    { id: 3, name: 'Scalping Demo', type: 'demo' }
  ]

  describe('1. Performance by Setup', () => {
    it('compares HA Model vs SMC Classic correctly with WR, Expectancy, and PF', () => {
      const res = calculatePerformanceBySetup(mockTrades, mockSetups, 'normal')

      expect(res.totalTrades).toBe(8)
      expect(res.items.length).toBe(3) // 2 with trades + 1 empty known setup

      const ha = res.items.find((i) => i.setupName === 'HA Model')!
      expect(ha).toBeDefined()
      expect(ha.totalTrades).toBe(4)
      expect(ha.wins).toBe(3)
      expect(ha.losses).toBe(1)
      expect(ha.winRate).toBe(75.0)
      // totalRr = 3.5 + 2.0 - 1.0 + 1.5 = 6.0R
      expect(ha.totalRr).toBe(6.0)
      // avgRr = 6.0 / 4 = 1.5R expectancy
      expect(ha.avgRr).toBe(1.5)
      // PF = 7.0 / 1.0 = 7.0
      expect(ha.profitFactor).toBe(7.0)

      const smc = res.items.find((i) => i.setupName === 'SMC Classic')!
      expect(smc).toBeDefined()
      expect(smc.totalTrades).toBe(4)
      expect(smc.wins).toBe(1)
      expect(smc.losses).toBe(2)
      expect(smc.breakEvens).toBe(1)
      expect(smc.winRate).toBe(25.0)
      // totalRr = -1 - 1 + 5 + 0 = 3.0R
      expect(smc.totalRr).toBe(3.0)
      // avgRr = 3.0 / 4 = 0.75R expectancy
      expect(smc.avgRr).toBe(0.75)
      // PF = 5.0 / 2.0 = 2.5
      expect(smc.profitFactor).toBe(2.5)

      // HA Model should be identified as best expectancy and best profit factor
      expect(res.bestExpectancySetupId).toBe(1)
      expect(res.bestProfitFactorSetupId).toBe(1)
      expect(ha.isBestExpectancy).toBe(true)
      expect(ha.isBestProfitFactor).toBe(true)
    })

    it('handles empty trades gracefully', () => {
      const res = calculatePerformanceBySetup([], mockSetups, 'normal')
      expect(res.totalTrades).toBe(0)
      expect(res.items.length).toBe(3)
      expect(res.items[0].totalTrades).toBe(0)
      expect(res.bestExpectancySetupId).toBeNull()
    })

    it('compares custom filter cohorts dynamically with Head-to-Head delta', () => {
      const cohortA = {
        id: 'cohort-1',
        name: 'HA Model (London Only)',
        color: '#4f46e5',
        filterSummary: 'Setup: HA Model, Session: London',
        trades: mockTrades.filter((t) => t.setupId === 1)
      }
      const cohortB = {
        id: 'cohort-2',
        name: 'SMC Classic (NY Only)',
        color: '#059669',
        filterSummary: 'Setup: SMC Classic, Session: New York',
        trades: mockTrades.filter((t) => t.setupId === 2)
      }

      const res = calculateCohortsPerformance([cohortA, cohortB], 'normal')
      expect(res.items.length).toBe(2)
      expect(res.totalTrades).toBe(8)

      const itemA = res.items[0]
      expect(itemA.name).toBe('HA Model (London Only)')
      expect(itemA.winRate).toBe(75.0)
      expect(itemA.avgRr).toBe(1.5)

      const itemB = res.items[1]
      expect(itemB.name).toBe('SMC Classic (NY Only)')
      expect(itemB.winRate).toBe(25.0)
      expect(itemB.avgRr).toBe(0.75)

      // Best Expectancy should be cohort-1
      expect(res.bestExpectancyCohortId).toBe('cohort-1')

      // Head-to-Head Delta
      expect(res.headToHeadDelta).toBeDefined()
      expect(res.headToHeadDelta!.expectancyDiff).toBe(0.75) // 1.5 - 0.75
      expect(res.headToHeadDelta!.winRateDiff).toBe(50.0) // 75 - 25
      expect(res.headToHeadDelta!.netRrDiff).toBe(3.0) // 6.0 - 3.0
    })
  })

  describe('2. R-Multiple Distribution', () => {
    it('categorizes trades into accurate R-multiple bins and calculates distribution metrics', () => {
      const res = calculateRDistribution(mockTrades, 'normal')

      expect(res.totalTrades).toBe(8)
      // Losses: trade 3 (-1R), trade 5 (-1R), trade 6 (-1R) -> 3 trades at -1R
      const minus1Bin = res.bins.find((b) => b.label === '-1R')!
      expect(minus1Bin.count).toBe(3)

      // BE: trade 8 (0R) -> 1 trade
      const beBin = res.bins.find((b) => b.label === '0R (BE)')!
      expect(beBin.count).toBe(1)

      // Wins: 1.5R (trade 4), 2.0R (trade 2), 3.5R (trade 1), 5.0R (trade 7)
      const bin1to2 = res.bins.find((b) => b.label === '(1, 2]R')!
      expect(bin1to2.count).toBe(2) // 1.5R and 2.0R

      const bin3to5 = res.bins.find((b) => b.label === '(3, 5]R')!
      expect(bin3to5.count).toBe(2) // 3.5R and 5.0R

      // Mean R = (3.5 + 2.0 - 1.0 + 1.5 - 1.0 - 1.0 + 5.0 + 0) / 8 = 9.0 / 8 = 1.125 -> 1.13
      expect(res.meanRr).toBe(1.13)
      expect(res.highestR).toBe(5.0)
      expect(res.lowestR).toBe(-1.0)
      expect(res.top3SharePct).toBeGreaterThan(0)
    })

    it('identifies outlier profit concentration when profit comes from few trades', () => {
      const skewedTrades: TradeRecord[] = [
        { entryDatetime: '2026-01-01', normalRr: 10.0 }, // Big outlier
        { entryDatetime: '2026-01-02', normalRr: 8.0 },
        { entryDatetime: '2026-01-03', normalRr: 7.0 },
        { entryDatetime: '2026-01-04', normalRr: 0.5 },
        { entryDatetime: '2026-01-05', normalRr: 0.5 },
        { entryDatetime: '2026-01-06', normalRr: 0.5 }
      ]
      const res = calculateRDistribution(skewedTrades, 'normal')
      // Top 3 = 25 / 26.5 = ~94%
      expect(res.top3SharePct).toBeGreaterThan(60)
      expect(res.isConcentratedInFewOutliers).toBe(true)
    })
  })

  describe('3. Day x Hour Heatmap', () => {
    it('aggregates trades into correct day and hour slots', () => {
      const res = calculateDayHourHeatmap(mockTrades, 'normal')
      expect(res.totalTrades).toBe(8)

      // Check matrix dimensions: 7 days x 24 hours
      expect(res.matrix.length).toBe(7)
      expect(res.matrix[0].length).toBe(24)

      // Trade 1 is on 2026-10-05T14:30:00Z -> Monday (1), Hour 14 (or local getHours depending on test env)
      const d1 = new Date('2026-10-05T14:30:00.000Z')
      const dayIdx = d1.getDay()
      const hourIdx = d1.getHours()
      const cell = res.matrix[dayIdx][hourIdx]

      expect(cell.totalTrades).toBeGreaterThanOrEqual(1)
      expect(res.daySummaries.length).toBe(7)
      expect(res.hourSummaries.length).toBe(24)
    })
  })

  describe('4. MAE / MFE Scatter Plot & Excursion Analysis', () => {
    it('extracts MAE correctly from customData or fallback', () => {
      expect(
        extractTradeMae({ entryDatetime: '', customData: JSON.stringify({ MAE: -0.4 }) })
      ).toBe(-0.4)
      expect(
        extractTradeMae({ entryDatetime: '', customData: JSON.stringify({ max_adverse: -0.7 }) })
      ).toBe(-0.7)
      expect(extractTradeMae({ entryDatetime: '', normalRr: -1.0 })).toBe(-1.0)
      expect(extractTradeMae({ entryDatetime: '', normalRr: 2.0 })).toBe(0)
    })

    it('calculates capture efficiency, left-on-table, and detects reversal losses', () => {
      const res = calculateMaeMfeScatter(mockTrades, 'normal')
      expect(res.points.length).toBe(8)

      // Trade 1: Realized 3.5R, MaxRr 4.5R -> Left on table = 1.0R, Capture efficiency = (3.5 / 4.5) * 100 = 77.8%
      const p1 = res.points.find((p) => p.id === 1)!
      expect(p1.realizedRr).toBe(3.5)
      expect(p1.maxRr).toBe(4.5)
      expect(p1.leftOnTableRr).toBe(1.0)
      expect(p1.captureEfficiencyPct).toBe(77.8)
      expect(p1.isReversalLoss).toBe(false)

      // Trade 5: Realized -1.0R, MaxRr 1.5R -> Reversal loss! Reached >= 1R then stopped out
      const p5 = res.points.find((p) => p.id === 5)!
      expect(p5.isReversalLoss).toBe(true)

      expect(res.reversalLossesCount).toBe(1)
      expect(res.totalLeftOnTableRr).toBeGreaterThan(0)
      expect(res.avgCaptureEfficiencyPct).toBeGreaterThan(0)
    })
  })
})
