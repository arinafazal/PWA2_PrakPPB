// ---------------------------------------------------------------------------
// useQueryCache.js — dual-layer query cache (in-memory + browser disk Cache Storage)
// When inspected in DevTools Network/Application tab, entries are stored in disk cache.
// ---------------------------------------------------------------------------

const MEMORY_CACHE = new Map()
const CACHE_NAME = 'api-query-cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export function getCached(key) {
  // 1. In-memory check
  const mem = MEMORY_CACHE.get(key)
  if (mem) {
    if (Date.now() - mem.timestamp <= CACHE_TTL) {
      return mem.data
    }
    MEMORY_CACHE.delete(key)
  }

  // 2. LocalStorage disk fallback
  try {
    const raw = localStorage.getItem(`cache_${key}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.timestamp <= CACHE_TTL) {
        MEMORY_CACHE.set(key, parsed)
        return parsed.data
      }
      localStorage.removeItem(`cache_${key}`)
    }
  } catch {}

  return null
}

export function setCached(key, data) {
  const entry = { data, timestamp: Date.now() }
  MEMORY_CACHE.set(key, entry)
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
  } catch {}
}

export function invalidateCache(key) {
  MEMORY_CACHE.delete(key)
  try {
    localStorage.removeItem(`cache_${key}`)
  } catch {}
}

export function invalidateCacheByPrefix(prefix) {
  for (const k of MEMORY_CACHE.keys()) {
    if (k.startsWith(prefix)) MEMORY_CACHE.delete(k)
  }
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(`cache_${prefix}`)) {
        localStorage.removeItem(k)
      }
    }
  } catch {}
}
