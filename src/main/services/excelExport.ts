import { BrowserWindow, dialog } from 'electron'
import * as archiverPkg from 'archiver'
import fs from 'fs'
import { promises as fsp } from 'fs'
import { join } from 'path'

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

export function escapeXml(str: any): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function getColumnLetter(colIndex: number): string {
  let temp = colIndex
  let letter = ''
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter
    temp = Math.floor(temp / 26) - 1
  }
  return letter
}

export function buildSheetXml(rows: (string | number | boolean | null | undefined)[][]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n'
  xml += '  <sheetData>\n'

  rows.forEach((row, rowIndex) => {
    const rowNum = rowIndex + 1
    const isHeader = rowIndex === 0
    xml += `    <row r="${rowNum}">\n`
    row.forEach((cell, colIndex) => {
      const colLetter = getColumnLetter(colIndex)
      const cellRef = `${colLetter}${rowNum}`
      const styleAttr = isHeader ? ' s="1"' : ''

      if (cell === null || cell === undefined || cell === '') {
        xml += `      <c r="${cellRef}"${styleAttr}/>\n`
      } else if (typeof cell === 'number' && !isNaN(cell)) {
        xml += `      <c r="${cellRef}"${styleAttr}><v>${cell}</v></c>\n`
      } else if (typeof cell === 'boolean') {
        xml += `      <c r="${cellRef}"${styleAttr} t="b"><v>${cell ? 1 : 0}</v></c>\n`
      } else {
        const text = escapeXml(cell)
        xml += `      <c r="${cellRef}"${styleAttr} t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>\n`
      }
    })
    xml += '    </row>\n'
  })

  xml += '  </sheetData>\n'
  xml += '</worksheet>'
  return xml
}

export function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><name val="Calibri"/><sz val="11"/></font>
    <font><b/><color rgb="FF1F2937"/><name val="Calibri"/><sz val="11"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/></border>
    <border>
      <left style="thin"><color rgb="FFE5E7EB"/></left>
      <right style="thin"><color rgb="FFE5E7EB"/></right>
      <top style="thin"><color rgb="FFE5E7EB"/></top>
      <bottom style="thin"><color rgb="FFE5E7EB"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`
}

export function buildWorkbookXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Trades" sheetId="1" r:id="rId1"/>
    <sheet name="KPI Summary" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`
}

export function buildWorkbookRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
}

export function buildContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
}

export function buildRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
}

export function buildCsvContent(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const bom = '\uFEFF'
  const formatCell = (val: any) => {
    if (val === null || val === undefined) return '""'
    const str = String(val)
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return `"${str}"`
  }
  const lines = [
    headers.map(formatCell).join(','),
    ...rows.map((row) => row.map(formatCell).join(','))
  ]
  return bom + lines.join('\r\n')
}

export interface ExportDataPayload {
  trades: any[]
  kpis?: any
  statMode?: string
  filters?: any
  defaultName?: string
}

export function transformTradesToRows(
  trades: any[],
  statMode: string = 'normal'
): { headers: string[]; rows: (string | number | boolean | null | undefined)[][] } {
  const headers = [
    'ID',
    'Entry Date & Time',
    'Exit Date & Time',
    'Setup',
    'Symbol',
    'Position',
    'Session',
    'Direction Bias',
    'Timeframe',
    'News',
    'Quality',
    'Paper Trade',
    'Normal RR',
    'Normal Max RR',
    'Normal SL Points',
    'Normal TP Points',
    'BE RR',
    'BE Max RR',
    'Trail RR',
    'Trail Max RR',
    `Realized RR [${statMode.toUpperCase()}]`,
    'Notes'
  ]

  const rows = trades.map((t) => {
    let realizedRr: any = t.normalRr
    if (statMode === 'be') {
      realizedRr = t.beRr !== null && t.beRr !== undefined ? t.beRr : t.normalRr
    } else if (statMode === 'trail') {
      realizedRr = t.trailRr !== null && t.trailRr !== undefined ? t.trailRr : t.normalRr
    }

    return [
      t.id,
      t.entryDatetime ? new Date(t.entryDatetime).toLocaleString() : '',
      t.exitDatetime ? new Date(t.exitDatetime).toLocaleString() : '',
      t.setupName || '-',
      t.symbolName || '-',
      t.position || '-',
      t.sessionName || '-',
      t.directionBias || '-',
      t.entryTimeframe || '-',
      t.news ? 'Yes' : 'No',
      t.quality || '-',
      t.isTest ? 'Yes' : 'No',
      t.normalRr ?? '',
      t.normalMaxRr ?? '',
      t.normalSlPoints ?? '',
      t.normalTpPoints ?? '',
      t.beRr ?? '',
      t.beMaxRr ?? '',
      t.trailRr ?? '',
      t.trailMaxRr ?? '',
      realizedRr ?? '',
      t.notes || ''
    ]
  })

  return { headers, rows }
}

