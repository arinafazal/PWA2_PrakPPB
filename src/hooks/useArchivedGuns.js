import { useState, useEffect, useCallback } from 'react'
import gunService from '../services/gunService'

// ---------------------------------------------------------------------------
// useArchivedGuns — fetch all soft-deleted (archived) products.
// Returns { archivedGuns, loading, error, refetch }.
// ---------------------------------------------------------------------------

export function useArchivedGuns() {
  const [archivedGuns, setArchivedGuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchArchived = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await gunService.getArchivedGuns()
      if (response.success) {
        setArchivedGuns(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch archived items.')
      }
    } catch (err) {
      setError(err.message || 'Error fetching archived items.')
      setArchivedGuns([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArchived()
  }, [fetchArchived])

  return { archivedGuns, loading, error, refetch: fetchArchived }
}
