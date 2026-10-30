import { describe, it, expect } from 'vitest'
import { generateResearchAiMarkdown, generateResearchAiJson } from './researchExport'
import type { ResearchExportPayload } from '../../shared/types'

describe('researchExport', () => {
  const samplePayload: ResearchExportPayload = {
    setupName: 'FVG + OB Reversal',
    setupDescription: 'Testing entry reaction at M15 zones',
    playbookContent: 'Check liquidity sweep at Asian session high before entry.',
    analytics: {
      totalEntries: 10,
      setupId: 1,
      setupName: 'FVG + OB Reversal',
      bestEvZoneId: 101,
      highestWinRateZoneId: 101,
      lowestMissRateZoneId: 102,
      highestMaxRrZoneId: 101,
      zoneMetrics: [
        {
          customColumnId: 101,
          columnName: 'Extreme OB',
          totalSamples: 10,
          formedCount: 10,
          noZoneCount: 0,
          formationRate: 100,
          filledCount: 8,
          missedCount: 2,
          fillRate: 80,
          missRate: 20,
          winCount: 6,
          lossCount: 2,
          beCount: 0,
          winRate: 75,
          lossRate: 25,
          avgMinRr: 2.5,
          avgMaxRr: 6.2,
          avgSlPoints: 110,
          expectedValue: 1.625
        },
        {
          customColumnId: 102,
          columnName: 'FVG M15',
          totalSamples: 10,
          formedCount: 10,
          noZoneCount: 0,
          formationRate: 100,
          filledCount: 9,
          missedCount: 1,
          fillRate: 90,
          missRate: 10,
          winCount: 5,
          lossCount: 3,
          beCount: 1,
          winRate: 55.6,
          lossRate: 33.3,
          avgMinRr: 1.8,
          avgMaxRr: 4.1,
          avgSlPoints: 160,
          expectedValue: 0.67
        }
      ]
    },
    entries: [
      {
        id: 1,
        entryDatetime: '2026-10-28T14:30',
        setupName: 'FVG + OB Reversal',
        symbolName: 'XAUUSD',
        sessionName: 'London',
        timeframe: 'M15',
        news: true,
        quality: 'A+',
        notes: 'Clean reaction after London open',
        zones: [
          {
            customColumnName: 'Extreme OB',
            bias: 'Bullish',
            minRr: 3,
            maxRr: 8,
            slPoints: 100,
            realSlPoints: 40,
            minSlPoints: 100,
            maxSlPoints: 100,
            isMissed: false,
            outcome: 'win',
            notes: 'Exact tap'
          },
          {
            customColumnName: 'FVG M15',
            bias: 'Bullish',
            minRr: null,
            maxRr: null,
            slPoints: 150,
            realSlPoints: null,
            minSlPoints: 150,
            maxSlPoints: 150,
            isMissed: true,
            outcome: 'missed',
            notes: 'Price shot through'
          }
        ]
      }
    ]
  }

  it('generates structured AI Markdown with prompt, comparison matrix, and trade logs', () => {
    const md = generateResearchAiMarkdown(samplePayload)

    expect(md).toContain('# 🔬 Trade Research & Zone Statistics: AI Deep Analysis Report')
    expect(md).toContain('FVG + OB Reversal')
    expect(md).toContain('## 🤖 AI Prompt & Edge Analysis Instructions')
    expect(md).toContain('Check liquidity sweep at Asian session high')
    expect(md).toContain('## 📊 Zone Comparison Matrix (Aggregated Performance)')
    expect(md).toContain('Extreme OB')
    expect(md).toContain('🏆') // Best EV badge
    expect(md).toContain('1.63') // Expected value formatted
    expect(md).toContain('## 📋 Granular Research Trade Logs')
    expect(md).toContain('XAUUSD')
    expect(md).toContain('London')
    expect(md).toContain('WIN')
    expect(md).toContain('MISSED')
  })

  it('generates structured AI JSON report matching schema', () => {
    const jsonStr = generateResearchAiJson(samplePayload)
    const parsed = JSON.parse(jsonStr)

    expect(parsed.reportType).toBe('trade_research_zone_statistics_ai_report')
    expect(parsed.setupName).toBe('FVG + OB Reversal')
    expect(parsed.entries).toHaveLength(1)
    expect(parsed.entries[0].zones).toHaveLength(2)
    expect(parsed.entries[0].zones[0].outcome).toBe('win')
    expect(parsed.entries[0].zones[1].isMissed).toBe(true)
  })
})