export function transformKpisToRows(
  kpis: any,
  statMode: string = 'normal',
  filters: any = {}
): { headers: string[]; rows: (string | number | boolean | null | undefined)[][] } {
  const headers = ['Metric', 'Value']
  const rows: (string | number | boolean | null | undefined)[][] = [
    ['Export Date', new Date().toLocaleString()],
    ['Stat Mode', statMode.toUpperCase()],
    ['Filter Setup', filters?.setup || 'All'],
    ['Filter Symbol', filters?.symbol || 'All'],
    ['Filter Session', filters?.session || 'All'],
    ['Filter Date Range', `${filters?.startDate || 'Any'} to ${filters?.endDate || 'Any'}`],
    ['Include Paper Trades', filters?.includePaperTrades ? 'Yes' : 'No']
  ]

  if (kpis) {
    rows.push(
      ['Total Trades', kpis.totalTrades ?? 0],
      ['Winning Trades', kpis.wins ?? 0],
      ['Losing Trades', kpis.losses ?? 0],
      ['Win Rate (%)', kpis.winRate ? `${kpis.winRate}%` : '0%'],
      ['Net PnL ($)', kpis.netPnL ?? 0],
      ['Gross Profit ($)', kpis.grossProfit ?? 0],
      ['Gross Loss ($)', kpis.grossLoss ?? 0],
      ['Profit Factor', kpis.profitFactor ?? 0],
      ['Average RR', kpis.avgRR ?? 0],
      ['Maximum RR', kpis.maxRR ?? 0],
      ['Total RR', kpis.totalRR ?? 0],
      ['Max Drawdown (%)', kpis.maxDrawdownPercent ? `${kpis.maxDrawdownPercent}%` : '0%'],
      ['Consecutive Wins', kpis.consecutiveWins ?? 0],
      ['Consecutive Losses', kpis.consecutiveLosses ?? 0]
    )
  }

  return { headers, rows }
}

export async function exportTradesToExcel(
  window: BrowserWindow,
  payload: ExportDataPayload
): Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }> {
  try {
    const { trades, kpis, statMode = 'normal', filters = {}, defaultName } = payload
    const dateStr = new Date().toISOString().split('T')[0]
    const defaultPath = defaultName || `Trading_Journal_${statMode.toUpperCase()}_${dateStr}.xlsx`

    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      title: 'Export Trades to Excel / CSV',
      defaultPath,
      filters: [
        { name: 'Excel Workbook (*.xlsx)', extensions: ['xlsx'] },
        { name: 'CSV File (*.csv)', extensions: ['csv'] }
      ]
    })

    if (canceled || !filePath) {
      return { success: false, canceled: true }
    }

    const parentDir = join(filePath, '..')
    if (!fs.existsSync(parentDir)) {
      await fsp.mkdir(parentDir, { recursive: true })
    }

    const { headers: tradeHeaders, rows: tradeRows } = transformTradesToRows(trades, statMode)
    const { headers: kpiHeaders, rows: kpiRows } = transformKpisToRows(kpis, statMode, filters)

    const isCsv = filePath.toLowerCase().endsWith('.csv')

    if (isCsv) {
      // Export as CSV with UTF-8 BOM
      const csvData = buildCsvContent(tradeHeaders, tradeRows)
      await fsp.writeFile(filePath, csvData, 'utf8')
      return { success: true, filePath }
    }

    // Export as OpenXML (.xlsx) using Archiver
    return new Promise((resolve) => {
      try {
        const output = fs.createWriteStream(filePath)
        const archive = createZipArchive({ zlib: { level: 9 } })

        output.on('close', () => {
          resolve({ success: true, filePath })
        })

        output.on('error', (err: any) => {
          resolve({ success: false, error: err.message })
        })

        archive.on('error', (err: any) => {
          resolve({ success: false, error: err.message })
        })

        archive.pipe(output)

        // 1. Core relationship files
        archive.append(buildRelsXml(), { name: '_rels/.rels' })
        archive.append(buildContentTypesXml(), { name: '[Content_Types].xml' })

        // 2. Workbook & Workbook relationships
        archive.append(buildWorkbookXml(), { name: 'xl/workbook.xml' })
        archive.append(buildWorkbookRelsXml(), { name: 'xl/_rels/workbook.xml.rels' })
        archive.append(buildStylesXml(), { name: 'xl/styles.xml' })

        // 3. Worksheets
        const sheet1Xml = buildSheetXml([tradeHeaders, ...tradeRows])
        const sheet2Xml = buildSheetXml([kpiHeaders, ...kpiRows])

        archive.append(sheet1Xml, { name: 'xl/worksheets/sheet1.xml' })
        archive.append(sheet2Xml, { name: 'xl/worksheets/sheet2.xml' })

        archive.finalize()
      } catch (err: any) {
        resolve({ success: false, error: err.message })
      }
    })
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
