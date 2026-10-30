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
        isNoZone?: boolean
        invalidationReason?: string | null
        holdingDurationMinutes?: number | null
        holdingBars?: number | null
        entryDatetime?: string | null
        exitDatetime?: string | null
        zoneInstanceName?: string | null
        minRr?: number | null
        maxRr?: number | null
        slPoints?: number | null
        realSlPoints?: number | null
        minSlPoints?: number | null
        maxSlPoints?: number | null
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
    const noZoneCount = data.records.filter((r) => r.isNoZone || r.outcome === 'no_zone').length
    const formedRecords = data.records.filter((r) => !r.isNoZone && r.outcome !== 'no_zone')
    const formedCount = formedRecords.length
    const formationRate = totalSamples > 0 ? (formedCount / totalSamples) * 100 : 0

    const missedCount = formedRecords.filter((r) => r.isMissed || r.outcome === 'missed').length
    const filledRecords = formedRecords.filter((r) => !r.isMissed && r.outcome !== 'missed')
    const filledCount = filledRecords.length

    const fillRate = formedCount > 0 ? (filledCount / formedCount) * 100 : 0
    const missRate = formedCount > 0 ? (missedCount / formedCount) * 100 : 0

    let winCount = 0
    let lossCount = 0
    let beCount = 0
    let winMinRrSum = 0
    let minRrSum = 0
    let maxRrSum = 0
    let slPointsSum = 0
    let slPointsCount = 0
    let realSlPointsSum = 0
    let realSlPointsCount = 0
    const winningRealSls: number[] = []
    const invalidationBreakdown: Record<string, number> = {}
    let totalDurationMinutes = 0
    let durationCount = 0
    let totalBars = 0
    let barsCount = 0

    for (const r of filledRecords) {
      const minRr = r.minRr !== null && r.minRr !== undefined ? Number(r.minRr) : null
      const maxRr = r.maxRr !== null && r.maxRr !== undefined ? Number(r.maxRr) : null
      const sl =
        r.slPoints !== null && r.slPoints !== undefined
          ? Number(r.slPoints)
          : r.minSlPoints !== null && r.minSlPoints !== undefined
          ? Number(r.minSlPoints)
          : null

      if (sl !== null && !isNaN(sl)) {
        slPointsSum += sl
        slPointsCount++
      }

      const realSl =
        r.realSlPoints !== null && r.realSlPoints !== undefined ? Number(r.realSlPoints) : null

      if (realSl !== null && !isNaN(realSl)) {
        realSlPointsSum += realSl
        realSlPointsCount++
      }

      if (
        r.holdingDurationMinutes !== null &&
        r.holdingDurationMinutes !== undefined &&
        !isNaN(r.holdingDurationMinutes)
      ) {
        totalDurationMinutes += Number(r.holdingDurationMinutes)
        durationCount++
      }
      if (r.holdingBars !== null && r.holdingBars !== undefined && !isNaN(r.holdingBars)) {
        totalBars += Number(r.holdingBars)
        barsCount++
      }

      if (minRr !== null && !isNaN(minRr)) {
        minRrSum += minRr
        if (minRr > 0) {
          winCount++
          winMinRrSum += minRr
          if (realSl !== null && !isNaN(realSl) && realSl > 0) {
            winningRealSls.push(realSl)
          }
        } else if (minRr === -1) {
          lossCount++
          if (r.invalidationReason) {
            invalidationBreakdown[r.invalidationReason] =
              (invalidationBreakdown[r.invalidationReason] || 0) + 1
          }
        } else if (minRr === 0) {
          beCount++
        } else if (minRr < 0) {
          lossCount++
          if (r.invalidationReason) {
            invalidationBreakdown[r.invalidationReason] =
              (invalidationBreakdown[r.invalidationReason] || 0) + 1
          }
        }
      } else if (r.outcome === 'loss') {
        lossCount++
        if (r.invalidationReason) {
          invalidationBreakdown[r.invalidationReason] =
            (invalidationBreakdown[r.invalidationReason] || 0) + 1
        }
      } else if (r.outcome === 'win') {
        winCount++
        if (realSl !== null && !isNaN(realSl) && realSl > 0) {
          winningRealSls.push(realSl)
        }
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
    const avgRealSlPoints = realSlPointsCount > 0 ? realSlPointsSum / realSlPointsCount : 0
    const avgWinMinRr = winCount > 0 ? winMinRrSum / winCount : 0

    // Optimal SL calculation (90th percentile of winning trades MAE + 10% buffer)
    let optimalSlPoints: number | undefined
    let optimalSlEvBoost: number | undefined
    if (winningRealSls.length >= 2) {
      winningRealSls.sort((a, b) => a - b)
      const pIndex = Math.min(
        winningRealSls.length - 1,
        Math.floor(winningRealSls.length * 0.9)
      )
      const rawP = winningRealSls[pIndex]
      optimalSlPoints = Math.round(rawP * 1.1)
      if (avgSlPoints > 0 && optimalSlPoints < avgSlPoints) {
        const rrMultiplier = avgSlPoints / optimalSlPoints
        optimalSlEvBoost = Number(
          (
            (winRate / 100) * (avgWinMinRr * rrMultiplier) -
            (lossRate / 100) -
            ((winRate / 100) * avgWinMinRr - (lossRate / 100))
          ).toFixed(2)
        )
      }
    }

    // EV = (Win Rate % / 100 * Avg Win RR) - (Loss Rate % / 100 * 1)
    const expectedValue = (winRate / 100) * avgWinMinRr - (lossRate / 100) * 1

    zoneMetrics.push({
      customColumnId: colId,
      columnName: data.columnName,
      totalSamples,
      formedCount,
      noZoneCount,
      formationRate: Number(formationRate.toFixed(1)),
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
      avgRealSlPoints: Number(avgRealSlPoints.toFixed(1)),
      optimalSlPoints,
      optimalSlEvBoost,
      avgHoldingDurationMinutes:
        durationCount > 0 ? Math.round(totalDurationMinutes / durationCount) : undefined,
      avgHoldingBars: barsCount > 0 ? Math.round(totalBars / barsCount) : undefined,
      invalidationBreakdown:
        Object.keys(invalidationBreakdown).length > 0 ? invalidationBreakdown : undefined,
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
