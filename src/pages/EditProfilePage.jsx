import { useState } from 'react'
import { ArrowLeft, Camera, Save, Shield } from 'lucide-react'
import userService from '../services/userService'

/**
 * EditProfilePage — Standalone page to edit username, bio, and avatar (Challenge 8).
 *
 * @param {Object}   props
 * @param {Function} props.onBack — called when user finishes or cancels
 */
export default function EditProfilePage({ onBack }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(profile.username || 'Shooter')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar image must be under 2MB.')
      setTimeout(() => setError(''), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatar(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const updated = {
      ...profile,
      username: username.trim() || 'Shooter',
      bio: bio.trim(),
      avatar,
    }

    const result = userService.saveUserProfile(updated)
    if (result.success) {
      setFeedback('Profile successfully updated!')
      setTimeout(() => {
        onBack()
      }, 700)
    } else {
      setError('Failed to save profile.')
    }
  }

  return (
    <div className="profile-page">
      {/* Header row */}
      <div className="form-head">
        <button
          type="button"
          className="detail-back"
          onClick={onBack}
          title="Back to profile"
        >
          <ArrowLeft size={18} /> Back to Profile
        </button>
      </div>

      <div className="form-title-group">
        <h1 className="display">Edit Operator Profile</h1>
        <p className="lede">Update your callsign, armory bio, and avatar identification.</p>
      </div>

      {feedback && <div className="toast toast--success">{feedback}</div>}
      {error && <div className="toast toast--error">{error}</div>}

      {/* Avatar upload */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <div className="avatar-wrap">
          {avatar ? (
            <img src={avatar} alt={username} className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">
              <Shield size={36} stroke="var(--brass)" />
            </div>
          )}
          <label htmlFor="edit-avatar-input" className="avatar-upload-btn" title="Upload avatar">
            <Camera size={14} />
            <input
              id="edit-avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden-file-input"
            />
          </label>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="profile-form">
        <h3 className="section-title">Operator Identity</h3>

        <div className="form-group">
          <label htmlFor="edit-name" className="form-label">
            Callsign / Operator Alias
          </label>
          <input
            id="edit-name"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Operator Delta, Master Gunsmith"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-bio" className="form-label">
            Armory Notes / Station Bio
          </label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Qualifications, preferred calibers, unit assignment..."
            rows={4}
            className="form-textarea"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button type="submit" className="btn btn--primary">
            <Save size={16} /> Save Changes
          </button>
          <button type="button" className="btn btn--outline" onClick={onBack}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
