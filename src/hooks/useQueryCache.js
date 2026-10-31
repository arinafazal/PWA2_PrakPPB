// ---------------------------------------------------------------------------
// useQueryCache.js — simple in-memory query cache for API responses.
// Cache entries expire after CACHE_TTL milliseconds (default 5 minutes).
// ---------------------------------------------------------------------------

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Retrieve a cached entry by key.
 * Returns null if not found or expired.
 */
export function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

/**
 * Store data in the cache under a given key.
 */
export function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Remove a single cache entry.
 */
export function invalidateCache(key) {
  cache.delete(key)
}

/**
 * Remove all cache entries whose key starts with the given prefix.
 */
export function invalidateCacheByPrefix(prefix) {
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) cache.delete(k)
  }
}
