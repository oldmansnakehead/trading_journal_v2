import { getDb, closeDb } from '../src/main/db/client'
import { setupSessions } from '../src/main/db/schema'

const check = () => {
  try {
    const db = getDb()
    const all = db.select().from(setupSessions).all()
    console.log("ALL SESSIONS:", all)
  } catch (error) {
    console.error("ERROR:", error)
  } finally {
    closeDb()
  }
}
check()
