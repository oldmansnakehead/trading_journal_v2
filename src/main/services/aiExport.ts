import { BrowserWindow, dialog } from 'electron'
import * as fs from 'fs'

export interface AiExportTrade {
  id?: number
  entryDatetime?: string
  exitDatetime?: string
  setupName?: string
  symbol?: string
  position?: string
  sessionName?: string
  normalRr?: number
  beRr?: number
  trailRr?: number
  rr?: number
  pnl?: number
  quality?: string
  notes?: string
  [key: string]: any
}

export interface AiExportPayload {
  trades: AiExportTrade[]
  kpis?: {
    totalTrades?: number
    wins?: number
    losses?: number
    breakEvens?: number
    winRate?: number | string
    profitFactor?: number | string
    netPnl?: number
    grossProfit?: number
    grossLoss?: number
    avgRr?: number | string
    maxDrawdown?: number | string
    [key: string]: any
  }
  statMode?: 'normal' | 'be' | 'trail' | string
  filters?: {
    setup?: string
    symbol?: string
    session?: string
    startDate?: string
    endDate?: string
    includePaperTrades?: boolean
    [key: string]: any
  }
  format?: 'md' | 'json'
  defaultName?: string
}

/**
 * Helper to compute setup breakdown
 */
function computeSetupBreakdown(trades: AiExportTrade[], statMode: string) {
  const map = new Map<string, { trades: number; wins: number; losses: number; be: number; netPnl: number }>()

  for (const t of trades) {
    const key = t.setupName || 'Unknown Setup'
    if (!map.has(key)) {
      map.set(key, { trades: 0, wins: 0, losses: 0, be: 0, netPnl: 0 })
    }
    const stat = map.get(key)!
    stat.trades++
    const rr = getRr(t, statMode)
    const pnl = Number(t.pnl) || 0
    stat.netPnl += pnl

    if (rr > 0) stat.wins++
    else if (rr < 0) stat.losses++
    else stat.be++
  }

  return Array.from(map.entries()).map(([setup, s]) => ({
    setup,
    total: s.trades,
    wins: s.wins,
    losses: s.losses,
    be: s.be,
    winRate: s.trades > 0 ? ((s.wins / s.trades) * 100).toFixed(1) : '0.0',
    netPnl: s.netPnl
  }))
}

/**
 * Helper to compute session breakdown
 */
function computeSessionBreakdown(trades: AiExportTrade[], statMode: string) {
  const map = new Map<string, { trades: number; wins: number; losses: number; be: number; netPnl: number }>()

  for (const t of trades) {
    const key = t.sessionName || 'Unknown Session'
    if (!map.has(key)) {
      map.set(key, { trades: 0, wins: 0, losses: 0, be: 0, netPnl: 0 })
    }
    const stat = map.get(key)!
    stat.trades++
    const rr = getRr(t, statMode)
    const pnl = Number(t.pnl) || 0
    stat.netPnl += pnl

    if (rr > 0) stat.wins++
    else if (rr < 0) stat.losses++
    else stat.be++
  }

  return Array.from(map.entries()).map(([session, s]) => ({
    session,
    total: s.trades,
    wins: s.wins,
    losses: s.losses,
    be: s.be,
    winRate: s.trades > 0 ? ((s.wins / s.trades) * 100).toFixed(1) : '0.0',
    netPnl: s.netPnl
  }))
}

/**
 * Helper to compute position side breakdown (BUY vs SELL)
 */
