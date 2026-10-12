import { describe, it, expect } from 'vitest'
import {
  escapeXml,
  getColumnLetter,
  buildSheetXml,
  buildCsvContent,
  transformTradesToRows,
  transformKpisToRows
} from './excelExport'

describe('excelExport service', () => {
  describe('escapeXml', () => {
    it('escapes XML special characters', () => {
      expect(escapeXml('<script>alert("XSS" & \'test\')</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot; &amp; &apos;test&apos;)&lt;/script&gt;'
      )
    })

    it('handles null and undefined', () => {
      expect(escapeXml(null)).toBe('')
      expect(escapeXml(undefined)).toBe('')
    })
  })

  describe('getColumnLetter', () => {
    it('converts single column index correctly', () => {
      expect(getColumnLetter(0)).toBe('A')
      expect(getColumnLetter(1)).toBe('B')
      expect(getColumnLetter(25)).toBe('Z')
    })

    it('converts double column index correctly', () => {
      expect(getColumnLetter(26)).toBe('AA')
      expect(getColumnLetter(27)).toBe('AB')
      expect(getColumnLetter(51)).toBe('AZ')
      expect(getColumnLetter(52)).toBe('BA')
    })
  })

  describe('buildSheetXml', () => {
    it('builds XML with styled header and typed cells', () => {
      const rows = [
        ['Header1', 'Header2', 'Header3'],
        ['TextValue', 123.45, true]
      ]
      const xml = buildSheetXml(rows)

      expect(xml).toContain('<worksheet')
      // Header row
      expect(xml).toContain('<row r="1">')
      expect(xml).toContain('<c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">Header1</t></is></c>')
      // Data row
      expect(xml).toContain('<row r="2">')
      expect(xml).toContain('<c r="A2" t="inlineStr"><is><t xml:space="preserve">TextValue</t></is></c>')
      expect(xml).toContain('<c r="B2"><v>123.45</v></c>')
      expect(xml).toContain('<c r="C2" t="b"><v>1</v></c>')
    })
  })

  describe('buildCsvContent', () => {
    it('creates UTF-8 CSV with BOM and quotes special characters', () => {
      const headers = ['Name', 'Notes', 'Price']
      const rows = [['Trade 1', 'Clean notes', 100], ['Trade 2', 'Notes with, comma & "quotes"', 200]]
      const csv = buildCsvContent(headers, rows)

      expect(csv.startsWith('\uFEFF')).toBe(true)
      expect(csv).toContain('"Name","Notes","Price"')
      expect(csv).toContain('"Trade 1","Clean notes","100"')
      expect(csv).toContain('"Trade 2","Notes with, comma & ""quotes""","200"')
    })
  })

  describe('transformTradesToRows', () => {
    const mockTrades = [
      {
        id: 1,
        entryDatetime: '2026-10-10T10:00:00Z',
        exitDatetime: '2026-10-10T11:00:00Z',
        setupName: 'SMC Classic',
        symbolName: 'EURUSD',
        position: 'Buy',
        sessionName: 'London',
        directionBias: 'Bullish',
        entryTimeframe: 'M15',
        news: false,
        quality: 'Green',
        isTest: false,
        normalRr: 2.5,
        normalMaxRr: 3.0,
        normalSlPoints: 10,
        normalTpPoints: 25,
        beRr: 1.0,
        beMaxRr: 3.0,
        trailRr: 2.0,
        trailMaxRr: 3.0,
        notes: 'Great entry'
      }
    ]

    it('transforms trades with normal stat mode', () => {
      const { headers, rows } = transformTradesToRows(mockTrades, 'normal')
      expect(headers).toContain('ID')
      expect(headers).toContain('Realized RR [NORMAL]')
      expect(rows).toHaveLength(1)
      expect(rows[0][0]).toBe(1)
      expect(rows[0][3]).toBe('SMC Classic')
      expect(rows[0][4]).toBe('EURUSD')
      expect(rows[0][20]).toBe(2.5) // realizedRr normal
    })

    it('transforms trades with BE stat mode', () => {
      const { headers, rows } = transformTradesToRows(mockTrades, 'be')
      expect(headers).toContain('Realized RR [BE]')
      expect(rows[0][20]).toBe(1.0) // realizedRr be
    })

    it('transforms trades with trail stat mode', () => {
      const { headers, rows } = transformTradesToRows(mockTrades, 'trail')
      expect(headers).toContain('Realized RR [TRAIL]')
      expect(rows[0][20]).toBe(2.0) // realizedRr trail
    })
  })

  describe('transformKpisToRows', () => {
    it('creates KPI summary rows', () => {
      const mockKpis = {
        totalTrades: 50,
        wins: 30,
        losses: 20,
        winRate: 60,
        netPnL: 1500,
        profitFactor: 2.1
      }
      const { headers, rows } = transformKpisToRows(mockKpis, 'normal', { setup: 'SMC' })
      expect(headers).toEqual(['Metric', 'Value'])
      expect(rows.some(([k, v]) => k === 'Filter Setup' && v === 'SMC')).toBe(true)
      expect(rows.some(([k, v]) => k === 'Total Trades' && v === 50)).toBe(true)
      expect(rows.some(([k, v]) => k === 'Win Rate (%)' && v === '60%')).toBe(true)
      expect(rows.some(([k, v]) => k === 'Profit Factor' && v === 2.1)).toBe(true)
    })
  })
})
