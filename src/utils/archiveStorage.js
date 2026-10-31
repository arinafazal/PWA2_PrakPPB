// ---------------------------------------------------------------------------
// archiveStorage.js — Soft-delete / Archive storage via localStorage
// Guaranteed to work across all backend schemas without DB column dependencies.
// ---------------------------------------------------------------------------

const ARCHIVE_KEY = 'bore_barrel_archived_guns'

export const getArchivedGuns = () => {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const isGunArchived = (gunId) => {
  if (!gunId) return false
  const list = getArchivedGuns()
  return list.some((item) => String(item.id) === String(gunId))
}

export const archiveGunLocally = (gun) => {
  if (!gun || !gun.id) return false
  try {
    const list = getArchivedGuns()
    if (!list.some((item) => String(item.id) === String(gun.id))) {
      const archivedItem = {
        ...gun,
        archivedAt: new Date().toISOString(),
      }
      list.unshift(archivedItem)
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list))
    }
    return true
  } catch {
    return false
  }
}

export const restoreGunLocally = (gunId) => {
  if (!gunId) return false
  try {
    const list = getArchivedGuns()
    const next = list.filter((item) => String(item.id) !== String(gunId))
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}

export const deleteArchivedGunPermanently = (gunId) => {
  return restoreGunLocally(gunId)
}