function computeSideBreakdown(trades: AiExportTrade[], statMode: string) {
  const buy = { total: 0, wins: 0, losses: 0, netPnl: 0 }
  const sell = { total: 0, wins: 0, losses: 0, netPnl: 0 }

  for (const t of trades) {
    const isBuy = (t.position || '').toLowerCase() === 'buy'
    const target = isBuy ? buy : sell
    target.total++
    const rr = getRr(t, statMode)
    const pnl = Number(t.pnl) || 0
    target.netPnl += pnl

    if (rr > 0) target.wins++
    else if (rr < 0) target.losses++
  }

  return {
    buy: {
      ...buy,
      winRate: buy.total > 0 ? ((buy.wins / buy.total) * 100).toFixed(1) : '0.0'
    },
    sell: {
      ...sell,
      winRate: sell.total > 0 ? ((sell.wins / sell.total) * 100).toFixed(1) : '0.0'
    }
  }
}

function getRr(trade: AiExportTrade, statMode: string): number {
  if (statMode === 'be' && trade.beRr !== undefined && trade.beRr !== null) {
    return Number(trade.beRr)
  }
  if (statMode === 'trail' && trade.trailRr !== undefined && trade.trailRr !== null) {
    return Number(trade.trailRr)
  }
  if (trade.normalRr !== undefined && trade.normalRr !== null) {
    return Number(trade.normalRr)
  }
  return Number(trade.rr || 0)
}

/**
 * Generate AI-Ready Markdown document
 */
