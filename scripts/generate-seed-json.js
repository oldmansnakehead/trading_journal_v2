const fs = require('fs')
const path = require('path')

// Seeded PRNG for deterministic, reproducible realistic trade generation
let seed = 42
function random() {
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}

function randomChoice(arr) {
  return arr[Math.floor(random() * arr.length)]
}

function randomFloat(min, max, decimals = 2) {
  const val = min + random() * (max - min)
  return Number(val.toFixed(decimals))
}

function randomInt(min, max) {
  return Math.floor(min + random() * (max - min + 1))
}

const symbols = [
  { name: 'XAUUSD' },
  { name: 'EURUSD' },
  { name: 'GBPUSD' },
  { name: 'USDJPY' },
  { name: 'BTCUSD' }
]

const setups = [
  {
    name: 'HA Model',
    type: 'real',
    description: 'High-probability HA Liquidity sweep and CHOCH continuation model with tight invalidation.',
    sessions: [
      { sessionName: 'London', startTime: '08:00', endTime: '16:00' },
      { sessionName: 'New York', startTime: '13:00', endTime: '21:00' },
      { sessionName: 'Asia', startTime: '00:00', endTime: '08:00' }
    ],
    playbook: `# HA Model Playbook

## 1. Context & Setup Conditions
- Identify Key HTF liquidity pool (Daily / H4 high/low).
- Wait for price to sweep Asian range liquidity during London Open (08:00-10:00 UTC) or NY Open (13:00-15:00 UTC).
- Look for M5/M15 Market Structure Shift (MSS) with displacement candle.

## 2. Entry Triggers
- Enter on Fair Value Gap (FVG) or Liquidity void retracement.
- Stop loss placed 2-3 pips beyond the displacement pivot.
- Initial TP target at opposing liquidity (target 2.5R - 4.5R).

## 3. Risk & Trade Management
- Risk per trade: 1.0% equity.
- Move to Break Even once price breaks prior structure swing (typically at +1.5R).
- Trail stop using M5 swing points if momentum remains strong.`,
    customColumns: [
      { name: 'Confluence Count', type: 'number', reportFilter: true },
      {
        name: 'Emotional State',
        type: 'single_selector',
        options: ['Disciplined', 'FOMO', 'Hesitant', 'Revenge', 'Neutral'],
        reportFilter: true
      },
      {
        name: 'Setup Type Detail',
        type: 'single_selector',
        options: ['Liquidity Sweep', 'Continuation', 'Session Open Reversal'],
        reportFilter: true
      },
      { name: 'MAE', type: 'number', reportFilter: false }
    ]
  },
  {
    name: 'ICT / SMC Classic',
    type: 'real',
    description: 'Classic ICT Fair Value Gap, Liquidity sweep, and Order Block model targeting high payoff multi-R expansions.',
    sessions: [
      { sessionName: 'London', startTime: '08:00', endTime: '16:00' },
      { sessionName: 'New York', startTime: '13:00', endTime: '21:00' }
    ],
    playbook: `# ICT / SMC Classic Playbook

## 1. High Timeframe Draw on Liquidity
- Establish Daily / H4 bias from institutional order flow.
- Mark external range liquidity and discount/premium pricing zones.

## 2. Execution Confirmation
- Look for Judas swing during London Open or NY Open Killzone.
- M5 Market Structure Shift with clear energy & displacement.
- Enter on OTE (62%-79% Fibonacci) inside Fair Value Gap.

## 3. Profit Taking
- Partial TP1 at 2.5R, TP2 at 4.0R, runner trailed to external range high/low (5R-8R).`,
    customColumns: [
      {
        name: 'Killzone',
        type: 'single_selector',
        options: ['London Open', 'NY Open', 'London Close', 'Asian Session'],
        reportFilter: true
      },
      {
        name: 'Displacement Quality',
        type: 'single_selector',
        options: ['A+ High Energy', 'B Moderate', 'C Low Displacement'],
        reportFilter: true
      },
      { name: 'Confluence Count', type: 'number', reportFilter: true },
      { name: 'MAE', type: 'number', reportFilter: false }
    ]
  },
  {
    name: 'Breakout Strategy',
    type: 'demo',
    description: 'Momentum expansion strategy breaking Asian range high/low boundaries.',
    sessions: [
      { sessionName: 'London', startTime: '08:00', endTime: '16:00' },
      { sessionName: 'New York', startTime: '13:00', endTime: '21:00' }
    ],
    playbook: `# Breakout Strategy Playbook

## Rules
1. Mark Asian range High and Low.
2. London candle closes outside the range with volume > 1.5x 20 EMA.
3. Enter on close, SL at opposite side of range or 50% range.`,
    customColumns: [
      { name: 'Range Size (Pips)', type: 'number', reportFilter: true },
      {
        name: 'Breakout Direction',
        type: 'single_selector',
        options: ['Up', 'Down'],
        reportFilter: true
      },
      { name: 'MAE', type: 'number', reportFilter: false }
    ]
  }
]

