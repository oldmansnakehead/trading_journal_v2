import type {
  ResearchEntry,
  ResearchSession,
  ZoneComparisonMetric,
  ResearchAnalyticsSummary
} from '../../../shared/types'

/**
 * Auto-detect session based on entry datetime (HH:mm) and a list of setup sessions.
 */
export function detectSessionFromTime(
  entryDatetime: string,
  sessions: ResearchSession[]
): string | null {
  if (!entryDatetime || !sessions || sessions.length === 0) return null

  try {
    const date = new Date(entryDatetime)
    if (isNaN(date.getTime())) return null

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const timeStr = `${hours}:${minutes}`

    for (const session of sessions) {
      if (!session.startTime || !session.endTime) continue

      if (session.startTime <= session.endTime) {
        // Normal range within same day (e.g. 08:00 - 16:00)
        if (timeStr >= session.startTime && timeStr <= session.endTime) {
          return session.sessionName
        }
      } else {
        // Overnight range (e.g. 22:00 - 04:00)
        if (timeStr >= session.startTime || timeStr <= session.endTime) {
          return session.sessionName
        }
      }
    }
  } catch {
    return null
  }

  return null
}

/**
 * Auto-sync bias logic:
 * When the first column changes bias, sync to all other columns.
 * Subsequent column edits only change themselves.
 */
export function syncBiasValues<T extends { bias?: string }>(
  zones: T[],
  changedIndex: number,
  newBias: string
): T[] {
  if (changedIndex === 0) {
    // Sync all zones to new bias
    return zones.map((z) => ({
      ...z,
      bias: newBias
    }))
  }
  // Only override the specific zone
  return zones.map((z, idx) => (idx === changedIndex ? { ...z, bias: newBias } : z))
}

/**
 * Auto-copy SL Points logic:
 * When minSlPoints changes, copy to maxSlPoints.
 * Editing maxSlPoints does NOT affect minSlPoints.
 */
export function handleSlPointsChange<T extends { minSlPoints?: number | null; maxSlPoints?: number | null }>(
  zone: T,
  field: 'min' | 'max',
  value: number | null
): T {
  if (field === 'min') {
    return {
      ...zone,
      minSlPoints: value,
      maxSlPoints: value
    }
  }
  return {
    ...zone,
    maxSlPoints: value
  }
}

/**
 * Compute Zone Comparison Metrics and Badges from an array of Research Entries.
 */
