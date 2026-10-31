import { useState, useEffect, useCallback } from 'react'
import gunService from '../services/gunService'
import { getCached, setCached, invalidateCacheByPrefix, getCacheInfo } from './useQueryCache'

// ---------------------------------------------------------------------------
// useGuns — Fetch products with query caching (memory + localStorage disk).
// First load fetches from API. Subsequent loads served instantly from cache.
// refetch() clears cache and fetches fresh data.
// ---------------------------------------------------------------------------

export function useGuns(params = {}) {
  const [guns, setGuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [fromCache, setFromCache] = useState(false)
  const [cacheInfo, setCacheInfoState] = useState(null)

  const paramKey = JSON.stringify(params)

  const fetchGuns = useCallback(async () => {
    const cacheKey = 'guns:' + JSON.stringify(params)

    // Cek cache dulu (memory + localStorage)
    const cached = getCached(cacheKey)
    if (cached) {
      setGuns(cached)
      setLoading(false)
      setFromCache(true)
      setCacheInfoState(getCacheInfo(cacheKey))
      return
    }

    try {
      setLoading(true)
      setError(null)
      setFromCache(false)
      setCacheInfoState(null)

      const response = await gunService.getGuns(params)

      if (response.success) {
        setGuns(response.data || [])
        setPagination(response.pagination || null)
        // Simpan ke cache (memory + localStorage)
        setCached(cacheKey, response.data || [])
        setCacheInfoState(getCacheInfo(cacheKey))
      } else {
        setError(response.message || 'Failed to fetch products.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching products.')
      setGuns([])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey])

  // refetch() selalu invalidate cache lalu fetch ulang dari API
  const refetch = useCallback(async () => {
    invalidateCacheByPrefix('guns:')
    setFromCache(false)
    await fetchGuns()
  }, [fetchGuns])

  useEffect(() => {
    fetchGuns()
  }, [fetchGuns])

  return { guns, loading, error, pagination, refetch, fromCache, cacheInfo }
}

export function useGunById(id) {
  const [gun, setGun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGun = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const response = await gunService.getGunById(id)
      if (response.success) setGun(response.data)
      else setError(response.message || 'Gun not found.')
    } catch (err) {
      setError(err.message || 'Error fetching gun.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchGun() }, [fetchGun])

  return { gun, loading, error, refetch: fetchGun }
}