// Generate dates spread across the last 180 days (Mon-Fri trading days)
function generateTradingDates(count) {
  const dates = []
  const baseDate = new Date('2025-10-15T08:00:00.000Z')
  let current = new Date(baseDate)

  while (dates.length < count) {
    const day = current.getUTCDay()
    // Prefer weekdays Monday (1) to Friday (5)
    if (day >= 1 && day <= 5) {
      // Pick random session hour: London (8-11 UTC) or NY (13-16 UTC)
      const isLondon = random() < 0.6
      const hour = isLondon ? randomInt(8, 11) : randomInt(13, 16)
      const minute = randomChoice([0, 5, 12, 15, 23, 30, 35, 45, 52])
      
      const entryTime = new Date(current)
      entryTime.setUTCHours(hour, minute, 0, 0)

      // Duration 20 mins to 3 hours
      const durationMins = randomInt(25, 180)
      const exitTime = new Date(entryTime.getTime() + durationMins * 60000)

      dates.push({ entryTime, exitTime, isLondon })
    }
    // Advance 1 to 2 days
    current = new Date(current.getTime() + (random() < 0.35 ? 86400000 : 86400000 * 2))
  }
  return dates
}

const haDates = generateTradingDates(100)
const smcDates = generateTradingDates(100)
const breakoutDates = generateTradingDates(100)

const sampleImages = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60'
]

const haNotesWin = [
  'Clean Asian low sweep during London Open. M5 CHOCH confirmed, entered on FVG retracement. Hit full TP at prior day high.',
  'High momentum continuation following NY Open news absorption. Protected SL behind displacement candle.',
  'Textbook HA Model: 15m liquidity grab, 5m displacement with volume spike. Runner trailed to 4.2R.',
  'Perfect rejection off 4H order block aligned with London session killzone. Zero drawdown on entry.',
  'Liquidity sweep of equal highs, strong downside impulse. Target 3.5R achieved smoothly before NY close.'
]

const haNotesLoss = [
  'False breakout sweep: price tapped FVG but failed to displace. Stopped out at planned -1.0R SL.',
  'Market structure shifted back against direction due to unexpected Fed commentary.',
  'Premature entry before displacement confirmation candle closed. Followed SL plan strictly.',
  'Price reversed just 2 pips before target and swept trailing stop. Took -1.0R loss.'
]

const smcNotesWin = [
  'Judas swing during London Open. Swept Asian high into 4H bearish FVG. Deep discount entry on M5 MSS with 5.5R target reached.',
  'High timeframe draw on liquidity reached. Massive displacement with 3 consecutive institutional candles. Partial TP at 3R, runner caught 7.2R.',
  'NY Killzone reversal: purged previous day liquidity pool, M1 entry on OTE 70.5% retracement. Clean 4.5R profit.',
  'Classic SMC setup: Fair Value Gap + Breaker block confluence. Clean expansion during London-NY overlap.'
]

const smcNotesLoss = [
  'Price swept liquidity but failed to hold Order Block. Stopped out at full -1.0R.',
  'High-impact CPI release caused massive slippage and hit stop immediately. Followed discipline.',
  'Order block breached due to heavy HTF institutional selling. Controlled risk kept to 1R.'
]

const breakoutNotesWin = [
  'Strong expansion candle breaking Asian range high with 2x average volume. Reached 2.5R target.',
  'London opening breakout carried through London session with sustained momentum. Took profit at +2.0R.'
]

const breakoutNotesLoss = [
  'Fakeout: price briefly broke Asian range low then reversed sharply back inside range. Stopped out.',
  'Volume lacked follow-through after the initial breakout candle. Took planned -1.0R loss.'
]

const journalEntries = []

