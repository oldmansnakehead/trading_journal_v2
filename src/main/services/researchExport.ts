import { BrowserWindow, dialog } from 'electron'
import * as fs from 'fs'
import * as archiverPkg from 'archiver'
import type { ResearchExportPayload } from '../../shared/types'
import {
  buildSheetXml,
  buildWorkbookXml,
  buildWorkbookRelsXml,
  buildContentTypesXml,
  buildStylesXml,
  buildRelsXml,
  buildCsvContent
} from './excelExport'

const createZipArchive = (options: any) => {
  const pkg: any = archiverPkg
  if (pkg.ZipArchive) {
    return new pkg.ZipArchive(options)
  }
  if (typeof pkg.default === 'function') {
    return pkg.default('zip', options)
  }
  if (typeof pkg === 'function') {
    return pkg('zip', options)
  }
  if (pkg.default && pkg.default.ZipArchive) {
    return new pkg.default.ZipArchive(options)
  }
  throw new Error('Could not initialize zip archive engine')
}

/**
 * Generate AI-Ready Markdown document for Research and Zone Statistics
 */
export function generateResearchAiMarkdown(payload: ResearchExportPayload): string {
  const setupName = payload.setupName || 'All Research Setups'
  const entries = payload.entries || []
  const analytics = payload.analytics
  const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)

  let md = ''
  md += `# 🔬 Trade Research & Zone Statistics: AI Deep Analysis Report\n\n`
  md += `> **Generated:** ${generatedAt}  \n`
  md += `> **Setup:** ${setupName}  \n`
  if (payload.setupDescription) {
    md += `> **Setup Description:** ${payload.setupDescription}  \n`
  }
  md += `> **Sample Size:** ${entries.length} Trade Records  \n\n`

  md += `---\n\n`
  md += `## 🤖 AI Prompt & Edge Analysis Instructions\n\n`
  md += `You are an elite quantitative researcher, market technician, and execution performance analyst.\n`
  md += `Your objective is to review the following empirical zone-level research data for trading setup **"${setupName}"** and extract deep strategic insights.\n\n`
  md += `### Questions to Answer:\n`
  md += `1. **Expected Value & Edge Attribution:** Which entry zone yields the highest mathematical expectancy (EV) over the long run? Is the highest Win Rate zone also the most profitable, or does a lower-accuracy zone with asymmetric RR provide greater total alpha?\n`
  md += `2. **Fill vs Miss Trade-off:** Analyze the Miss Rate across zones. Does waiting for a deeper retest / extreme zone cause an unacceptably high opportunity cost (ตกรถ)? What is the optimal balance between high fill rate and tight Stop Loss points?\n`
  md += `3. **Contextual Edge Decay:** Breakdown results by Session (Asia, London, NY), Timeframe, and News events. Under which specific conditions does each zone thrive or fail?\n`
  md += `4. **Concrete Playbook Optimization:** Formulate concrete, testable rules to update this trading playbook. Recommend exact Stop Loss placement and Take Profit scaling targets (Min RR vs Max RR potential).\n\n`

  md += `---\n\n`

  // Playbook Rules section if available
  if (payload.playbookContent && payload.playbookContent.trim()) {
    md += `## 📖 Strategy Playbook Rules & Hypothesis\n\n`
    md += `\`\`\`markdown\n`
    md += `${payload.playbookContent.trim()}\n`
    md += `\`\`\`\n\n`
    md += `---\n\n`
  }

  // Zone Comparison Metrics Table
  if (analytics && analytics.zoneMetrics && analytics.zoneMetrics.length > 0) {
    md += `## 📊 Zone Comparison Matrix (Aggregated Performance)\n\n`
    md += `| Zone Name | Samples | Fill % | Miss % | Win % | Loss % | Avg Min RR | Avg Max RR | Avg SL Pts | Expected Value (EV) |\n`
    md += `| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |\n`

    for (const zm of analytics.zoneMetrics) {
      const isBestEv = zm.customColumnId === analytics.bestEvZoneId ? ' 🏆' : ''
      const isHighestWin = zm.customColumnId === analytics.highestWinRateZoneId ? ' 🎯' : ''
      const isLowestMiss = zm.customColumnId === analytics.lowestMissRateZoneId ? ' 🚊' : ''
      const isHighestMax = zm.customColumnId === analytics.highestMaxRrZoneId ? ' 🚀' : ''
      const badges = `${isBestEv}${isHighestWin}${isLowestMiss}${isHighestMax}`

      const colName = zm.columnName || (zm as any).customColumnName || `Zone #${zm.customColumnId}`
      md += `| **${colName}**${badges} | ${zm.totalSamples} | ${zm.fillRate.toFixed(1)}% | ${zm.missRate.toFixed(1)}% | ${zm.winRate.toFixed(1)}% | ${zm.lossRate.toFixed(1)}% | ${zm.avgMinRr.toFixed(2)}R | ${zm.avgMaxRr.toFixed(2)}R | ${zm.avgSlPoints.toFixed(1)} | **${zm.expectedValue.toFixed(2)}** |\n`
    }
    md += `\n`

    // Badges legend
    md += `> **Badges Legend:** 🏆 Best Expected Value | 🎯 Highest Win Rate | 🚊 Lowest Miss Rate (Most Reliable Entry) | 🚀 Highest Max RR Potential\n\n`
    md += `---\n\n`
  }

  // Session & Timeframe Breakdown
  md += `## ⏱️ Environmental Distribution\n\n`
  const sessionCounts: Record<string, number> = {}
  const tfCounts: Record<string, number> = {}
  let newsCount = 0

  for (const e of entries) {
    const s = e.sessionName || 'Unknown'
    sessionCounts[s] = (sessionCounts[s] || 0) + 1
    const tf = e.timeframe || 'Unknown'
    tfCounts[tf] = (tfCounts[tf] || 0) + 1
    if (e.news) newsCount++
  }

  md += `- **Sessions:** ${Object.entries(sessionCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}\n`
  md += `- **Timeframes:** ${Object.entries(tfCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}\n`
  md += `- **High Impact News Events:** ${newsCount} trades (${entries.length > 0 ? ((newsCount / entries.length) * 100).toFixed(1) : 0}% of samples)\n\n`
  md += `---\n\n`

  // Detailed Research Trade Logs
  md += `## 📋 Granular Research Trade Logs\n\n`
  md += `| # | Date & Time | Symbol | Session | TF | News | Quality | Zone Name | Bias | Min RR | Max RR | SL Pts | Outcome | Custom Data | Notes |\n`
  md += `| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :--- | :-: | :-: | :-: | :-: | :-: | :--- | :--- |\n`

  let rowIdx = 1
  for (const e of entries) {
    const dt = e.entryDatetime ? e.entryDatetime.replace('T', ' ').slice(0, 16) : '-'
    const sym = e.symbolName || `Symbol #${e.symbolId}`
    const sess = e.sessionName || '-'
    const tf = e.timeframe || '-'
    const news = e.news ? 'Yes' : 'No'
    const q = e.quality || '-'
    const customDataStr =
      e.customData && Object.keys(e.customData).length > 0
        ? Object.entries(e.customData)
            .filter(([_, v]) => v !== null && v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('; ')
            .replace(/[\r\n]+/g, ' ')
            .replace(/\|/g, '\\|') || '-'
        : '-'

    if (e.zones && e.zones.length > 0) {
      for (const z of e.zones) {
        const zoneName = (z.customColumnName || `Zone #${z.customColumnId}`).replace(/\|/g, '\\|')
        const bias = z.bias || '-'
        const minRr = z.isMissed ? 'Missed' : z.minRr !== null && z.minRr !== undefined ? `${z.minRr}R` : '-'
        const maxRr = z.isMissed ? '-' : z.maxRr !== null && z.maxRr !== undefined ? `${z.maxRr}R` : '-'
        const slPts = z.minSlPoints !== null && z.minSlPoints !== undefined ? `${z.minSlPoints}` : '-'
        const outcome = (z.outcome || (z.isMissed ? 'missed' : '-')).toUpperCase()
        const note = (z.notes || e.notes || '').replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|')

        md += `| ${rowIdx++} | ${dt} | ${sym} | ${sess} | ${tf} | ${news} | ${q} | ${zoneName} | ${bias} | ${minRr} | ${maxRr} | ${slPts} | ${outcome} | ${customDataStr} | ${note} |\n`
      }
    } else {
      const note = (e.notes || '').replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|')
      md += `| ${rowIdx++} | ${dt} | ${sym} | ${sess} | ${tf} | ${news} | ${q} | - | - | - | - | - | - | ${customDataStr} | ${note} |\n`
    }
  }

  md += `\n`
  return md
}