export function generateAiMarkdownReport(payload: AiExportPayload): string {
  const trades = payload.trades || []
  const kpis = payload.kpis || {}
  const statMode = payload.statMode || 'normal'
  const filterSummary = payload.filters
    ? `Setup: ${payload.filters.setup || 'all'} | Symbol: ${payload.filters.symbol || 'all'} | Session: ${payload.filters.session || 'all'}`
    : 'None (All matching trades)'

  const setupStats = computeSetupBreakdown(trades, statMode)
  const sessionStats = computeSessionBreakdown(trades, statMode)
  const sideStats = computeSideBreakdown(trades, statMode)

  const dateNow = new Date().toISOString().replace('T', ' ').slice(0, 19)

  let md = ''

  // Document Title & Metadata
  md += `# 📈 Trading Journal Performance Report (AI Analysis Ready)\n\n`
  md += `> **Generated:** ${dateNow} | **RR Mode:** ${statMode.toUpperCase()} | **Total Trades:** ${trades.length}\n`
  md += `> **Filters Applied:** ${filterSummary}\n\n`
  md += `---\n\n`

  // Prompt Instructions for AI Analyst
  md += `## 🤖 Instructions for AI Analyst\n\n`
  md += `You are an expert quantitative trading coach, behavioral risk analyst, and trading psychologist.\n`
  md += `Please analyze the trading metrics, statistical breakdowns, and individual trade logs provided in this document.\n\n`
  md += `**Please structure your analysis into the following 4 sections:**\n`
  md += `1. **Core Edge & Performance Assessment:** Evaluate the trader's win rate, profit factor, expectancy, and whether their edge comes from high win rate or high R-multiples.\n`
  md += `2. **Sub-Segment Edge Analysis (Setups, Sessions, Side):** Compare the effectiveness across different setups and trading sessions. Point out which configurations generate the majority of profit versus which leak capital.\n`
  md += `3. **Behavioral & Risk Management Diagnostics:** Inspect the trade log for signs of clustering losses, revenge trading, oversized risk, or inconsistent holding discipline.\n`
  md += `4. **Actionable Action Plan:** Provide 3 to 5 clear, concrete, data-backed rules or habits the trader should implement immediately to optimize their system.\n\n`
  md += `---\n\n`

  // KPIs Executive Summary
  md += `## 🏆 Key Performance Indicators (KPIs)\n\n`
  md += `| Metric | Value | Details / Notes |\n`
  md += `| :--- | :--- | :--- |\n`
  md += `| **Total Trades** | ${kpis.totalTrades ?? trades.length} | Total sample size |\n`
  md += `| **Win Rate** | ${kpis.winRate !== undefined ? `${kpis.winRate}%` : 'N/A'} | ${kpis.wins ?? '-'} Wins / ${kpis.losses ?? '-'} Losses / ${kpis.breakEvens ?? '-'} BE |\n`
  md += `| **Profit Factor** | ${kpis.profitFactor ?? 'N/A'} | Ratio of Gross Profit to Gross Loss |\n`
  md += `| **Net PnL** | $${Number(kpis.netPnl ?? 0).toFixed(2)} | Net monetary growth |\n`
  md += `| **Gross Profit** | $${Number(kpis.grossProfit ?? 0).toFixed(2)} | Total gains from winning trades |\n`
  md += `| **Gross Loss** | -$${Math.abs(Number(kpis.grossLoss ?? 0)).toFixed(2)} | Total losses from losing trades |\n`
  md += `| **Average RR** | ${kpis.avgRr !== undefined ? `${kpis.avgRr}R` : 'N/A'} | Average R-multiple per trade (${statMode} mode) |\n`
  md += `| **Max Drawdown** | $${Number(kpis.maxDrawdown ?? 0).toFixed(2)} | Peak-to-trough equity decline |\n\n`
  md += `---\n\n`

  // Sub-segment Breakdowns
  md += `## 🧩 Performance Breakdown\n\n`

  // Setups Table
  md += `### 1. Breakdown by Setup\n\n`
  md += `| Setup Name | Total Trades | Wins | Losses | Win Rate (%) | Net PnL ($) |\n`
  md += `| :--- | :-: | :-: | :-: | :-: | :-: |\n`
  for (const s of setupStats) {
    const sign = s.netPnl >= 0 ? '+' : ''
    md += `| ${s.setup} | ${s.total} | ${s.wins} | ${s.losses} | ${s.winRate}% | ${sign}$${s.netPnl.toFixed(2)} |\n`
  }
  md += `\n`

  // Sessions Table
  md += `### 2. Breakdown by Trading Session\n\n`
  md += `| Session | Total Trades | Wins | Losses | Win Rate (%) | Net PnL ($) |\n`
  md += `| :--- | :-: | :-: | :-: | :-: | :-: |\n`
  for (const s of sessionStats) {
    const sign = s.netPnl >= 0 ? '+' : ''
    md += `| ${s.session} | ${s.total} | ${s.wins} | ${s.losses} | ${s.winRate}% | ${sign}$${s.netPnl.toFixed(2)} |\n`
  }
  md += `\n`

  // Side Table
  md += `### 3. Breakdown by Direction (BUY vs SELL)\n\n`
  md += `| Direction | Total Trades | Wins | Losses | Win Rate (%) | Net PnL ($) |\n`
  md += `| :--- | :-: | :-: | :-: | :-: | :-: |\n`
  const buySign = sideStats.buy.netPnl >= 0 ? '+' : ''
  const sellSign = sideStats.sell.netPnl >= 0 ? '+' : ''
  md += `| **BUY (Long)** | ${sideStats.buy.total} | ${sideStats.buy.wins} | ${sideStats.buy.losses} | ${sideStats.buy.winRate}% | ${buySign}$${sideStats.buy.netPnl.toFixed(2)} |\n`
  md += `| **SELL (Short)** | ${sideStats.sell.total} | ${sideStats.sell.wins} | ${sideStats.sell.losses} | ${sideStats.sell.winRate}% | ${sellSign}$${sideStats.sell.netPnl.toFixed(2)} |\n\n`
  md += `---\n\n`

  // Detailed Trade Log Table
  md += `## 📋 Detailed Trade Log\n\n`
  md += `| # | ID | Date & Time | Setup | Symbol | Side | Session | RR | PnL ($) | Quality | Notes |\n`
  md += `| :-: | :-: | :--- | :--- | :--- | :-: | :--- | :-: | :-: | :-: | :--- |\n`

  trades.forEach((t, index) => {
    const id = t.id ?? index + 1
    const dt = t.entryDatetime ? new Date(t.entryDatetime).toISOString().replace('T', ' ').slice(0, 16) : '-'
    const setup = (t.setupName || '-').replace(/\|/g, '\\|')
    const symbol = (t.symbol || '-').replace(/\|/g, '\\|')
    const side = t.position || '-'
    const session = (t.sessionName || '-').replace(/\|/g, '\\|')
    const rr = `${getRr(t, statMode).toFixed(2)}R`
    const pnlVal = Number(t.pnl) || 0
    const pnl = `${pnlVal >= 0 ? '+' : ''}$${pnlVal.toFixed(2)}`
    const quality = t.quality || '-'
    const notes = (t.notes || '').replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|')

    md += `| ${index + 1} | ${id} | ${dt} | ${setup} | ${symbol} | ${side} | ${session} | ${rr} | ${pnl} | ${quality} | ${notes} |\n`
  })

  md += `\n`
  return md
}

