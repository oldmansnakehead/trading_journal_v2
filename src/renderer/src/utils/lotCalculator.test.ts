import { describe, it, expect } from 'vitest'
import { calculateLotSize } from './lotCalculator'

describe('calculateLotSize', () => {
  it('calculates exact lot size for Gold (XAUUSD) matching user screenshot', () => {
    // Balance: $1000, Risk: 1%, Entry: 2400, SL: 2395, Contract size: 100
    const result = calculateLotSize({
      balance: 1000,
      riskPercent: 1,
      entryPrice: 2400,
      stopLossPrice: 2395,
      contractSize: 100,
      pointSize: 0.01
    })

    expect(result.riskAmount).toBe(10) // $10.00
    expect(result.priceDistance).toBe(5) // 5.00
    expect(result.stopLossPoints).toBe(500) // 500 Point
    expect(result.lossPerOneLot).toBe(500) // $500.00
    expect(result.recommendedLot).toBe(0.02) // 0.02 LOT
    expect(result.realRiskAmount).toBe(10) // $10.00
    expect(result.realRiskPercent).toBe(1.0) // 1.00%
    expect(result.isValid).toBe(true)
  })

  it('floors lot size downward so real risk never exceeds risk budget', () => {
    // Balance: $1000, Risk: 1% ($10), Distance: 4.2, Loss per lot: 420
    // Raw lot = 10 / 420 = 0.0238...
    // Floor to 2 decimals -> 0.02 Lot (never 0.03!)
    const result = calculateLotSize({
      balance: 1000,
      riskPercent: 1,
      entryPrice: 2400,
      stopLossPrice: 2395.8,
      contractSize: 100
    })

    expect(result.recommendedLot).toBe(0.02)
    expect(result.realRiskAmount).toBeLessThanOrEqual(result.riskAmount)
  })

  it('handles standard Forex pairs with 100,000 contract size', () => {
    // Balance: $5000, Risk: 1% ($50), Entry: 1.08500, SL: 1.08200 (30 pips = 300 points)
    // Loss per lot = 0.00300 * 100,000 = $300
    // Raw lot = 50 / 300 = 0.1666... -> 0.16 Lot
    const result = calculateLotSize({
      balance: 5000,
      riskPercent: 1,
      entryPrice: 1.08500,
      stopLossPrice: 1.08200,
      contractSize: 100000,
      pointSize: 0.00001
    })

    expect(result.riskAmount).toBe(50)
    expect(result.stopLossPoints).toBe(300)
    expect(result.lossPerOneLot).toBe(300)
    expect(result.recommendedLot).toBe(0.16)
    expect(result.realRiskAmount).toBe(48)
    expect(result.realRiskPercent).toBeCloseTo(0.96)
  })

  it('returns invalid if Entry and Stop Loss prices are identical', () => {
    const result = calculateLotSize({
      balance: 1000,
      riskPercent: 1,
      entryPrice: 2400,
      stopLossPrice: 2400
    })

    expect(result.isValid).toBe(false)
    expect(result.recommendedLot).toBe(0)
    expect(result.validationError).toContain('ราคา Entry และ Stop Loss ต้องไม่เท่ากัน')
  })

  it('handles calculated lot being less than minLot', () => {
    // High distance, tiny balance -> lot < 0.01
    const result = calculateLotSize({
      balance: 100,
      riskPercent: 0.5, // $0.50 risk
      entryPrice: 2400,
      stopLossPrice: 2300, // 100 distance -> $10,000 loss per lot
      contractSize: 100,
      minLot: 0.01
    })

    expect(result.isValid).toBe(false)
    expect(result.recommendedLot).toBe(0)
  })
})
