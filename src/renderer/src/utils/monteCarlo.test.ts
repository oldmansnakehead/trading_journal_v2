import { describe, it, expect } from 'vitest'
import {
  runMonteCarloSimulation,
  createMulberry32,
  calculatePercentile
} from './monteCarlo'

describe('Monte Carlo Simulation Engine', () => {
  it('mulberry32 generates deterministic uniform pseudo-random numbers', () => {
    const rng1 = createMulberry32(42)
    const rng2 = createMulberry32(42)

    const seq1 = [rng1(), rng1(), rng1()]
    const seq2 = [rng2(), rng2(), rng2()]

    expect(seq1).toEqual(seq2)
    seq1.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    })
  })

  it('calculates percentiles accurately', () => {
    const data = [10, 20, 30, 40, 50]
    expect(calculatePercentile(data, 0)).toBe(10)
    expect(calculatePercentile(data, 50)).toBe(30)
    expect(calculatePercentile(data, 100)).toBe(50)
  })

  // Mandatory user requirement 1:
  it('User Test 1: R = [1, -1, 2, 3.5, 1], Shuffle, Simple, Capital = 10,000, Risk = 1% -> Final Balance equals exactly 10,650 in all runs', () => {
    const rMultiples = [1, -1, 2, 3.5, 1]
    const result = runMonteCarloSimulation({
      rMultiples,
      initialCapital: 10000,
      riskPct: 1,
      returnCalculation: 'simple',
      method: 'shuffle',
      blockSize: 3,
      simulationsCount: 1000,
      tradesPerRun: 5,
      ruinThresholdPct: -30,
      randomSeed: 42
    })

    // Sum of R = 1 - 1 + 2 + 3.5 + 1 = 6.5R
    // 6.5 * (10,000 * 1%) = 6.5 * 100 = +650
    // Final balance in every run MUST be exactly 10,650
    expect(result.finalBalancePercentiles.p5).toBe(10650)
    expect(result.finalBalancePercentiles.p25).toBe(10650)
    expect(result.finalBalancePercentiles.p50).toBe(10650)
    expect(result.finalBalancePercentiles.p75).toBe(10650)
    expect(result.finalBalancePercentiles.p95).toBe(10650)
    expect(result.probabilityOfProfitPct).toBe(100)
  })

  // Mandatory user requirement 2:
  it('User Test 2: Bootstrap with all R = +1 -> Max DD = 0% in all runs', () => {
    const rMultiples = [1, 1, 1, 1, 1]
    const result = runMonteCarloSimulation({
      rMultiples,
      initialCapital: 10000,
      riskPct: 1,
      returnCalculation: 'simple',
      method: 'bootstrap',
      blockSize: 3,
      simulationsCount: 1000,
      tradesPerRun: 10,
      ruinThresholdPct: -30,
      randomSeed: 99
    })

    expect(result.maxDDPercentiles.p5).toBe(0)
    expect(result.maxDDPercentiles.p50).toBe(0)
    expect(result.maxDDPercentiles.p95).toBe(0)
    expect(result.medianMaxDDPct).toBe(0)
    expect(result.riskOfRuinPct).toBe(0)
  })

  it('detects Risk of Ruin when balance falls below threshold at any point', () => {
    // Sequence of severe losses
    const rMultiples = [-5, -5, -5, 1]
    const result = runMonteCarloSimulation({
      rMultiples,
      initialCapital: 10000,
      riskPct: 5, // 5% per R, each loss is -25%
      returnCalculation: 'simple',
      method: 'bootstrap',
      blockSize: 3,
      simulationsCount: 500,
      tradesPerRun: 10,
      ruinThresholdPct: -30,
      randomSeed: 123
    })

    expect(result.riskOfRuinPct).toBeGreaterThan(0)
  })

  it('runs block bootstrap properly', () => {
    const rMultiples = [1, 2, -1, 3, -2]
    const result = runMonteCarloSimulation({
      rMultiples,
      initialCapital: 10000,
      riskPct: 1,
      returnCalculation: 'simple',
      method: 'block_bootstrap',
      blockSize: 2,
      simulationsCount: 500,
      tradesPerRun: 10,
      ruinThresholdPct: -30,
      randomSeed: 777
    })

    expect(result.equityCone.length).toBeGreaterThan(0)
    expect(result.finalBalanceHistogram.length).toBeGreaterThan(0)
  })

  it('stress test reduces return when degradeWinPct is applied', () => {
    const rMultiples = [2, 3, 2, -1]
    const normalResult = runMonteCarloSimulation({
      rMultiples,
      initialCapital: 10000,
      riskPct: 1,
      returnCalculation: 'simple',
      method: 'bootstrap',
      blockSize: 3,
      simulationsCount: 1000,
      tradesPerRun: 10,
      ruinThresholdPct: -30,
      randomSeed: 42
    })

    const stressedResult = runMonteCarloSimulation({
      rMultiples,
      initialCapital: 10000,
      riskPct: 1,
      returnCalculation: 'simple',
      method: 'bootstrap',
      blockSize: 3,
      simulationsCount: 1000,
      tradesPerRun: 10,
      ruinThresholdPct: -30,
      randomSeed: 42,
      stressTest: {
        enabled: true,
        degradeWinPct: 30,
        skipTradePct: 10
      }
    })

    expect(stressedResult.finalBalancePercentiles.p50).toBeLessThan(
      normalResult.finalBalancePercentiles.p50
    )
  })
})
