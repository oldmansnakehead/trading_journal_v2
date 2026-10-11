export type SimulationMethod = 'bootstrap' | 'shuffle' | 'block_bootstrap'
export type ReturnCalculation = 'simple' | 'compounded'

export interface StressTestSettings {
  enabled: boolean
  degradeWinPct: number // 0 to 50%
  skipTradePct: number // 0 to 30%
}

export interface SimulationInput {
  rMultiples: number[]
  initialCapital: number
  riskPct: number
  returnCalculation: ReturnCalculation
  method: SimulationMethod
  blockSize: number
  simulationsCount: number
  tradesPerRun: number
  ruinThresholdPct: number // e.g. -30 means -30%
  randomSeed: number
  stressTest?: StressTestSettings
}

export interface PercentileStats {
  p5: number
  p25: number
  p50: number
  p75: number
  p95: number
}

export interface HistogramBin {
  binStart: number
  binEnd: number
  label: string
  count: number
  frequency: number
}

export interface EquityConeStep {
  tradeIndex: number
  p5: number
  p25: number
  p50: number
  p75: number
  p95: number
  actual?: number
}

export interface ConsecLossBin {
  consecutiveLosses: number
  count: number
  frequency: number
}

export interface SimulationResult {
  simulationsCount: number
  tradesPerRun: number
  actualTradesCount: number

  // Key Summary Cards
  medianReturnPct: number
  p5ReturnPct: number
  probabilityOfProfitPct: number
  medianMaxDDPct: number
  p95MaxDDPct: number
  riskOfRuinPct: number
  p95MaxConsecLosses: number

  // Percentiles for Table
  finalBalancePercentiles: PercentileStats
  returnPctPercentiles: PercentileStats
  maxDDPercentiles: PercentileStats
  maxConsecLossesPercentiles: PercentileStats

  // Charts Data
  equityCone: EquityConeStep[]
  maxDDHistogram: HistogramBin[]
  finalBalanceHistogram: HistogramBin[]
  maxConsecLossesHistogram: ConsecLossBin[]

  // References
  initialCapital: number
  actualEquityCurve: number[]
}

/**
 * Mulberry32 seeded Pseudo-Random Number Generator.
 * Deterministic and fast 32-bit generator.
 */
export function createMulberry32(seed: number): () => number {
  let s = Math.floor(seed) >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Calculates percentile using linear interpolation between closest ranks.
 */
export function calculatePercentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0
  if (sortedValues.length === 1) return sortedValues[0]
  if (p <= 0) return sortedValues[0]
  if (p >= 100) return sortedValues[sortedValues.length - 1]

  const index = (p / 100) * (sortedValues.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  if (lower === upper) return sortedValues[lower]
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
}

export function calculatePercentileStats(sortedValues: number[]): PercentileStats {
  return {
    p5: calculatePercentile(sortedValues, 5),
    p25: calculatePercentile(sortedValues, 25),
    p50: calculatePercentile(sortedValues, 50),
    p75: calculatePercentile(sortedValues, 75),
    p95: calculatePercentile(sortedValues, 95)
  }
}

/**
 * Builds histogram bins for a numeric dataset.
 */
export function createHistogram(
  values: number[],
  binCount = 20,
  formatter?: (val: number) => string
): HistogramBin[] {
  if (values.length === 0) return []

  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < values.length; i++) {
    if (values[i] < min) min = values[i]
    if (values[i] > max) max = values[i]
  }

  if (min === max) {
    return [
      {
        binStart: min,
        binEnd: max,
        label: formatter ? formatter(min) : min.toFixed(1),
        count: values.length,
        frequency: 100
      }
    ]
  }

  const step = (max - min) / binCount
  const bins: HistogramBin[] = []

  for (let b = 0; b < binCount; b++) {
    const start = min + b * step
    const end = b === binCount - 1 ? max : start + step
    bins.push({
      binStart: start,
      binEnd: end,
      label: formatter
        ? `${formatter(start)} - ${formatter(end)}`
        : `${start.toFixed(1)} - ${end.toFixed(1)}`,
      count: 0,
      frequency: 0
    })
  }

  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    let placed = false
    for (let b = 0; b < binCount; b++) {
      if (b === binCount - 1) {
        if (v >= bins[b].binStart && v <= bins[b].binEnd) {
          bins[b].count++
          placed = true
          break
        }
      } else {
        if (v >= bins[b].binStart && v < bins[b].binEnd) {
          bins[b].count++
          placed = true
          break
        }
      }
    }
    if (!placed && bins.length > 0) {
      bins[bins.length - 1].count++
    }
  }

  for (let b = 0; b < bins.length; b++) {
    bins[b].frequency = Number(((bins[b].count / values.length) * 100).toFixed(2))
  }

  return bins
}

/**
 * Runs the Monte Carlo Simulation with full precision and deterministic seeded PRNG.
 */
