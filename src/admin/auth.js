/**
 * Front-end sign-in for the admin, until the backend exists.
 *
 * This is a lock on the door, not a safe: anyone who reads the site's JavaScript
 * can get past it. Only a SHA-256 hash of the password ships, so the password
 * itself is not readable here. When the backend arrives, signIn() should POST to
 * the server and keep the session it returns; nothing else needs to change.
 */
const EMAIL = 'ghalia@gmail.com'
const PASSWORD_SHA256 = 'b895fa08ee7f54574235c2719780e9dc828b48ba1ddd17f8d30f73e3a323cc09'
const KEY = 'ghalia.admin.session'
const TTL_MS = 8 * 60 * 60 * 1000

async function sha256(text) {
  if (!globalThis.crypto?.subtle) throw new Error('insecure-context')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function signIn(email, password) {
  const ok = email.trim().toLowerCase() === EMAIL && (await sha256(password)) === PASSWORD_SHA256
  if (!ok) return false
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ email: EMAIL, expires: Date.now() + TTL_MS }))
  } catch { /* the session then lasts only for this page view */ }
  return true
}

export function currentSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(KEY))
    return session && session.expires > Date.now() ? session : null
  } catch {
    return null
  }
}

export function signOut() {
  try {
    sessionStorage.removeItem(KEY)
  } catch { /* nothing stored */ }
}
