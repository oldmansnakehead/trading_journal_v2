import { getDb } from './client'
import {
  symbols,
  setups,
  setupSessions,
  setupPlaybooks,
  customColumns,
  journalEntries
} from './schema'

export async function seed() {
  const db = getDb()
  // Note: getDb() handles pragma and WAL mode

  try {
    console.log('Clearing existing data...')
    db.delete(journalEntries).run()
    db.delete(customColumns).run()
    db.delete(setupPlaybooks).run()
    db.delete(setupSessions).run()
    db.delete(setups).run()
    db.delete(symbols).run()

    console.log('Inserting symbols...')
    const insertedSymbols = db
      .insert(symbols)
      .values([
        { name: 'XAUUSD' },
        { name: 'EURUSD' },
        { name: 'GBPUSD' },
        { name: 'USDJPY' },
        { name: 'BTCUSD' }
      ])
      .returning()
      .all()

    console.log('Inserting setups...')
    const insertedSetups = db
      .insert(setups)
      .values([
        {
          name: 'ICT / SMC Classic',
          type: 'real',
          description: 'Focus on FVG, Liquidity sweeps, and Order Blocks in London & NY sessions.'
        },
        {
          name: 'Breakout Strategy',
          type: 'demo',
          description: 'Testing high-momentum breakout on Asian range high/low.'
        }
      ])
      .returning()
      .all()

    console.log('Inserting sessions, playbooks & custom columns...')
    for (const setup of insertedSetups) {
      db.insert(setupSessions)
        .values([
          { setupId: setup.id, sessionName: 'London', startTime: '08:00', endTime: '16:00' },
          { setupId: setup.id, sessionName: 'New York', startTime: '13:00', endTime: '21:00' }
        ])
        .run()

      db.insert(setupPlaybooks)
        .values([
          {
            setupId: setup.id,
            content:
              '# Entry Rules\n1. Wait for Asian Range high/low sweep\n2. M5 MSS with displacement\n3. Enter on FVG retracement'
          }
        ])
        .run()

      db.insert(customColumns)
        .values([
          { setupId: setup.id, name: 'Confluence Count', type: 'number', reportFilter: true },
          { setupId: setup.id, name: 'Emotional State', type: 'string', reportFilter: false }
        ])
        .run()
    }

    console.log('Inserting journal entries (Mock trades)...')
    db.insert(journalEntries)
      .values([
        {
          setupId: insertedSetups[0].id,
          symbolId: insertedSymbols[0].id, // XAUUSD
          entryDatetime: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          exitDatetime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
          sessionName: 'London',
          position: 'Buy',
          directionBias: 'Bullish',
          entryTimeframe: 'M5',
          news: false,
          quality: 'Green',
          isTest: false,
          images: JSON.stringify([
            'https://placehold.co/800x450/e2e8f0/64748b?text=Chart+1',
            'https://placehold.co/800x450/e2e8f0/64748b?text=Chart+2'
          ]),
          notes:
            'Great setup, followed the plan perfectly. Waited for the London open liquidity sweep and entered on M5 CHOCH.',
          normalSlPoints: 20,
          normalRr: 3.5,
          normalMaxRr: 4.0,
          normalTpPoints: 70,
          beSlPoints: null,
          beRr: null,
          beMaxRr: null,
          beTpPoints: null,
          trailSlPoints: 20,
          trailRr: 4.0,
          trailMaxRr: 5.5,
          trailTpPoints: 80,
          customData: JSON.stringify({ 'Confluence Count': 4, 'Emotional State': 'Calm' })
        },
        {
          setupId: insertedSetups[1].id,
          symbolId: insertedSymbols[1].id, // EURUSD
          entryDatetime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          exitDatetime: new Date(Date.now() - 86400000 + 1800000).toISOString(),
          sessionName: 'New York',
          position: 'Sell',
          directionBias: 'Bearish',
          entryTimeframe: 'M1',
          news: true,
          quality: 'Orange',
          isTest: true,
          images: JSON.stringify(['https://placehold.co/800x450/e2e8f0/64748b?text=Chart+3']),
          notes: 'Took a paper trade during news. Spread got wide and hit SL quickly.',
          normalSlPoints: 10,
          normalRr: -1,
          normalMaxRr: 0.5,
          normalTpPoints: -10,
          beSlPoints: null,
          beRr: null,
          beMaxRr: null,
          beTpPoints: null,
          trailSlPoints: null,
          trailRr: null,
          trailMaxRr: null,
          trailTpPoints: null,
          customData: JSON.stringify({ 'Confluence Count': 2, 'Emotional State': 'Anxious' })
        }
      ])
      .run()

    console.log('✅ Database seeding complete!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}
