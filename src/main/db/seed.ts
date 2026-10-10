import { getDb } from './client'
import {
  symbols,
  setups,
  setupSessions,
  setupPlaybooks,
  strategies,
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
    db.delete(strategies).run()
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
        { name: 'US30' },
        { name: 'NAS100' }
      ])
      .returning()
      .all()

    console.log('Inserting setups...')
    const insertedSetups = db
      .insert(setups)
      .values([
        {
          name: 'SMC Classic',
          description: 'Smart Money Concepts targeting liquidity sweeps.',
          type: 'real'
        },
        {
          name: 'Breakout Strategy',
          description: 'Trading breakout of London/Asia range.',
          type: 'demo'
        }
      ])
      .returning()
      .all()

    console.log('Inserting setup details (sessions, strategies, playbooks)...')
    for (const setup of insertedSetups) {
      db.insert(setupSessions)
        .values([
          { setupId: setup.id, sessionName: 'Asia', startTime: '00:00', endTime: '08:00' },
          { setupId: setup.id, sessionName: 'London', startTime: '08:00', endTime: '16:00' },
          { setupId: setup.id, sessionName: 'New York', startTime: '13:00', endTime: '21:00' }
        ])
        .run()

      db.insert(strategies)
        .values([
          { setupId: setup.id, name: 'Liquidity Sweep' },
          { setupId: setup.id, name: 'Order Block Test' }
        ])
        .run()

      db.insert(setupPlaybooks)
        .values({
          setupId: setup.id,
          content: `Playbook for ${setup.name}:\n1. Wait for liquidity sweep.\n2. Look for change of character (CHOCH) on M1/M5.\n3. Enter on retracement to the unmitigated OB.`
        })
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
          strategies: ['Liquidity Sweep'],
          news: false,
          quality: 'Green',
          isTest: false,
          images: [
            'https://placehold.co/800x450/e2e8f0/64748b?text=Chart+1',
            'https://placehold.co/800x450/e2e8f0/64748b?text=Chart+2'
          ],
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
          customData: { 'Confluence Count': 4, 'Emotional State': 'Calm' }
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
          strategies: ['Order Block Test'],
          news: true,
          quality: 'Orange',
          isTest: true,
          images: ['https://placehold.co/800x450/e2e8f0/64748b?text=Chart+3'],
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
          customData: { 'Confluence Count': 2, 'Emotional State': 'Anxious' }
        }
      ])
      .run()

    console.log('✅ Database seeding complete!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}
