const Database = require('better-sqlite3');
const db = new Database('C:/Users/thero/AppData/Roaming/trading_journal_v2/trading_journal.db', { fileMustExist: false });
console.log("Tables:", db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
try {
  console.log("Sessions:", db.prepare("SELECT * FROM setup_sessions").all());
} catch(e) {
  console.log("Error querying sessions:", e.message);
}
