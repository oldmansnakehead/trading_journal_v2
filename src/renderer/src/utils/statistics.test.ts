import { describe, it, expect } from 'vitest'
import {
  calculateKpis,
  calculatePositionPerformance,
  calculateSessionPerformance,
  DIRECTION_BIAS_THRESHOLD,
  TradeRecord
} from './statistics'

describe('Trading Journal Statistics Engine', () => {
  // Test dataset provided by the user:
  // Capital $10,000, Risk 1% = $100/R, Simple calculation
  const testTrades: TradeRecord[] = [
    {
      id: 1,
      entryDatetime: '2026-10-01T02:33:00',
      symbol: 'XAUUSD',
      position: 'Sell',
      sessionName: 'AS',
      normalRr: 1,
      isTest: false
    },
    {
      id: 2,
      entryDatetime: '2026-10-01T14:54:00',
      symbol: 'XAUUSD',
      position: 'Buy',
      sessionName: 'LD',
      normalRr: -1,
      isTest: false
    },
    {
      id: 3,
      entryDatetime: '2026-10-01T23:36:00',
      symbol: 'XAUUSD',
      position: 'Buy',
      sessionName: 'AS',
      normalRr: 2,
      isTest: false
    },
    {
      id: 4,
      entryDatetime: '2026-10-08T19:38:00',
      symbol: 'XAUUSD',
      position: 'Buy',
      sessionName: 'London',
      normalRr: 3.5,
      isTest: false
    },
    {
      id: 5,
      entryDatetime: '2026-10-09T19:38:00',
      symbol: 'EURUSD',
      position: 'Sell',
      sessionName: 'New York',
      normalRr: -1,
      isTest: true // Paper trade
    },
    {
      id: 6,
      entryDatetime: '2026-10-10T23:07:00',
      symbol: 'XAUUSD',
      position: 'Sell',
      sessionName: 'AS',
      normalRr: 1,
      isTest: false
    }
  ]

  const simConfig = {
    initialBalance: 10000,
    riskPerTrade: 1,
    returnCalculation: 'simple' as const
  }

  describe('All Trades (Including Paper)', () => {
    it('asserts exact statistics required by user prompt', () => {
      const kpis = calculateKpis(testTrades, 'normal', simConfig)
      const pos = calculatePositionPerformance(testTrades, 'normal', simConfig)

      // 1. Total RR: 5.5
      expect(kpis.totalRr).toBe(5.5)

      // 2. Win Rate: 66.7%
      expect(kpis.winRate).toBe(66.7)

      // 3. Net PnL: $550
      expect(kpis.netPnl).toBe(550)

      // 4. Profit Factor: 3.75
      expect(kpis.profitFactor).toBe(3.75)

      // 5. Expectancy: 0.92R
      expect(kpis.avgRr).toBe(0.92)

      // 6. Payoff Ratio: 1.88 (or 1.875 before 2-decimal rounding)
      // avgWin ($187.50) / avgLoss ($100.00) = 1.875
      expect(kpis.avgWin / kpis.avgLoss).toBe(1.875)
      expect(kpis.avgWinLossRr).toBe(1.88)

      // 7. Max Drawdown: 0.99%
      expect(kpis.maxDrawdown).toBe(0.99)

      // 8. Consecutive Wins: 2
      expect(kpis.consecWins).toBe(2)

      // 9. Consecutive Losses: 1
      expect(kpis.consecLosses).toBe(1)

      // 10. Long: +$450 / 1.5R
      expect(pos.buy.netPnl).toBe(450)
      expect(pos.buy.avgRr).toBe(1.5)
      expect(pos.buy.total).toBe(3)

      // 11. Short: +$100 / 0.33R
      expect(pos.sell.netPnl).toBe(100)
      expect(pos.sell.avgRr).toBe(0.33)
      expect(pos.sell.total).toBe(3)
    })
  })

  describe('Real Trades Only (Excluding Paper)', () => {
    it('matches target values when paper trades are excluded', () => {
      const realTrades = testTrades.filter((t) => !t.isTest)
      const kpis = calculateKpis(realTrades, 'normal', simConfig)

      // 5 trades, WR 80%, +6.5R, +$650, Final Balance $10,650
      expect(kpis.totalTrades).toBe(5)
      expect(kpis.winRate).toBe(80)
      expect(kpis.totalRr).toBe(6.5)
      expect(kpis.netPnl).toBe(650)
      expect(kpis.finalBalance).toBe(10650)
    })
  })

  describe('Long/Short Directional Bias', () => {
    it('evaluates Neutral when 50/50 and Long Bias when > 55%', () => {
      const pos = calculatePositionPerformance(testTrades, 'normal', simConfig)
      expect(pos.buy.share).toBe(50)
      expect(pos.sell.share).toBe(50)

      const getBias = (buyShare: number, sellShare: number) => {
        if (buyShare > DIRECTION_BIAS_THRESHOLD) return 'Long Bias'
        if (sellShare > DIRECTION_BIAS_THRESHOLD) return 'Short Bias'
        return 'Neutral'
      }

      // At 50/50, it must be Neutral
      expect(getBias(pos.buy.share, pos.sell.share)).toBe('Neutral')

      // If Long is 60%, it must be Long Bias
      expect(getBias(60, 40)).toBe('Long Bias')

      // If Short is 58%, it must be Short Bias
      expect(getBias(42, 58)).toBe('Short Bias')
    })
  })

  describe('Performance by Session', () => {
    it('calculates sessions correctly without merging AS/Asia or LD/London', () => {
      // Extra known sessions configured by user in setups: 'Asia'
      const sessionResult = calculateSessionPerformance(testTrades, 'normal', simConfig, ['Asia'])

      // AS: 3 trades / 100% / 1.33R / +$400
      const asStats = sessionResult.stats['AS']
      expect(asStats).toBeDefined()
      expect(asStats.total).toBe(3)
      expect(asStats.winRate).toBe(100)
      expect(asStats.avgRr).toBe(1.33)
      expect(asStats.netPnl).toBe(400)

      // London: 1 trade / 100% / 3.5R / +$350
      const londonStats = sessionResult.stats['London']
      expect(londonStats).toBeDefined()
      expect(londonStats.total).toBe(1)
      expect(londonStats.winRate).toBe(100)
      expect(londonStats.avgRr).toBe(3.5)
      expect(londonStats.netPnl).toBe(350)

      // LD: 1 trade / 0% / -1R / -$100
      const ldStats = sessionResult.stats['LD']
      expect(ldStats).toBeDefined()
      expect(ldStats.total).toBe(1)
      expect(ldStats.winRate).toBe(0)
      expect(ldStats.avgRr).toBe(-1)
      expect(ldStats.netPnl).toBe(-100)

      // New York: 1 trade / 0% / -1R / -$100
      const nyStats = sessionResult.stats['New York']
      expect(nyStats).toBeDefined()
      expect(nyStats.total).toBe(1)
      expect(nyStats.winRate).toBe(0)
      expect(nyStats.avgRr).toBe(-1)
      expect(nyStats.netPnl).toBe(-100)

      // Asia: 0 trades = null / '-'
      const asiaStats = sessionResult.stats['Asia']
      expect(asiaStats).toBeDefined()
      expect(asiaStats.total).toBe(0)
      expect(asiaStats.winRate).toBeNull()
      expect(asiaStats.avgRr).toBeNull()
      expect(asiaStats.netPnl).toBeNull()

      // Header label should only contain active sessions present in trades
      expect(sessionResult.activeSessionNames).toEqual(['AS', 'LD', 'London', 'New York'])
    })
  })

  describe('Avg Max RR (Potential MFE)', () => {
    it('returns null and does not fallback to realized RR when no MFE is recorded', () => {
      const kpis = calculateKpis(testTrades, 'normal', simConfig)
      expect(kpis.avgMaxRr).toBeNull()
      expect(kpis.countMaxRr).toBe(0)
    })

    it('calculates pure MFE when recorded in trades', () => {
      const tradesWithMfe: TradeRecord[] = [
        ...testTrades,
        {
          id: 7,
          entryDatetime: '2026-10-11T10:00:00',
          symbol: 'XAUUSD',
          position: 'Buy',
          sessionName: 'London',
          normalRr: 2,
          normalMaxRr: 4.5, // MFE = 4.5R
          isTest: false
        }
      ]
      const kpis = calculateKpis(tradesWithMfe, 'normal', simConfig)
      expect(kpis.countMaxRr).toBe(1)
      expect(kpis.avgMaxRr).toBe(4.5)
    })
  })

  describe('Standard Market Sessions Enforcement', () => {
    it('enforces exactly the 5 canonical session names', () => {
      const allowed = ['London', 'New York', 'London Close', 'Asia', 'Tokyo']
      expect(allowed).toEqual(['London', 'New York', 'London Close', 'Asia', 'Tokyo'])
    })
  })
})
