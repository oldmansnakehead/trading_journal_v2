import { getDb, closeDb } from '../src/main/db/client'
import { setups, setupSessions } from '../src/main/db/schema'

const test = () => {
  try {
    const db = getDb()
    console.log("DB instance created.")
    
    // Add a setup
    const newSetup = db.insert(setups).values({
      name: 'Test Setup',
      description: 'Test',
      type: 'demo'
    }).returning().get()
    console.log("Setup created:", newSetup)

    // Add a session
    const newSession = db.insert(setupSessions).values({
      setupId: newSetup.id,
      sessionName: 'New York',
      startTime: '08:00',
      endTime: '16:00'
    }).returning().get()
    console.log("Session created:", newSession)
    
  } catch (error) {
    console.error("ERROR:", error)
  } finally {
    closeDb()
  }
}

test()