export function computeResearchAnalytics(entries: ResearchEntry[]): ResearchAnalyticsSummary {
  const totalEntries = entries.length
  if (totalEntries === 0) {
    return {
      totalEntries: 0,
      zoneMetrics: []
    }
  }

  const columnMap = new Map<
    number,
    {
      columnName: string
      records: Array<{
        isMissed?: boolean
        minRr?: number | null
        maxRr?: number | null
        minSlPoints?: number | null
        outcome?: string
      }>
    }
  >()

  for (const entry of entries) {
    if (!entry.zones) continue
    for (const z of entry.zones) {
      const colId = z.customColumnId
      if (!columnMap.has(colId)) {
        columnMap.set(colId, {
          columnName: z.customColumnName || `Zone #${colId}`,
          records: []
        })
      }
      columnMap.get(colId)!.records.push(z)
    }
  }

  const zoneMetrics: ZoneComparisonMetric[] = []

  for (const [colId, data] of columnMap.entries()) {
    const totalSamples = data.records.length
    const missedCount = data.records.filter((r) => r.isMissed).length
    const filledRecords = data.records.filter((r) => !r.isMissed)
    const filledCount = filledRecords.length

    const fillRate = totalSamples > 0 ? (filledCount / totalSamples) * 100 : 0
    const missRate = totalSamples > 0 ? (missedCount / totalSamples) * 100 : 0

    let winCount = 0
    let lossCount = 0
    let beCount = 0
    let winMinRrSum = 0
    let minRrSum = 0
    let maxRrSum = 0
    let slPointsSum = 0
    let slPointsCount = 0

    for (const r of filledRecords) {
      const minRr = r.minRr !== null && r.minRr !== undefined ? Number(r.minRr) : null
      const maxRr = r.maxRr !== null && r.maxRr !== undefined ? Number(r.maxRr) : null
      const minSl =
        r.minSlPoints !== null && r.minSlPoints !== undefined ? Number(r.minSlPoints) : null

      if (minSl !== null && !isNaN(minSl)) {
        slPointsSum += minSl
        slPointsCount++
      }

      if (minRr !== null && !isNaN(minRr)) {
        minRrSum += minRr
        if (minRr > 0) {
          winCount++
          winMinRrSum += minRr
        } else if (minRr === -1) {
          lossCount++
        } else if (minRr === 0) {
          beCount++
        } else if (minRr < 0) {
          lossCount++
        }
      } else if (r.outcome === 'loss') {
        lossCount++
      } else if (r.outcome === 'win') {
        winCount++
      } else if (r.outcome === 'be') {
        beCount++
      }

      if (maxRr !== null && !isNaN(maxRr)) {
        maxRrSum += maxRr
      }
    }

    const winRate = filledCount > 0 ? (winCount / filledCount) * 100 : 0
    const lossRate = filledCount > 0 ? (lossCount / filledCount) * 100 : 0
    const avgMinRr = filledCount > 0 ? minRrSum / filledCount : 0
    const avgMaxRr = filledCount > 0 ? maxRrSum / filledCount : 0
    const avgSlPoints = slPointsCount > 0 ? slPointsSum / slPointsCount : 0
    const avgWinMinRr = winCount > 0 ? winMinRrSum / winCount : 0

    // EV = (Win Rate % / 100 * Avg Win RR) - (Loss Rate % / 100 * 1)
    const expectedValue = (winRate / 100) * avgWinMinRr - (lossRate / 100) * 1

    zoneMetrics.push({
      customColumnId: colId,
      columnName: data.columnName,
      totalSamples,
      filledCount,
      missedCount,
      fillRate: Number(fillRate.toFixed(1)),
      missRate: Number(missRate.toFixed(1)),
      winCount,
      lossCount,
      beCount,
      winRate: Number(winRate.toFixed(1)),
      lossRate: Number(lossRate.toFixed(1)),
      avgMinRr: Number(avgMinRr.toFixed(2)),
      avgMaxRr: Number(avgMaxRr.toFixed(2)),
      avgSlPoints: Number(avgSlPoints.toFixed(1)),
      expectedValue: Number(expectedValue.toFixed(2))
    })
  }

  // Calculate Badges
  let bestEvZoneId: number | null = null
  let maxEv = -Infinity
  let highestWinRateZoneId: number | null = null
  let maxWinRate = -1
  let lowestMissRateZoneId: number | null = null
  let minMissRate = Infinity
  let highestMaxRrZoneId: number | null = null
  let maxPeakRr = -Infinity

  for (const m of zoneMetrics) {
    if (m.totalSamples >= 1) {
      if (m.expectedValue > maxEv) {
        maxEv = m.expectedValue
        bestEvZoneId = m.customColumnId
      }
      if (m.filledCount >= 1 && m.winRate > maxWinRate) {
        maxWinRate = m.winRate
        highestWinRateZoneId = m.customColumnId
      }
      if (m.missRate < minMissRate) {
        minMissRate = m.missRate
        lowestMissRateZoneId = m.customColumnId
      }
      if (m.avgMaxRr > maxPeakRr) {
        maxPeakRr = m.avgMaxRr
        highestMaxRrZoneId = m.customColumnId
      }
    }
  }

  return {
    totalEntries,
    setupId: entries[0]?.setupId,
    setupName: entries[0]?.setupName,
    zoneMetrics,
    bestEvZoneId,
    highestWinRateZoneId,
    lowestMissRateZoneId,
    highestMaxRrZoneId
  }
}
