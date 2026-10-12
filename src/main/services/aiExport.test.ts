import { describe, it, expect } from 'vitest'
import { generateAiMarkdownReport, generateAiJsonReport } from './aiExport'

describe('AI Export Service', () => {
  const sampleTrades = [
    {
      id: 1,
      entryDatetime: '2026-10-10T14:30:00Z',
      setupName: 'Order Block Sweep',
      symbol: 'EURUSD',
      position: 'Buy',
      sessionName: 'London',
      normalRr: 2.5,
      beRr: 1.0,
      trailRr: 2.0,
      pnl: 250,
      quality: 'Green',
      notes: 'Clean displacement | target reached'
    },
    {
      id: 2,
      entryDatetime: '2026-10-11T16:00:00Z',
      setupName: 'Break of Structure',
      symbol: 'XAUUSD',
      position: 'Sell',
      sessionName: 'New York',
      normalRr: -1.0,
      beRr: 0.0,
      trailRr: -1.0,
      pnl: -100,
      quality: 'Red',
      notes: 'Late entry'
    }
  ]

  const sampleKpis = {
    totalTrades: 2,
    wins: 1,
    losses: 1,
    breakEvens: 0,
    winRate: 50.0,
    profitFactor: 2.5,
    netPnl: 150,
    grossProfit: 250,
    grossLoss: 100,
    avgRr: 0.75,
    maxDrawdown: 100
  }

  describe('generateAiMarkdownReport', () => {
    it('generates markdown with AI instructions prompt section', () => {
      const md = generateAiMarkdownReport({
        trades: sampleTrades,
        kpis: sampleKpis,
        statMode: 'normal'
      })

      expect(md).toContain('# 📈 Trading Journal Performance Report (AI Analysis Ready)')
      expect(md).toContain('## 🤖 Instructions for AI Analyst')
      expect(md).toContain('You are an expert quantitative trading coach')
      expect(md).toContain('Core Edge & Performance Assessment')
      expect(md).toContain('Actionable Action Plan')
    })

    it('includes KPI summary table with accurate values', () => {
      const md = generateAiMarkdownReport({
        trades: sampleTrades,
        kpis: sampleKpis,
        statMode: 'normal'
      })

      expect(md).toContain('| **Win Rate** | 50% |')
      expect(md).toContain('| **Net PnL** | $150.00 |')
      expect(md).toContain('| **Profit Factor** | 2.5 |')
    })

    it('generates sub-segment breakdowns for setups, sessions, and buy/sell', () => {
      const md = generateAiMarkdownReport({
        trades: sampleTrades,
        kpis: sampleKpis,
        statMode: 'normal'
      })

      expect(md).toContain('Order Block Sweep')
      expect(md).toContain('London')
      expect(md).toContain('BUY (Long)')
      expect(md).toContain('SELL (Short)')
    })

    it('escapes pipe characters in notes to preserve Markdown table structure', () => {
      const md = generateAiMarkdownReport({
        trades: sampleTrades,
        kpis: sampleKpis,
        statMode: 'normal'
      })

      expect(md).toContain('Clean displacement \\| target reached')
    })
  })

  describe('generateAiJsonReport', () => {
    it('generates valid JSON with schema version and structured data', () => {
      const jsonStr = generateAiJsonReport({
        trades: sampleTrades,
        kpis: sampleKpis,
        statMode: 'normal',
        filters: { setup: 'all' }
      })

      const parsed = JSON.parse(jsonStr)
      expect(parsed.schemaVersion).toBe('1.0.0')
      expect(parsed.reportType).toBe('trading_journal_performance_ai_report')
      expect(parsed.trades.length).toBe(2)
      expect(parsed.kpis.netPnl).toBe(150)
      expect(parsed.breakdowns.setups.length).toBeGreaterThan(0)
      expect(parsed.breakdowns.sessions.length).toBeGreaterThan(0)
    })

    it('computes correct RR based on statMode in JSON report', () => {
      const jsonBeStr = generateAiJsonReport({
        trades: sampleTrades,
        kpis: sampleKpis,
        statMode: 'be'
      })

      const parsedBe = JSON.parse(jsonBeStr)
      expect(parsedBe.trades[0].rr).toBe(1.0) // BE RR is 1.0
    })
  })
})