/**
 * Generate AI-Ready JSON document
 */
export function generateResearchAiJson(payload: ResearchExportPayload): string {
  const structured = {
    schemaVersion: '1.0.0',
    reportType: 'trade_research_zone_statistics_ai_report',
    generatedAt: new Date().toISOString(),
    setupName: payload.setupName || 'All Setups',
    setupDescription: payload.setupDescription || null,
    playbookContent: payload.playbookContent || null,
    filters: payload.filters || {},
    analytics: payload.analytics || null,
    entries: (payload.entries || []).map((e, idx) => ({
      index: idx + 1,
      id: e.id,
      entryDatetime: e.entryDatetime,
      exitDatetime: e.exitDatetime,
      setupName: e.setupName,
      symbolName: e.symbolName,
      sessionName: e.sessionName,
      timeframe: e.timeframe,
      news: Boolean(e.news),
      quality: e.quality,
      notes: e.notes,
      customData: e.customData || null,
      zones: (e.zones || []).map((z: any) => ({
        customColumnName: z.customColumnName,
        bias: z.bias,
        minRr: z.minRr,
        maxRr: z.maxRr,
        slPoints: z.slPoints ?? z.minSlPoints,
        realSlPoints: z.realSlPoints ?? null,
        isMissed: Boolean(z.isMissed),
        outcome: z.outcome,
        notes: z.notes
      }))
    }))
  }

  return JSON.stringify(structured, null, 2)
}

