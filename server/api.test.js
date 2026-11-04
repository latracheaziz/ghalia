import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from './app.js'
import { openDb } from './db.js'

let server
let base
const post = (body) => fetch(`${base}/api/submissions`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})
const auth = { authorization: 'Bearer secret' }

before(async () => {
  const app = createApp({ db: openDb(':memory:'), adminToken: 'secret' })
  await new Promise((resolve) => { server = app.listen(0, resolve) })
  base = `http://localhost:${server.address().port}`
})
after(() => { server.close(); server.closeAllConnections() })

test('stores a valid enquiry and returns a reference', async () => {
  const res = await post({ kind: 'wedding', name: 'Sara', email: 'sara@example.com', message: 'A spring wedding', consent: true })
  assert.equal(res.status, 201)
  assert.match((await res.json()).reference, /^GH-[0-9A-F]{6}$/)
})

test('rejects a submission without a way to reply', async () => {
  const res = await post({ kind: 'general', name: 'Sara', message: 'Hello there', consent: true })
  assert.equal(res.status, 422)
  assert.equal((await res.json()).errors.contact, 'required')
})

test('rejects an order with an empty bag', async () => {
  const res = await post({ kind: 'order', name: 'Sara', phone: '+966 50 000 0000', items: [], consent: true })
  assert.equal((await res.json()).errors.items, 'required')
})

test('requires consent', async () => {
  const res = await post({ kind: 'general', name: 'Sara', email: 'a@b.co', message: 'Hello there' })
  assert.equal((await res.json()).errors.consent, 'required')
})

test('accepts a 3D studio concept in place of a message', async () => {
  const res = await post({ kind: 'wedding', name: 'Sara', email: 'a@b.co', consent: true, concept: { setting: 'pergola', palette: 'blush' } })
  assert.equal(res.status, 201)
})

test('honeypot submissions are not stored', async () => {
  await post({ kind: 'general', name: 'Bot', email: 'bot@x.co', message: 'spam spam', consent: true, website: 'x' })
  const res = await fetch(`${base}/api/admin/submissions`, { headers: auth })
  const { submissions } = await res.json()
  assert.ok(!submissions.some((s) => s.name === 'Bot'))
})

test('admin endpoints need the token', async () => {
  const res = await fetch(`${base}/api/admin/submissions`, { headers: { authorization: 'Bearer nope!!' } })
  assert.equal(res.status, 401)
})

test('admin can read and update a submission', async () => {
  const created = await post({
    kind: 'order', name: 'Noor', phone: '+966500000000', consent: true,
    items: [{ collection: 'ramadan', format: 'gift-box', quantity: 3 }],
  })
  const { reference } = await created.json()
  const patched = await fetch(`${base}/api/admin/submissions/${reference}`, {
    method: 'PATCH',
    headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'closed' }),
  })
  assert.equal(patched.status, 200)
  const { submissions } = await (await fetch(`${base}/api/admin/submissions?status=closed`, { headers: auth })).json()
  assert.equal(submissions[0].reference, reference)
  assert.equal(submissions[0].payload.items[0].quantity, 3)
})

test('malformed JSON gets a 400, not a crash', async () => {
  const res = await fetch(`${base}/api/submissions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{nope' })
  assert.equal(res.status, 400)
})