export function runMonteCarloSimulation(
  input: SimulationInput,
  onProgress?: (progressPct: number) => void
): SimulationResult {
  const {
    rMultiples,
    initialCapital,
    riskPct,
    returnCalculation,
    method,
    blockSize,
    simulationsCount,
    ruinThresholdPct,
    randomSeed,
    stressTest
  } = input

  if (!rMultiples || rMultiples.length < 2) {
    throw new Error('At least 2 trades are required for Monte Carlo simulation.')
  }

  const actualCount = rMultiples.length
  const tradesCount = method === 'shuffle' ? actualCount : input.tradesPerRun || actualCount
  const runs = Math.min(Math.max(1, simulationsCount), 20000)
  const rng = createMulberry32(randomSeed || 12345)

  // Determine sampling steps for Equity Cone (up to 101 steps from step 0 to step tradesCount)
  const sampleStepsCount = Math.min(tradesCount + 1, 101)
  const sampledIndices: number[] = []
  for (let s = 0; s < sampleStepsCount; s++) {
    const idx = Math.round((s / (sampleStepsCount - 1)) * tradesCount)
    if (sampledIndices.length === 0 || sampledIndices[sampledIndices.length - 1] !== idx) {
      sampledIndices.push(idx)
    }
  }

  // Matrix to store equity values at sampled trade indices: size [sampledIndices.length][runs]
  const coneValues: number[][] = Array.from({ length: sampledIndices.length }, () =>
    new Array(runs)
  )

  const finalBalances = new Float64Array(runs)
  const maxDrawdowns = new Float64Array(runs)
  const maxConsecLosses = new Int32Array(runs)
  let ruinedRunsCount = 0

  const ruinThreshold = initialCapital * (1 - Math.abs(ruinThresholdPct) / 100)
  const stress = stressTest?.enabled
    ? {
        degradeWinMultiplier: 1 - Math.min(Math.max(0, stressTest.degradeWinPct || 0), 100) / 100,
        skipProb: Math.min(Math.max(0, stressTest.skipTradePct || 0), 100) / 100
      }
    : null

  // Reusable array for shuffle method
  const shufflePool = [...rMultiples]

  const progressInterval = Math.max(1, Math.floor(runs / 20))

  for (let r = 0; r < runs; r++) {
    if (onProgress && (r % progressInterval === 0 || r === runs - 1)) {
      onProgress(Math.round(((r + 1) / runs) * 100))
    }

    let balance = initialCapital
    let peak = initialCapital
    let maxDD = 0
    let currentConsecLosses = 0
    let maxConsecLoss = 0
    let isRuined = false

    // Record step 0
    coneValues[0][r] = initialCapital

    // Generate trade sequence
    let tradeSequence: number[]
    if (method === 'shuffle') {
      // Fisher-Yates shuffle
      tradeSequence = [...shufflePool]
      for (let i = tradeSequence.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        const temp = tradeSequence[i]
        tradeSequence[i] = tradeSequence[j]
        tradeSequence[j] = temp
      }
    } else if (method === 'block_bootstrap') {
      tradeSequence = new Array(tradesCount)
      const bSize = Math.max(1, blockSize || 3)
      let filled = 0
      while (filled < tradesCount) {
        const start = Math.floor(rng() * actualCount)
        for (let b = 0; b < bSize && filled < tradesCount; b++) {
          tradeSequence[filled++] = rMultiples[(start + b) % actualCount]
        }
      }
    } else {
      // Standard bootstrap with replacement
      tradeSequence = new Array(tradesCount)
      for (let i = 0; i < tradesCount; i++) {
        const idx = Math.floor(rng() * actualCount)
        tradeSequence[i] = rMultiples[idx]
      }
    }

    let sampledIdxPointer = 1 // next sampled index to match

    for (let t = 0; t < tradesCount; t++) {
      let rVal = tradeSequence[t]

      // Apply stress test if active
      if (stress) {
        if (rng() < stress.skipProb) {
          rVal = 0
        } else if (rVal > 0) {
          rVal *= stress.degradeWinMultiplier
        }
      }

      // Track consecutive losses
      if (rVal < 0) {
        currentConsecLosses++
        if (currentConsecLosses > maxConsecLoss) {
          maxConsecLoss = currentConsecLosses
        }
      } else if (rVal > 0) {
        currentConsecLosses = 0
      }

      // Balance evolution
      const delta =
        returnCalculation === 'simple'
          ? rVal * (initialCapital * (riskPct / 100))
          : rVal * (Math.max(0, balance) * (riskPct / 100))

      balance = returnCalculation === 'simple' ? balance + delta : Math.max(0, balance + delta)

      if (balance <= ruinThreshold) {
        isRuined = true
      }

      // Drawdown tracking (peak-to-trough from peak)
      if (balance > peak) {
        peak = balance
      } else {
        const dd = peak > 0 ? ((peak - balance) / peak) * 100 : 100
        if (dd > maxDD) {
          maxDD = dd
        }
      }

      // Record at sampled step
      const currentTradeIndex = t + 1
      if (
        sampledIdxPointer < sampledIndices.length &&
        currentTradeIndex === sampledIndices[sampledIdxPointer]
      ) {
        coneValues[sampledIdxPointer][r] = balance
        sampledIdxPointer++
      }
    }

    finalBalances[r] = balance
    maxDrawdowns[r] = maxDD
    maxConsecLosses[r] = maxConsecLoss
    if (isRuined) ruinedRunsCount++
  }

  // Calculate actual historical equity curve
  const actualEquityCurve: number[] = [initialCapital]
  let actBal = initialCapital
  for (let i = 0; i < rMultiples.length; i++) {
    const rVal = rMultiples[i]
    const delta =
      returnCalculation === 'simple'
        ? rVal * (initialCapital * (riskPct / 100))
        : rVal * (Math.max(0, actBal) * (riskPct / 100))
    actBal = returnCalculation === 'simple' ? actBal + delta : Math.max(0, actBal + delta)
    actualEquityCurve.push(actBal)
  }

  // Build Equity Cone percentiles
  const equityCone: EquityConeStep[] = []
  for (let s = 0; s < sampledIndices.length; s++) {
    const stepIdx = sampledIndices[s]
    const sortedStepValues = coneValues[s].sort((a, b) => a - b)
    const actVal =
      stepIdx < actualEquityCurve.length
        ? actualEquityCurve[stepIdx]
        : actualEquityCurve[actualEquityCurve.length - 1]

    equityCone.push({
      tradeIndex: stepIdx,
      p5: calculatePercentile(sortedStepValues, 5),
      p25: calculatePercentile(sortedStepValues, 25),
      p50: calculatePercentile(sortedStepValues, 50),
      p75: calculatePercentile(sortedStepValues, 75),
      p95: calculatePercentile(sortedStepValues, 95),
      actual: actVal
    })
  }

  // Sort metric arrays for statistics
  const sortedFinalBalances = Array.from(finalBalances).sort((a, b) => a - b)
  const sortedMaxDDs = Array.from(maxDrawdowns).sort((a, b) => a - b)
  const sortedMaxConsecLosses = Array.from(maxConsecLosses).sort((a, b) => a - b)

  const finalBalancePercentiles = calculatePercentileStats(sortedFinalBalances)
  const maxDDPercentiles = calculatePercentileStats(sortedMaxDDs)
  const maxConsecLossesPercentiles = calculatePercentileStats(sortedMaxConsecLosses)

  // Return % percentiles
  const sortedReturnsPct = sortedFinalBalances.map((bal) =>
    Number((((bal - initialCapital) / initialCapital) * 100).toFixed(2))
  )
  const returnPctPercentiles = calculatePercentileStats(sortedReturnsPct)

  // Probability of profit (% of runs with final balance > initial capital)
  let profitCount = 0
  for (let i = 0; i < sortedFinalBalances.length; i++) {
    if (sortedFinalBalances[i] > initialCapital) profitCount++
  }
  const probabilityOfProfitPct = Number(((profitCount / runs) * 100).toFixed(2))
  const riskOfRuinPct = Number(((ruinedRunsCount / runs) * 100).toFixed(2))

  // Histograms
  const maxDDHistogram = createHistogram(Array.from(maxDrawdowns), 20, (v) => `${v.toFixed(1)}%`)
  const finalBalanceHistogram = createHistogram(
    Array.from(finalBalances),
    20,
    (v) => `$${Math.round(v).toLocaleString()}`
  )

  // Discrete distribution for consecutive losses
  let maxConsecObserved = 0
  for (let i = 0; i < maxConsecLosses.length; i++) {
    if (maxConsecLosses[i] > maxConsecObserved) maxConsecObserved = maxConsecLosses[i]
  }

  const consecCounts = new Array(maxConsecObserved + 1).fill(0)
  for (let i = 0; i < maxConsecLosses.length; i++) {
    consecCounts[maxConsecLosses[i]]++
  }

  const maxConsecLossesHistogram: ConsecLossBin[] = consecCounts.map((count, losses) => ({
    consecutiveLosses: losses,
    count,
    frequency: Number(((count / runs) * 100).toFixed(2))
  }))

  return {
    simulationsCount: runs,
    tradesPerRun: tradesCount,
    actualTradesCount: actualCount,

    medianReturnPct: returnPctPercentiles.p50,
    p5ReturnPct: returnPctPercentiles.p5,
    probabilityOfProfitPct,
    medianMaxDDPct: maxDDPercentiles.p50,
    p95MaxDDPct: maxDDPercentiles.p95,
    riskOfRuinPct,
    p95MaxConsecLosses: Math.round(maxConsecLossesPercentiles.p95),

    finalBalancePercentiles,
    returnPctPercentiles,
    maxDDPercentiles,
    maxConsecLossesPercentiles,

    equityCone,
    maxDDHistogram,
    finalBalanceHistogram,
    maxConsecLossesHistogram,

    initialCapital,
    actualEquityCurve
  }
}