/**
 * Generate AI-Ready JSON document
 */
export function generateAiJsonReport(payload: AiExportPayload): string {
  const trades = payload.trades || []
  const statMode = payload.statMode || 'normal'

  const structured = {
    schemaVersion: '1.0.0',
    reportType: 'trading_journal_performance_ai_report',
    generatedAt: new Date().toISOString(),
    statMode,
    filters: payload.filters || {},
    kpis: payload.kpis || {},
    breakdowns: {
      setups: computeSetupBreakdown(trades, statMode),
      sessions: computeSessionBreakdown(trades, statMode),
      sides: computeSideBreakdown(trades, statMode)
    },
    trades: trades.map((t, index) => ({
      index: index + 1,
      id: t.id,
      entryDatetime: t.entryDatetime,
      exitDatetime: t.exitDatetime,
      setupName: t.setupName,
      symbol: t.symbol,
      position: t.position,
      sessionName: t.sessionName,
      rr: getRr(t, statMode),
      normalRr: t.normalRr,
      beRr: t.beRr,
      trailRr: t.trailRr,
      pnl: Number(t.pnl) || 0,
      quality: t.quality,
      notes: t.notes
    }))
  }

  return JSON.stringify(structured, null, 2)
}

/**
 * Native file save dialog for AI Markdown and JSON exports
 */
export async function exportAiReportToFile(
  mainWindow: BrowserWindow | null,
  payload: AiExportPayload
): Promise<{
  success: boolean
  canceled?: boolean
  filePath?: string
  format?: 'md' | 'json'
  error?: string
}> {
  try {
    const requestedFormat = payload.format || 'md'
    const defaultExt = requestedFormat === 'json' ? 'json' : 'md'
    const defaultFilename = `${payload.defaultName || 'trading_journal_ai_report'}_${Date.now()}.${defaultExt}`

    const dialogOptions: Electron.SaveDialogOptions = {
      title: 'Export AI Analysis Report',
      defaultPath: defaultFilename,
      filters:
        requestedFormat === 'json'
          ? [
              { name: 'JSON Document (*.json)', extensions: ['json'] },
              { name: 'Markdown Document (*.md)', extensions: ['md'] }
            ]
          : [
              { name: 'Markdown Document (*.md)', extensions: ['md'] },
              { name: 'JSON Document (*.json)', extensions: ['json'] }
            ]
    }

    const { canceled, filePath } = mainWindow
      ? await dialog.showSaveDialog(mainWindow, dialogOptions)
      : await dialog.showSaveDialog(dialogOptions)

    if (canceled || !filePath) {
      return { success: false, canceled: true }
    }

    const lowerPath = filePath.toLowerCase()
    const isJson = lowerPath.endsWith('.json')
    const format = isJson ? 'json' : 'md'
    const content = isJson ? generateAiJsonReport(payload) : generateAiMarkdownReport(payload)

    fs.writeFileSync(filePath, content, 'utf-8')

    return {
      success: true,
      filePath,
      format
    }
  } catch (error: any) {
    console.error('Failed to export AI report:', error)
    return {
      success: false,
      error: error?.message || 'Failed to export AI report'
    }
  }
}