// 1. Generate 100 HA Model trades (~64% Win Rate, High Expectancy ~1.2R)
haDates.forEach((d, idx) => {
  const isWin = idx < 64
  const isBe = idx >= 64 && idx < 68
  const isLoss = idx >= 68

  const symbol = randomChoice(['XAUUSD', 'XAUUSD', 'XAUUSD', 'EURUSD', 'EURUSD', 'GBPUSD'])
  const position = randomChoice(['Buy', 'Sell'])
  const directionBias = position === 'Buy' ? 'Bullish' : 'Bearish'
  const sessionName = d.isLondon ? 'London' : 'New York'
  const slPoints = symbol === 'XAUUSD' ? randomFloat(15, 30, 1) : randomFloat(8, 18, 1)

  let normalRr, normalMaxRr, mae, notes

  if (isWin) {
    normalRr = randomChoice([1.8, 2.2, 2.5, 3.0, 3.2, 3.5, 4.0, 4.2, 4.8])
    normalMaxRr = randomFloat(normalRr, normalRr + randomFloat(0.3, 1.8))
    mae = randomFloat(-0.6, -0.05)
    notes = randomChoice(haNotesWin)
  } else if (isBe) {
    normalRr = 0.0
    normalMaxRr = randomFloat(1.2, 2.2) // Went into profit but returned to BE
    mae = randomFloat(-0.4, -0.1)
    notes = 'Trade went +1.5R in profit, moved stop to Break Even as planned. Stopped out at BE.'
  } else {
    normalRr = randomChoice([-1.0, -1.0, -1.0, -0.8, -0.5])
    // Occasional reversal loss (MFE was positive but trade lost)
    normalMaxRr = random() < 0.25 ? randomFloat(1.2, 2.4) : randomFloat(0.1, 0.6)
    mae = -1.0
    notes = randomChoice(haNotesLoss)
  }

  const normalTpPoints = normalRr > 0 ? Number((normalRr * slPoints).toFixed(1)) : -slPoints
  const quality = isWin ? randomChoice(['Green', 'Green', 'Blue']) : isBe ? 'Yellow' : randomChoice(['Orange', 'Red'])
  const news = random() < 0.15

  // Trail / BE RR variants
  const beRr = isWin ? normalRr : isBe ? 0.0 : -1.0
  const beMaxRr = normalMaxRr
  const trailRr = isWin ? Number((normalRr + randomChoice([0.2, 0.5, 0.8])).toFixed(2)) : normalRr

  journalEntries.push({
    setupName: 'HA Model',
    symbol,
    entryDatetime: d.entryTime.toISOString(),
    exitDatetime: d.exitTime.toISOString(),
    sessionName,
    position,
    directionBias,
    entryTimeframe: randomChoice(['M5', 'M5', 'M15', 'M1']),
    news,
    quality,
    isTest: false,
    images: random() < 0.35 ? [randomChoice(sampleImages)] : null,
    notes,
    normalSlPoints: slPoints,
    normalRr,
    normalMaxRr,
    normalTpPoints,
    beSlPoints: slPoints,
    beRr,
    beMaxRr,
    beTpPoints: normalTpPoints,
    trailSlPoints: slPoints,
    trailRr,
    trailMaxRr: normalMaxRr,
    trailTpPoints: Number((trailRr * slPoints).toFixed(1)),
    customData: {
      'Confluence Count': isWin ? randomInt(3, 5) : randomInt(1, 3),
      'Emotional State': isWin ? 'Disciplined' : randomChoice(['Disciplined', 'Hesitant', 'FOMO']),
      'Setup Type Detail': randomChoice(['Liquidity Sweep', 'Continuation', 'Session Open Reversal']),
      'MAE': mae
    }
  })
})

// 2. Generate 100 ICT / SMC Classic trades (~46% Win Rate, High Payoff Multi-R ~0.95R Expectancy)
smcDates.forEach((d, idx) => {
  const isWin = idx < 46
  const isBe = idx >= 46 && idx < 52
  const isLoss = idx >= 52

  const symbol = randomChoice(['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD'])
  const position = randomChoice(['Buy', 'Sell'])
  const directionBias = position === 'Buy' ? 'Bullish' : 'Bearish'
  const sessionName = d.isLondon ? 'London' : 'New York'
  const slPoints = symbol === 'XAUUSD' ? randomFloat(18, 35, 1) : symbol === 'BTCUSD' ? randomFloat(150, 400, 0) : randomFloat(10, 22, 1)

  let normalRr, normalMaxRr, mae, notes

  if (isWin) {
    normalRr = randomChoice([3.0, 3.5, 4.0, 4.5, 5.0, 5.8, 6.5, 7.5])
    normalMaxRr = randomFloat(normalRr, normalRr + randomFloat(0.5, 3.0)) // Big MFE excursion!
    mae = randomFloat(-0.7, -0.1)
    notes = randomChoice(smcNotesWin)
  } else if (isBe) {
    normalRr = 0.0
    normalMaxRr = randomFloat(2.0, 3.8) // Strong excursion before pulling back to BE
    mae = randomFloat(-0.5, -0.1)
    notes = 'Hit +2.5R partial zone, stop moved to BE, reversed on London-NY handover.'
  } else {
    normalRr = -1.0
    // A few reversal losses to test Edge Analysis scatter
    normalMaxRr = random() < 0.2 ? randomFloat(1.5, 3.2) : randomFloat(0.1, 0.7)
    mae = -1.0
    notes = randomChoice(smcNotesLoss)
  }

  const normalTpPoints = normalRr > 0 ? Number((normalRr * slPoints).toFixed(1)) : -slPoints
  const quality = isWin ? randomChoice(['Green', 'Green', 'Blue']) : isBe ? 'Yellow' : randomChoice(['Orange', 'Red'])
  const news = random() < 0.2

  const trailRr = isWin ? Number((normalRr + randomChoice([0.5, 1.0, 1.5])).toFixed(2)) : normalRr

  journalEntries.push({
    setupName: 'ICT / SMC Classic',
    symbol,
    entryDatetime: d.entryTime.toISOString(),
    exitDatetime: d.exitTime.toISOString(),
    sessionName,
    position,
    directionBias,
    entryTimeframe: randomChoice(['M5', 'M1', 'M15']),
    news,
    quality,
    isTest: false,
    images: random() < 0.35 ? [randomChoice(sampleImages)] : null,
    notes,
    normalSlPoints: slPoints,
    normalRr,
    normalMaxRr,
    normalTpPoints,
    beSlPoints: slPoints,
    beRr: isWin ? normalRr : isBe ? 0.0 : -1.0,
    beMaxRr: normalMaxRr,
    beTpPoints: normalTpPoints,
    trailSlPoints: slPoints,
    trailRr,
    trailMaxRr: normalMaxRr + 0.5,
    trailTpPoints: Number((trailRr * slPoints).toFixed(1)),
    customData: {
      'Killzone': sessionName === 'London' ? 'London Open' : 'NY Open',
      'Displacement Quality': isWin ? 'A+ High Energy' : randomChoice(['B Moderate', 'C Low Displacement']),
      'Confluence Count': isWin ? randomInt(3, 5) : randomInt(1, 3),
      'MAE': mae
    }
  })
})

