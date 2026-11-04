export const KINDS = ['order', 'wedding', 'corporate', 'partnership', 'general']
export const STATUSES = ['new', 'in-progress', 'closed']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^[+()\d\s-]{7,24}$/
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function cleanItems(items) {
  if (!Array.isArray(items)) return []
  return items.slice(0, 40).map((i) => ({
    collection: clean(i?.collection, 60),
    format: clean(i?.format, 60),
    filling: clean(i?.filling, 60),
    quantity: Math.min(Math.max(Math.trunc(Number(i?.quantity)) || 0, 0), 5000),
    note: clean(i?.note, 400),
  }))
}

function cleanConcept(concept) {
  if (!concept || typeof concept !== 'object' || Array.isArray(concept)) return null
  const out = {}
  for (const [key, value] of Object.entries(concept).slice(0, 12)) {
    if (typeof value === 'string' || typeof value === 'boolean') out[clean(key, 30)] = typeof value === 'string' ? clean(value, 300) : value
  }
  return out
}

/** Returns { errors } keyed by field, or { value } ready to store. */
export function validateSubmission(body = {}) {
  const errors = {}
  const kind = clean(body.kind, 20)
  const name = clean(body.name, 120)
  const email = clean(body.email, 160)
  const phone = clean(body.phone, 24)

  if (!KINDS.includes(kind)) errors.kind = 'invalid'
  if (name.length < 2) errors.name = 'required'
  if (email && !EMAIL.test(email)) errors.email = 'invalid'
  if (phone && !PHONE.test(phone)) errors.phone = 'invalid'
  if (!email && !phone) errors.contact = 'required'
  if (body.consent !== true) errors.consent = 'required'

  const payload = {
    message: clean(body.message, 4000),
    city: clean(body.city, 80),
    date: clean(body.date, 20),
    guests: clean(body.guests, 20),
    occasion: clean(body.occasion, 80),
    company: clean(body.company, 120),
    concept: cleanConcept(body.concept),
    language: clean(body.language, 2),
  }

  if (kind === 'order') {
    payload.items = cleanItems(body.items).filter((i) => i.collection && i.format && i.quantity > 0)
    if (!payload.items.length) errors.items = 'required'
  } else if (payload.message.length < 5 && !payload.concept) {
    errors.message = 'required'
  }

  if (Object.keys(errors).length) return { errors }
  return { value: { kind, name, email: email || null, phone: phone || null, payload } }
}
