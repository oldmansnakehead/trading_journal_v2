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
      {
        name: 'Zone',
        type: 'single_selector',
        options: ['FVG', 'OB', 'BREAKER BLOCK'],
        reportFilter: true,
        description: 'Entry Zone / Key Level'
      },
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
        name: 'Zone',
        type: 'single_selector',
        options: ['FVG', 'OB', 'BREAKER BLOCK'],
        reportFilter: true,
        description: 'Entry Zone / Key Level'
      },
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

// Generate dates spread across May 2026 to October 2026 (Mon-Fri trading days)
function generateTradingDates(count, baseDayOffset = 0) {
  const dates = []
  const baseDate = new Date('2026-05-04T08:00:00.000Z') // Monday
  let current = new Date(baseDate.getTime() + baseDayOffset * 86400000)

  while (dates.length < count) {
    const day = current.getUTCDay()
    if (day >= 1 && day <= 5) {
      const isLondon = random() < 0.65
      const hour = isLondon ? randomInt(8, 11) : randomInt(13, 16)
      const minute = randomChoice([0, 5, 12, 15, 23, 30, 35, 45, 52])

      const entryTime = new Date(current)
      entryTime.setUTCHours(hour, minute, 0, 0)

      const durationMins = randomInt(30, 220)
      const exitTime = new Date(entryTime.getTime() + durationMins * 60000)

      dates.push({ entryTime, exitTime, isLondon })
    }
    // Step forward 1 to 3 days
    const step = random() < 0.4 ? 1 : random() < 0.85 ? 2 : 3
    current = new Date(current.getTime() + step * 86400000)
  }
  return dates
}

const sampleImages = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60'
]

const journalEntries = []

// Helper for generating dynamic trade outcomes based on attributes
function generateTradeOutcome(options) {
  const { zone, emotionalState, displacement, setupBaseWinRate } = options

  // Calculate dynamic win probability based on real statistical edge
  let winProb = setupBaseWinRate || 0.52

  // Edge by Zone:
  if (zone === 'OB') winProb += 0.14          // OB has highest edge
  else if (zone === 'FVG') winProb += 0.03     // FVG solid performance
  else if (zone === 'BREAKER BLOCK') winProb -= 0.11 // Breaker has lower win rate

  // Edge by Psychology:
  if (emotionalState === 'Disciplined') winProb += 0.08
  else if (emotionalState === 'FOMO') winProb -= 0.28
  else if (emotionalState === 'Revenge') winProb -= 0.35
  else if (emotionalState === 'Hesitant') winProb -= 0.10

  // Edge by Displacement Quality:
  if (displacement === 'A+ High Energy') winProb += 0.09
  else if (displacement === 'C Low Displacement') winProb -= 0.15

  // Bound probability
  winProb = Math.max(0.18, Math.min(0.82, winProb))

  const roll = random()
  const beRate = 0.08

  if (roll < winProb) {
    return 'win'
  } else if (roll < winProb + beRate) {
    return 'be'
  } else {
    return 'loss'
  }
}

