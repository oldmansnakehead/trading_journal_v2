export type OrderType = 'BUY' | 'SELL'
export type AssetType = 'xauusd' | 'forex_standard' | 'forex_jpy' | 'crypto' | 'custom'

export interface LotCalculationParams {
  balance: number
  riskPercent: number
  entryPrice: number
  stopLossPrice: number
  contractSize?: number
  pointSize?: number
  minLot?: number
  maxLot?: number
  commissionPerLot?: number
}

export interface LotCalculationResult {
  riskAmount: number
  priceDistance: number
  stopLossPoints: number
  lossPerOneLot: number
  rawLot: number
  recommendedLot: number
  realRiskAmount: number
  realRiskPercent: number
  isValid: boolean
  validationError?: string
}

export function calculateLotSize(params: LotCalculationParams): LotCalculationResult {
  const balance = Number(params.balance) || 0
  const riskPercent = Number(params.riskPercent) || 0
  const entryPrice = Number(params.entryPrice) || 0
  const stopLossPrice = Number(params.stopLossPrice) || 0
  const contractSize = Number(params.contractSize) || 100
  const pointSize = Number(params.pointSize) || 0.01
  const minLot = params.minLot !== undefined ? Number(params.minLot) : 0.01
  const maxLot = params.maxLot !== undefined ? Number(params.maxLot) : 100
  const commission = Number(params.commissionPerLot) || 0

  const riskAmount = (balance * riskPercent) / 100
  const rawDist = Math.abs(entryPrice - stopLossPrice)
  // Round to eliminate floating point precision artifacts (e.g. 0.003000000000000002)
  const priceDistance = Number(rawDist.toFixed(8))

  if (priceDistance === 0) {
    return {
      riskAmount,
      priceDistance: 0,
      stopLossPoints: 0,
      lossPerOneLot: 0,
      rawLot: 0,
      recommendedLot: 0,
      realRiskAmount: 0,
      realRiskPercent: 0,
      isValid: false,
      validationError: 'ราคา Entry และ Stop Loss ต้องไม่เท่ากัน'
    }
  }

  const stopLossPoints = pointSize > 0 ? Math.round(priceDistance / pointSize) : 0
  const lossPerOneLot = Number((priceDistance * contractSize + commission).toFixed(4))

  if (lossPerOneLot <= 0) {
    return {
      riskAmount,
      priceDistance,
      stopLossPoints,
      lossPerOneLot: 0,
      rawLot: 0,
      recommendedLot: 0,
      realRiskAmount: 0,
      realRiskPercent: 0,
      isValid: false,
      validationError: 'ขาดทุนต่อ 1 Lot ต้องมากกว่า 0'
    }
  }

  const rawLot = riskAmount / lossPerOneLot
  // Floor to 2 decimal places to ensure risk never rounds up beyond budget
  const flooredLot = Math.floor(rawLot * 100) / 100

  let recommendedLot = 0
  let isValid = true
  let validationError: string | undefined

  if (flooredLot < minLot) {
    recommendedLot = 0
    isValid = false
    validationError = `ขนาด Lot ที่คำนวณได้ (${flooredLot}) ต่ำกว่าขนาดขั้นต่ำ (${minLot})`
  } else {
    recommendedLot = Math.min(flooredLot, maxLot)
  }

  const realRiskAmount = Number((recommendedLot * lossPerOneLot).toFixed(4))
  const realRiskPercent = balance > 0 ? Number(((realRiskAmount / balance) * 100).toFixed(4)) : 0

  return {
    riskAmount,
    priceDistance,
    stopLossPoints,
    lossPerOneLot,
    rawLot,
    recommendedLot,
    realRiskAmount,
    realRiskPercent,
    isValid,
    validationError
  }
}