// 3. Generate 100 Breakout Strategy trades (~40% Win Rate, Demo Testing)
breakoutDates.forEach((d, idx) => {
  const isWin = idx < 40
  const isBe = idx >= 40 && idx < 44
  const isLoss = idx >= 44

  const symbol = randomChoice(['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD'])
  const position = randomChoice(['Buy', 'Sell'])
  const directionBias = position === 'Buy' ? 'Bullish' : 'Bearish'
  const sessionName = d.isLondon ? 'London' : 'New York'
  const slPoints = randomFloat(12, 25, 1)

  let normalRr, normalMaxRr, mae, notes

  if (isWin) {
    normalRr = randomChoice([1.5, 2.0, 2.2, 2.5, 3.0])
    normalMaxRr = randomFloat(normalRr, normalRr + randomFloat(0.2, 1.2))
    mae = randomFloat(-0.5, -0.1)
    notes = randomChoice(breakoutNotesWin)
  } else if (isBe) {
    normalRr = 0.0
    normalMaxRr = randomFloat(1.0, 1.8)
    mae = randomFloat(-0.4, -0.1)
    notes = 'Breakout stalled, closed at BE.'
  } else {
    normalRr = -1.0
    normalMaxRr = randomFloat(0.1, 0.8)
    mae = -1.0
    notes = randomChoice(breakoutNotesLoss)
  }

  const normalTpPoints = normalRr > 0 ? Number((normalRr * slPoints).toFixed(1)) : -slPoints
  const quality = isWin ? 'Green' : isBe ? 'Yellow' : 'Orange'

  journalEntries.push({
    setupName: 'Breakout Strategy',
    symbol,
    entryDatetime: d.entryTime.toISOString(),
    exitDatetime: d.exitTime.toISOString(),
    sessionName,
    position,
    directionBias,
    entryTimeframe: 'M15',
    news: false,
    quality,
    isTest: true, // Demo trades
    images: null,
    notes,
    normalSlPoints: slPoints,
    normalRr,
    normalMaxRr,
    normalTpPoints,
    beSlPoints: slPoints,
    beRr: isWin ? normalRr : isBe ? 0.0 : -1.0,
    beMaxRr: normalMaxRr,
    beTpPoints: normalTpPoints,
    trailSlPoints: slPoints,
    trailRr: normalRr,
    trailMaxRr: normalMaxRr,
    trailTpPoints: normalTpPoints,
    customData: {
      'Range Size (Pips)': randomFloat(25, 60, 1),
      'Breakout Direction': position === 'Buy' ? 'Up' : 'Down',
      'MAE': mae
    }
  })
})

const seedData = {
  symbols,
  setups,
  journalEntries
}

const outputPath = path.resolve(__dirname, '../src/main/db/seed-data.json')
fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2), 'utf-8')
console.log(`✅ Generated seed-data.json with:`)
console.log(`- ${symbols.length} symbols`)
console.log(`- ${setups.length} setups`)
console.log(`- ${journalEntries.length} journal entries (100 per setup: HA Model, ICT/SMC Classic, Breakout Strategy)`)
console.log(`File saved at: ${outputPath}`)