// 1. HA Model Trades (~65 trades, chronological with natural streaks)
const haDates = generateTradingDates(65, 0)
haDates.forEach((d) => {
  const zone = randomChoice(['OB', 'OB', 'FVG', 'FVG', 'FVG', 'BREAKER BLOCK'])
  const emotionalState = randomChoice([
    'Disciplined', 'Disciplined', 'Disciplined', 'Disciplined',
    'FOMO', 'Hesitant', 'Revenge', 'Neutral'
  ])
  const setupTypeDetail = randomChoice(['Liquidity Sweep', 'Continuation', 'Session Open Reversal'])
  const symbol = randomChoice(['XAUUSD', 'XAUUSD', 'XAUUSD', 'EURUSD', 'EURUSD', 'GBPUSD'])
  const position = randomChoice(['Buy', 'Sell'])
  const directionBias = position === 'Buy' ? 'Bullish' : 'Bearish'
  const sessionName = d.isLondon ? 'London' : 'New York'
  const slPoints = symbol === 'XAUUSD' ? randomFloat(18, 32, 1) : randomFloat(9, 18, 1)

  const outcome = generateTradeOutcome({
    zone,
    emotionalState,
    setupBaseWinRate: 0.56
  })

  let normalRr, normalMaxRr, mae, notes, quality

  if (outcome === 'win') {
    normalRr = randomChoice([1.8, 2.2, 2.5, 3.0, 3.2, 3.5, 4.0, 4.2])
    normalMaxRr = randomFloat(normalRr, normalRr + randomFloat(0.3, 1.6))
    mae = randomFloat(-0.55, -0.05)
    quality = randomChoice(['Green', 'Green', 'Blue'])
    notes = zone === 'OB'
      ? `Textbook ${zone} reaction during ${sessionName} session. Clear MSS with high energy impulse. Reached full target at +${normalRr}R.`
      : `Clean ${zone} tap following liquidity sweep. Followed HTF draw on liquidity strictly. Hit +${normalRr}R.`
  } else if (outcome === 'be') {
    normalRr = 0.0
    normalMaxRr = randomFloat(1.2, 2.4)
    mae = randomFloat(-0.4, -0.1)
    quality = 'Yellow'
    notes = `Trade pushed +1.8R into profit. Trailed stop loss to Break Even according to rules. Reversed to take out BE.`
  } else {
    normalRr = randomChoice([-1.0, -1.0, -1.0, -0.8, -0.5])
    normalMaxRr = random() < 0.2 ? randomFloat(1.0, 1.8) : randomFloat(0.1, 0.5)
    mae = -1.0
    quality = randomChoice(['Orange', 'Red'])
    notes = emotionalState === 'FOMO'
      ? `Chased entry on ${zone} without displacement confirmation. Punished by the market, took planned -1.0R loss.`
      : `${zone} failed to hold under heavy counter-trend pressure. Stopped out at planned -1.0R.`
  }

  const normalTpPoints = normalRr > 0 ? Number((normalRr * slPoints).toFixed(1)) : -slPoints
  const beRr = outcome === 'win' ? normalRr : outcome === 'be' ? 0.0 : -1.0
  const trailRr = outcome === 'win' ? Number((normalRr + randomChoice([0.2, 0.4, 0.6])).toFixed(2)) : normalRr

  journalEntries.push({
    setupName: 'HA Model',
    symbol,
    entryDatetime: d.entryTime.toISOString(),
    exitDatetime: d.exitTime.toISOString(),
    sessionName,
    position,
    directionBias,
    entryTimeframe: randomChoice(['M5', 'M5', 'M15', 'M1']),
    news: random() < 0.15,
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
    beMaxRr: normalMaxRr,
    beTpPoints: normalTpPoints,
    trailSlPoints: slPoints,
    trailRr,
    trailMaxRr: normalMaxRr,
    trailTpPoints: Number((trailRr * slPoints).toFixed(1)),
    customData: {
      'Zone': zone,
      'Confluence Count': outcome === 'win' ? randomInt(3, 5) : randomInt(1, 3),
      'Emotional State': emotionalState,
      'Setup Type Detail': setupTypeDetail,
      'MAE': mae
    }
  })
})

