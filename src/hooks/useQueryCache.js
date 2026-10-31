// ---------------------------------------------------------------------------
// useQueryCache.js — Query cache dengan localStorage sebagai disk storage.
// Data di-cache selama TTL, dan setelah itu di-fetch ulang dari server.
// Cache ini membuat request API hanya terjadi SEKALI, berikutnya dari disk.
// ---------------------------------------------------------------------------

const MEMORY_CACHE = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 jam

export function getCached(key) {
  // 1. Cek memory cache (paling cepat)
  const mem = MEMORY_CACHE.get(key)
  if (mem) {
    if (Date.now() - mem.timestamp <= CACHE_TTL) {
      return mem.data
    }
    MEMORY_CACHE.delete(key)
  }

  // 2. Cek localStorage (disk cache — bertahan meski browser di-refresh)
  try {
    const raw = localStorage.getItem(`qcache_${key}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.timestamp <= CACHE_TTL) {
        MEMORY_CACHE.set(key, parsed) // naikan ke memory
        return parsed.data
      }
      localStorage.removeItem(`qcache_${key}`)
    }
  } catch {}

  return null
}

export function setCached(key, data) {
  const entry = { data, timestamp: Date.now() }
  MEMORY_CACHE.set(key, entry)
  try {
    localStorage.setItem(`qcache_${key}`, JSON.stringify(entry))
  } catch {}
}

export function invalidateCache(key) {
  MEMORY_CACHE.delete(key)
  try { localStorage.removeItem(`qcache_${key}`) } catch {}
}

export function invalidateCacheByPrefix(prefix) {
  for (const k of MEMORY_CACHE.keys()) {
    if (k.startsWith(prefix)) MEMORY_CACHE.delete(k)
  }
  try {
    const toDelete = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(`qcache_${prefix}`)) toDelete.push(k)
    }
    toDelete.forEach((k) => localStorage.removeItem(k))
  } catch {}
}

export function isCached(key) {
  return getCached(key) !== null
}

export function getCacheInfo(key) {
  try {
    const raw = localStorage.getItem(`qcache_${key}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      cachedAt: new Date(parsed.timestamp).toLocaleTimeString(),
      expiresIn: Math.round((CACHE_TTL - (Date.now() - parsed.timestamp)) / 1000 / 60) + ' menit',
      count: Array.isArray(parsed.data) ? parsed.data.length : 1,
    }
  } catch {
    return null
  }
}
