import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export function openDb(file = process.env.DATABASE_PATH || 'data/ghalia.db') {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    );
    CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at DESC);
  `)
  return db
}

const row = (r) => ({ ...r, payload: JSON.parse(r.payload) })

export function createSubmission(db, { kind, name, email, phone, payload }) {
  const reference = `GH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
  db.prepare('INSERT INTO submissions (reference, kind, name, email, phone, payload) VALUES (?, ?, ?, ?, ?, ?)')
    .run(reference, kind, name, email ?? null, phone ?? null, JSON.stringify(payload))
  return reference
}

export function listSubmissions(db, { kind, status } = {}) {
  const where = []
  const args = []
  if (kind) { where.push('kind = ?'); args.push(kind) }
  if (status) { where.push('status = ?'); args.push(status) }
  const sql = `SELECT * FROM submissions ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id DESC LIMIT 500`
  return db.prepare(sql).all(...args).map(row)
}

export function setStatus(db, reference, status) {
  return db.prepare('UPDATE submissions SET status = ? WHERE reference = ?').run(status, reference).changes > 0
}
