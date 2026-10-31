import { useState } from 'react'
import {
  Shield, Copy, Check, Heart, FileText, Camera, Play,
  Pencil, Trash2, Archive, RotateCcw, Loader,
  MapPin, Clock, Phone, Info,
} from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import { useArchivedGuns } from '../hooks/useArchivedGuns'
import gunService from '../services/gunService'
import {
  getAllDraftIds,
  loadDraft,
  deleteDraft,
  formatDraftTime,
  getDraftTimestamp,
} from '../utils/draftStorage'

/**
 * ProfilePage — Operator identity, stats, drafts, archives, about, contact.
 * Challenge 4: About & Contact jadi section di sini.
 * Challenge 5: Section untuk melihat semua draft.
 * Challenge 6: Section arsip (soft-delete) + restore.
 * Challenge 8: Tidak ada edit form inline; edit via halaman baru lewat onEditProfile.
 */
export default function ProfilePage({ onReplaySplash, onEditProfile }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [avatar] = useState(profile.avatar || null)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')

  const { favorites } = useFavorites()

  // Challenge 5: Drafts
  const [draftIds, setDraftIds] = useState(() => getAllDraftIds())

  // Challenge 6: Archived guns
  const {
    archivedGuns,
    loading: archivedLoading,
    error: archivedError,
    refetch: refetchArchived,
  } = useArchivedGuns()
  const [restoringId, setRestoringId] = useState(null)

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Challenge 5: Delete draft
  const handleDeleteDraft = (id) => {
    deleteDraft(id)
    setDraftIds(getAllDraftIds())
  }

  // Challenge 6: Restore archived gun
  const handleRestore = async (id) => {
    try {
      setRestoringId(id)
      await gunService.restoreGun(id)
      refetchArchived()
      setFeedback('Item restored to catalog!')
      setTimeout(() => setFeedback(''), 3000)
    } catch (err) {
      setFeedback(err.message || 'Failed to restore item.')
      setTimeout(() => setFeedback(''), 3000)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <section
        className="masthead"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">Operator credentials, procurement statistics, and armorer details.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Challenge 8: Edit Profile button → goes to new page */}
          {onEditProfile && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onEditProfile}
              title="Edit profile details"
            >
              <Pencil size={14} /> Edit Profile
            </button>
          )}
          {onReplaySplash && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onReplaySplash}
              title="Replay introductory splash animation"
            >
              <Play size={14} /> Replay Intro
            </button>
          )}
        </div>
      </section>

      {feedback && (
        <div className="toast toast--success">
          <Check size={18} /> {feedback}
        </div>
      )}

      {/* Operator Card */}
      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {avatar ? (
              <img src={avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
          </div>

          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            {profile.bio && (
              <p style={{ margin: '4px 0 8px', color: 'var(--steel)', fontSize: '0.9rem' }}>
                {profile.bio}
              </p>
            )}
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={handleCopyId}
                title="Copy User ID to clipboard"
              >
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{draftIds.length}</div>
            <div className="stat-label">Saved Drafts</div>
          </div>
          <div className="stat-item">
            <Archive size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{archivedGuns.length}</div>
            <div className="stat-label">Archived</div>
          </div>
        </div>
      </div>

      {/* ── Challenge 5: Saved Drafts Section ── */}
      <section className="profile-section">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} /> Saved Drafts
        </h3>
        {draftIds.length === 0 ? (
          <p className="detail-empty">No saved drafts.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {draftIds.map((id) => {
              const draft = loadDraft(id)
              const draftName = draft?.name || draft?.title || `Draft (${id})`
              const savedAt = formatDraftTime(getDraftTimestamp(id))
              return (
                <li
                  key={id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'var(--surface, #fff)',
                    borderRadius: '6px',
                    border: '1px solid var(--line)',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{draftName}</div>
                    {savedAt && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--steel)' }}>
                        Saved {savedAt}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => handleDeleteDraft(id)}
                    title="Delete this draft"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ── Challenge 6: Archived Items Section ── */}
      <section className="profile-section">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Archive size={16} /> Archived Items
        </h3>

        {archivedLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--steel)' }}>
            <Loader size={16} className="spin" /> Loading archived items…
          </div>
        )}
        {!archivedLoading && archivedError && (
          <p className="form-error">{archivedError}</p>
        )}
        {!archivedLoading && !archivedError && archivedGuns.length === 0 && (
          <p className="detail-empty">No archived items.</p>
        )}
        {!archivedLoading && archivedGuns.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {archivedGuns.map((gun) => (
              <li
                key={gun.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  background: 'var(--surface, #fff)',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                }}
              >
                <img
                  src={gun.image_url || gun.image || '/guns/pistol.svg'}
                  alt={gun.name}
                  width={40}
                  height={40}
                  style={{ objectFit: 'contain', borderRadius: '4px' }}
                  loading="lazy"
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{gun.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--steel)' }}>
                    {gun.type || gun.category}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => handleRestore(gun.id)}
                  disabled={restoringId === gun.id}
                  title="Restore to catalog"
                >
                  {restoringId === gun.id ? (
                    <Loader size={14} className="spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  {restoringId === gun.id ? 'Restoring…' : 'Restore'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Challenge 4: About Section ── */}
      <section className="profile-section">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} /> About
        </h3>
        <h2 className="display" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
          A one-room armory.
        </h2>
        <p className="lede">
          Bore &amp; Barrel sells a short, honest list of firearms. Each piece is priced
          from the bench — no markup theatre, no filler.
        </p>
      </section>

      {/* ── Challenge 4: Contact Section ── */}
      <section className="profile-section">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} /> Contact
        </h3>
        <h2 className="display" style={{ fontSize: '1.4rem', marginBottom: '10px' }}>
          Come by the shop.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--steel)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> 123 Range Road
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Open Tuesday to Saturday, 10 to 6
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} /> (555) 010-0100
          </span>
        </div>
      </section>
    </div>
  )
}
