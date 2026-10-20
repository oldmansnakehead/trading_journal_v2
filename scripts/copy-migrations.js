const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '../src/main/db/migrations')
const dest = path.join(__dirname, '../out/main/db/migrations')

if (fs.existsSync(src)) {
  fs.mkdirSync(dest, { recursive: true })
  fs.cpSync(src, dest, { recursive: true })
  console.log('[Build] Copied migrations to out/main/db/migrations')
}
