import fs from 'node:fs'
import path from 'node:path'
import { createApp } from './app.js'
import { openDb } from './db.js'

if (fs.existsSync('.env')) process.loadEnvFile('.env')

const dist = path.resolve('dist')
const app = createApp({
  db: openDb(),
  adminToken: process.env.ADMIN_TOKEN,
  webhookUrl: process.env.NOTIFY_WEBHOOK_URL,
  distDir: fs.existsSync(dist) ? dist : null,
})

const port = Number(process.env.PORT) || 8787
app.listen(port, (err) => {
  if (err) throw err
  console.log(`GHALIA server on http://localhost:${port}`)
})
