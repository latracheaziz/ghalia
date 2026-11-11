import { useSyncExternalStore } from 'react'

/**
 * The admin's data, kept in this browser's localStorage until the backend exists.
 * Every screen goes through useCollection() and collection(), so swapping these
 * for API calls later leaves the screens untouched.
 */
const PREFIX = 'ghalia.admin.'
const cache = new Map()
const listeners = new Set()

function read(name) {
  if (!cache.has(name)) {
    let items = []
    try {
      items = JSON.parse(localStorage.getItem(PREFIX + name)) ?? []
    } catch { /* blocked or corrupt storage starts empty */ }
    cache.set(name, Array.isArray(items) ? items : [])
  }
  return cache.get(name)
}

function write(name, items) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(items))
  } catch (error) {
    // Usually the ~5 MB browser quota, filled by uploaded photos.
    const full = error?.name === 'QuotaExceededError' || error?.code === 22
    throw new Error(full ? 'storage-full' : 'storage-blocked')
  }
  cache.set(name, items)
  listeners.forEach((fn) => fn())
}

// Another tab saved: drop the cached copy so this one re-reads.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key?.startsWith(PREFIX)) return
    cache.delete(e.key.slice(PREFIX.length))
    listeners.forEach((fn) => fn())
  })
}

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

/** Live list of a collection, newest change first. */
export function useCollection(name) {
  return useSyncExternalStore(subscribe, () => read(name))
}

export function collection(name) {
  return {
    all: () => read(name),
    get: (id) => read(name).find((item) => item.id === id) ?? null,
    save(item) {
      const now = new Date().toISOString()
      const items = read(name)
      const existing = items.find((i) => i.id === item.id)
      const saved = existing
        ? { ...existing, ...item, updatedAt: now }
        : { ...item, id: item.id ?? uid(), createdAt: now, updatedAt: now }
      write(name, existing ? items.map((i) => (i.id === saved.id ? saved : i)) : [saved, ...items])
      return saved
    },
    remove(id) {
      write(name, read(name).filter((item) => item.id !== id))
    },
  }
}

export const STORAGE_ERRORS = {
  'storage-full': 'This browser’s storage is full. Remove a few uploaded photos, or use photos from the site library, then save again.',
  'storage-blocked': 'This browser is blocking storage (private mode?), so nothing can be saved.',
}