// 2. ICT / SMC Classic Trades (~60 trades, higher R multi-payoffs, natural streaks)
const smcDates = generateTradingDates(60, 1)
smcDates.forEach((d) => {
  const zone = randomChoice(['OB', 'OB', 'FVG', 'FVG', 'BREAKER BLOCK', 'BREAKER BLOCK'])
  const killzone = d.isLondon ? 'London Open' : 'NY Open'
  const displacement = randomChoice(['A+ High Energy', 'A+ High Energy', 'B Moderate', 'C Low Displacement'])
  const symbol = randomChoice(['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD'])
  const position = randomChoice(['Buy', 'Sell'])
  const directionBias = position === 'Buy' ? 'Bullish' : 'Bearish'
  const sessionName = d.isLondon ? 'London' : 'New York'
  const slPoints = symbol === 'XAUUSD' ? randomFloat(18, 35, 1) : symbol === 'BTCUSD' ? randomFloat(180, 420, 0) : randomFloat(10, 22, 1)

  const outcome = generateTradeOutcome({
    zone,
    displacement,
    setupBaseWinRate: 0.48
  })

  let normalRr, normalMaxRr, mae, notes, quality

  if (outcome === 'win') {
    normalRr = randomChoice([3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.5, 7.2])
    normalMaxRr = randomFloat(normalRr, normalRr + randomFloat(0.5, 2.5))
    mae = randomFloat(-0.65, -0.08)
    quality = randomChoice(['Green', 'Green', 'Blue'])
    notes = `High conviction ${zone} execution in ${killzone}. Massive institutional expansion with ${displacement}. Multi-R payoff +${normalRr}R secured.`
  } else if (outcome === 'be') {
    normalRr = 0.0
    normalMaxRr = randomFloat(2.0, 3.5)
    mae = randomFloat(-0.45, -0.1)
    quality = 'Yellow'
    notes = `Reached +2.5R partial zone off ${zone}. Stop moved to BE. Volatility spikes took out runner at 0.0R.`
  } else {
    normalRr = -1.0
    normalMaxRr = random() < 0.25 ? randomFloat(1.2, 2.2) : randomFloat(0.1, 0.7)
    mae = -1.0
    quality = randomChoice(['Orange', 'Red'])
    notes = displacement === 'C Low Displacement'
      ? `Lack of displacement energy on ${zone} retest. Failed to hold structure, clean -1.0R loss taken without emotion.`
      : `Draw on liquidity shifted unexpectedly. ${zone} swept, strict invalidation respected.`
  }

  const normalTpPoints = normalRr > 0 ? Number((normalRr * slPoints).toFixed(1)) : -slPoints
  const beRr = outcome === 'win' ? normalRr : outcome === 'be' ? 0.0 : -1.0
  const trailRr = outcome === 'win' ? Number((normalRr + randomChoice([0.3, 0.7, 1.2])).toFixed(2)) : normalRr

  journalEntries.push({
    setupName: 'ICT / SMC Classic',
    symbol,
    entryDatetime: d.entryTime.toISOString(),
    exitDatetime: d.exitTime.toISOString(),
    sessionName,
    position,
    directionBias,
    entryTimeframe: randomChoice(['M5', 'M15', 'M1']),
    news: random() < 0.18,
    quality,
    isTest: false,
    images: random() < 0.4 ? [randomChoice(sampleImages)] : null,
    notes,
    normalSlPoints: slPoints,
    normalRr,
    normalMaxRr,
    normalTpPoints,
    beSlPoints: slPoints,
    beRr,
    beMaxRr: normalMaxRr,
    beTpPoints: normalTpPoints,
    trailSlPoints: slPoints,
    trailRr,
    trailMaxRr: normalMaxRr + 0.5,
    trailTpPoints: Number((trailRr * slPoints).toFixed(1)),
    customData: {
      'Zone': zone,
      'Killzone': killzone,
      'Displacement Quality': displacement,
      'Confluence Count': outcome === 'win' ? randomInt(3, 5) : randomInt(1, 3),
      'MAE': mae
    }
  })
})

// 3. Breakout Strategy Trades (~45 trades, demo testing)
const breakoutDates = generateTradingDates(45, 2)
breakoutDates.forEach((d) => {
  const symbol = randomChoice(['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD'])
  const position = randomChoice(['Buy', 'Sell'])
  const directionBias = position === 'Buy' ? 'Bullish' : 'Bearish'
  const sessionName = d.isLondon ? 'London' : 'New York'
  const slPoints = randomFloat(12, 26, 1)

  const outcome = generateTradeOutcome({
    setupBaseWinRate: 0.42
  })

  let normalRr, normalMaxRr, mae, notes, quality

  if (outcome === 'win') {
    normalRr = randomChoice([1.5, 2.0, 2.2, 2.5, 3.0])
    normalMaxRr = randomFloat(normalRr, normalRr + randomFloat(0.2, 1.2))
    mae = randomFloat(-0.5, -0.1)
    quality = 'Green'
    notes = `Strong Asian range breakout with above-average volume. Follow-through hit +${normalRr}R target.`
  } else if (outcome === 'be') {
    normalRr = 0.0
    normalMaxRr = randomFloat(1.0, 1.8)
    mae = randomFloat(-0.4, -0.1)
    quality = 'Yellow'
    notes = `Breakout lost momentum at range extension. Protected position at Break Even.`
  } else {
    normalRr = -1.0
    normalMaxRr = randomFloat(0.1, 0.7)
    mae = -1.0
    quality = randomChoice(['Orange', 'Red'])
    notes = `False breakout: price rejected sharply back inside the range. Stopped out at -1.0R.`
  }

  const normalTpPoints = normalRr > 0 ? Number((normalRr * slPoints).toFixed(1)) : -slPoints

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
    isTest: true,
    images: null,
    notes,
    normalSlPoints: slPoints,
    normalRr,
    normalMaxRr,
    normalTpPoints,
    beSlPoints: slPoints,
    beRr: outcome === 'win' ? normalRr : outcome === 'be' ? 0.0 : -1.0,
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

// Sort ALL journal entries chronologically by entryDatetime
journalEntries.sort((a, b) => new Date(a.entryDatetime).getTime() - new Date(b.entryDatetime).getTime())

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
console.log(`- ${journalEntries.length} journal entries sorted chronologically with natural win/loss distribution`)
console.log(`File saved at: ${outputPath}`)
