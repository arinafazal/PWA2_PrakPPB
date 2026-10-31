import { useState, useEffect, useCallback } from 'react'
import {
  getArchivedGuns,
  archiveGunLocally,
  restoreGunLocally,
  deleteArchivedGunPermanently,
} from '../utils/archiveStorage'

// ---------------------------------------------------------------------------
// useArchivedGuns — Manage soft-deleted / archived products (Challenge 6)
// ---------------------------------------------------------------------------

export function useArchivedGuns() {
  const [archivedGuns, setArchivedGuns] = useState(getArchivedGuns)
  const [loading, setLoading] = useState(false)

  const fetchArchived = useCallback(() => {
    setLoading(true)
    try {
      const list = getArchivedGuns()
      setArchivedGuns(list)
    } finally {
      setLoading(false)
    }
  }, [])

  const archiveGun = useCallback((gun) => {
    const ok = archiveGunLocally(gun)
    if (ok) setArchivedGuns(getArchivedGuns())
    return ok
  }, [])

  const restoreGun = useCallback((gunId) => {
    const ok = restoreGunLocally(gunId)
    if (ok) setArchivedGuns(getArchivedGuns())
    return ok
  }, [])

  const deletePermanent = useCallback((gunId) => {
    const ok = deleteArchivedGunPermanently(gunId)
    if (ok) setArchivedGuns(getArchivedGuns())
    return ok
  }, [])

  useEffect(() => {
    fetchArchived()
    // Listen to storage events across tabs or local changes
    const onStorage = (e) => {
      if (e.key === 'bore_barrel_archived_guns') {
        fetchArchived()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [fetchArchived])

  return {
    archivedGuns,
    loading,
    archiveGun,
    restoreGun,
    deletePermanent,
    refetch: fetchArchived,
  }
}
