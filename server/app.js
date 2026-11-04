import path from 'node:path'
import crypto from 'node:crypto'
import express from 'express'
import { createSubmission, listSubmissions, setStatus } from './db.js'
import { STATUSES, validateSubmission } from './validate.js'

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 12

function rateLimiter() {
  const hits = new Map()
  return (req, res, next) => {
    const now = Date.now()
    const entry = hits.get(req.ip)
    if (!entry || now - entry.start > WINDOW_MS) {
      hits.set(req.ip, { start: now, count: 1 })
      return next()
    }
    entry.count += 1
    if (entry.count > MAX_PER_WINDOW) return res.status(429).json({ error: 'rate_limited' })
    next()
  }
}

function requireAdmin(token) {
  const expected = token ? Buffer.from(token) : null
  return (req, res, next) => {
    if (!expected) return res.status(503).json({ error: 'admin_disabled' })
    const given = Buffer.from((req.get('authorization') || '').replace(/^Bearer\s+/i, ''))
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
      return res.status(401).json({ error: 'unauthorized' })
    }
    next()
  }
}

async function notify(url, submission) {
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(submission),
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    console.error('notify failed:', err.message)
  }
}

export function createApp({ db, adminToken, webhookUrl, distDir }) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy':
        "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' blob: data:; worker-src 'self' blob:; base-uri 'self'; form-action 'self'",
    })
    next()
  })

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  const json = express.json({ limit: '64kb' })

  app.post('/api/submissions', rateLimiter(), json, (req, res) => {
    // Honeypot: real visitors never see this field.
    if (req.body?.website) return res.status(201).json({ reference: 'GH-000000' })

    const { errors, value } = validateSubmission(req.body)
    if (errors) return res.status(422).json({ errors })

    const reference = createSubmission(db, value)
    notify(webhookUrl, { reference, ...value })
    res.status(201).json({ reference })
  })

  const admin = requireAdmin(adminToken)

  app.get('/api/admin/submissions', admin, (req, res) => {
    res.json({ submissions: listSubmissions(db, { kind: req.query.kind, status: req.query.status }) })
  })

  app.patch('/api/admin/submissions/:reference', admin, json, (req, res) => {
    if (!STATUSES.includes(req.body?.status)) return res.status(422).json({ error: 'invalid_status' })
    if (!setStatus(db, req.params.reference, req.body.status)) return res.status(404).json({ error: 'not_found' })
    res.json({ ok: true })
  })

  app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }))

  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
      return res.status(400).json({ error: 'bad_request' })
    }
    console.error(err)
    res.status(500).json({ error: 'server_error' })
  })

  if (distDir) {
    app.use('/assets', express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }))
    app.use(express.static(distDir, { maxAge: '7d', index: false }))
    app.get('/{*path}', (req, res) => res.sendFile(path.join(distDir, 'index.html'), { maxAge: 0 }))
  }

  return app
}