/**
 * Save AI Markdown / JSON Report via Native Dialog
 */
export async function exportResearchAiReportToFile(
  mainWindow: BrowserWindow | null,
  payload: ResearchExportPayload
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
    const cleanSetup = (payload.setupName || 'research')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
    const defaultFilename = `${payload.defaultName || `trade_research_${cleanSetup}`}_${Date.now()}.${defaultExt}`

    const dialogOptions: Electron.SaveDialogOptions = {
      title: 'Export Trade Research AI Report',
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
    const content = isJson
      ? generateResearchAiJson(payload)
      : generateResearchAiMarkdown(payload)

    fs.writeFileSync(filePath, content, 'utf-8')

    return {
      success: true,
      filePath,
      format
    }
  } catch (error: any) {
    console.error('Failed to export research AI report:', error)
    return {
      success: false,
      error: error?.message || 'Failed to export research AI report'
    }
  }
}

/**
 * Export Research entries and Zone metrics to Excel (.xlsx) / CSV
 */
export async function exportResearchTradesToExcel(
  mainWindow: BrowserWindow | null,
  payload: {
    entries: any[]
    analytics?: any
    setupName?: string
    defaultName?: string
  }
): Promise<{ success: boolean; canceled?: boolean; filePath?: string; error?: string }> {
  try {
    const cleanSetup = (payload.setupName || 'research')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
    const defaultFilename = `${payload.defaultName || `trade_research_${cleanSetup}`}_${Date.now()}.xlsx`

    const dialogOptions: Electron.SaveDialogOptions = {
      title: 'Export Trade Research to Excel / CSV',
      defaultPath: defaultFilename,
      filters: [
        { name: 'Excel Workbook (*.xlsx)', extensions: ['xlsx'] },
        { name: 'CSV File (*.csv)', extensions: ['csv'] }
      ]
    }

    const { canceled, filePath } = mainWindow
      ? await dialog.showSaveDialog(mainWindow, dialogOptions)
      : await dialog.showSaveDialog(dialogOptions)

    if (canceled || !filePath) {
      return { success: false, canceled: true }
    }

    // Prepare Sheet 1: Granular Trades Rows
    const tradeHeaders = [
      'ID',
      'Entry Datetime',
      'Exit Datetime',
      'Setup',
      'Symbol',
      'Session',
      'Timeframe',
      'News',
      'Quality',
      'Zone Name',
      'Bias',
      'Min RR',
      'Max RR',
      'SL Points',
      'Real SL Points',
      'Outcome',
      'Missed',
      'Zone Notes',
      'General Notes'
    ]

    const tradeRows: any[][] = []
    for (const e of payload.entries || []) {
      if (e.zones && e.zones.length > 0) {
        for (const z of e.zones) {
          tradeRows.push([
            e.id,
            e.entryDatetime,
            e.exitDatetime || '',
            e.setupName || '',
            e.symbolName || '',
            e.sessionName || '',
            e.timeframe || '',
            e.news ? 'Yes' : 'No',
            e.quality || '',
            z.customColumnName || '',
            z.bias || '',
            z.isMissed ? '' : z.minRr ?? '',
            z.isMissed ? '' : z.maxRr ?? '',
            z.slPoints ?? z.minSlPoints ?? '',
            z.realSlPoints ?? '',
            z.outcome || '',
            z.isMissed ? 'Yes' : 'No',
            z.notes || '',
            e.notes || ''
          ])
        }
      } else {
        tradeRows.push([
          e.id,
          e.entryDatetime,
          e.exitDatetime || '',
          e.setupName || '',
          e.symbolName || '',
          e.sessionName || '',
          e.timeframe || '',
          e.news ? 'Yes' : 'No',
          e.quality || '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          'No',
          '',
          e.notes || ''
        ])
      }
    }

    // Prepare Sheet 2: Zone Analytics Summary
    const summaryHeaders = [
      'Zone Name',
      'Total Samples',
      'Fill Rate (%)',
      'Miss Rate (%)',
      'Win Count',
      'Loss Count',
      'BE Count',
      'Win Rate (%)',
      'Loss Rate (%)',
      'Avg Min RR',
      'Avg Max RR',
      'Avg SL Points',
      'Expected Value (EV)'
    ]

    const summaryRows: any[][] = []
    if (payload.analytics && payload.analytics.zoneMetrics) {
      for (const zm of payload.analytics.zoneMetrics) {
        summaryRows.push([
          zm.columnName || (zm as any).customColumnName || `Zone #${zm.customColumnId}`,
          zm.totalSamples,
          Number(zm.fillRate.toFixed(2)),
          Number(zm.missRate.toFixed(2)),
          zm.winCount,
          zm.lossCount,
          zm.beCount,
          Number(zm.winRate.toFixed(2)),
          Number(zm.lossRate.toFixed(2)),
          Number(zm.avgMinRr.toFixed(2)),
          Number(zm.avgMaxRr.toFixed(2)),
          Number(zm.avgSlPoints.toFixed(2)),
          Number(zm.expectedValue.toFixed(2))
        ])
      }
    }

    if (filePath.toLowerCase().endsWith('.csv')) {
      const csvContent = buildCsvContent(tradeHeaders, tradeRows)
      fs.writeFileSync(filePath, csvContent, 'utf-8')
      return { success: true, filePath }
    }

    // Build .xlsx via archiver
    const sheet1Xml = buildSheetXml([tradeHeaders, ...tradeRows])
    const sheet2Xml = buildSheetXml([summaryHeaders, ...summaryRows])

    const archive = createZipArchive({ zlib: { level: 9 } })
    const output = fs.createWriteStream(filePath)

    await new Promise<void>((resolve, reject) => {
      output.on('close', resolve)
      archive.on('error', reject)
      archive.pipe(output)

      archive.append(buildRelsXml(), { name: '_rels/.rels' })
      archive.append(buildContentTypesXml(), { name: '[Content_Types].xml' })
      archive.append(buildWorkbookXml(), { name: 'xl/workbook.xml' })
      archive.append(buildWorkbookRelsXml(), { name: 'xl/_rels/workbook.xml.rels' })
      archive.append(buildStylesXml(), { name: 'xl/styles.xml' })
      archive.append(sheet1Xml, { name: 'xl/worksheets/sheet1.xml' })
      archive.append(sheet2Xml, { name: 'xl/worksheets/sheet2.xml' })

      archive.finalize()
    })

    return { success: true, filePath }
  } catch (error: any) {
    console.error('Failed to export research trades to Excel:', error)
    return {
      success: false,
      error: error?.message || 'Failed to export research trades to Excel'
    }
  }
}
