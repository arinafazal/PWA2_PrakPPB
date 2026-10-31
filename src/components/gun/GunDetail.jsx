import { useState } from 'react'
import {
  ArrowLeft,
  Star,
  Send,
  Loader,
  Share2,
  Check,
  ShoppingCart,
  Archive,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash2,
} from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import {
  useReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useThumbsReview,
} from '../../hooks/useReviews'
import { getUserIdentifier } from '../../services/userService'
import { formatPrice, averageRating } from '../../utils/helpers'

// ---------------------------------------------------------------------------
// ReviewItem — single review card with edit, delete, thumbs up/down.
// ---------------------------------------------------------------------------
function ReviewItem({ rev, onDelete, onEdit }) {
  const { thumb, setThumbUp, setThumbDown } = useThumbsReview(rev.id)

  return (
    <li className="review-item">
      <div className="review-head">
        <span className="review-user">{rev.user_identifier || 'Anonymous'}</span>
        <span className="review-stars-display">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < rev.rating ? 'var(--brass)' : 'none'}
              stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
            />
          ))}
        </span>
      </div>
      {rev.comment && <p className="review-comment">{rev.comment}</p>}
      <div className="review-actions">
        {/* Thumbs */}
        <button
          type="button"
          className={`thumb-btn ${thumb === 'up' ? 'thumb-btn--active' : ''}`}
          onClick={setThumbUp}
          title="Helpful"
          aria-label="Thumbs up"
        >
          <ThumbsUp size={14} />
        </button>
        <button
          type="button"
          className={`thumb-btn ${thumb === 'down' ? 'thumb-btn--active' : ''}`}
          onClick={setThumbDown}
          title="Not helpful"
          aria-label="Thumbs down"
        >
          <ThumbsDown size={14} />
        </button>
        {/* Edit */}
        <button
          type="button"
          className="icon-btn"
          onClick={() => onEdit(rev)}
          title="Edit review"
          aria-label="Edit review"
        >
          <Pencil size={14} />
        </button>
        {/* Delete */}
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={() => onDelete(rev.id)}
          title="Delete review"
          aria-label="Delete review"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  )
}

// ---------------------------------------------------------------------------
// GunDetail — full-screen product detail view.
// ---------------------------------------------------------------------------

/**
 * @param {Object}   props
 * @param {Object}   props.gun          — product data
 * @param {Function} props.onBack       — return to catalog
 * @param {Function} [props.onEdit]     — navigate to edit page
 * @param {Function} [props.onDelete]   — trigger permanent delete flow
 * @param {Function} [props.onAddToCart]— add to cart
 */
export default function GunDetail({ gun, onBack, onEdit, onDelete, onAddToCart }) {
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  // Reviews
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(gun.id)
  const { createReview, loading: submitting } = useCreateReview()
  const { updateReview, loading: updating } = useUpdateReview()
  const { deleteReview, loading: deleting } = useDeleteReview()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  // Inline edit state
  const [editingReview, setEditingReview] = useState(null) // { id, rating, comment }
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')

  // Share state
  const [shareMsg, setShareMsg] = useState('')

  // Archive state
  const [archiving, setArchiving] = useState(false)

  // Cart toast
  const [cartAdded, setCartAdded] = useState(false)

  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length

  // ---- Handlers ----

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }

    const result = await createReview(gun.id, {
      user_identifier: getUserIdentifier(),
      rating,
      comment: comment.trim(),
    })

    if (result) {
      setReviewSuccess('Review submitted!')
      setComment('')
      setRating(5)
      refetchReviews()
    } else {
      setReviewError('Could not submit review. The server may be unavailable.')
    }
  }

  const handleEditReview = (rev) => {
    setEditingReview(rev)
    setEditRating(rev.rating)
    setEditComment(rev.comment || '')
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingReview) return
    const result = await updateReview(editingReview.id, {
      rating: editRating,
      comment: editComment.trim(),
    })
    if (result !== null) {
      setEditingReview(null)
      refetchReviews()
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    const ok = await deleteReview(reviewId)
    if (ok) refetchReviews()
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?gun=${gun.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: gun.name,
          text: gun.description || '',
          url: shareUrl,
        })
        setShareMsg('Shared!')
      } catch {
        setShareMsg('')
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setShareMsg('Link copied!')
      } catch {
        setShareMsg('Failed to copy link.')
      }
    }
    setTimeout(() => setShareMsg(''), 2500)
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(gun)
      setCartAdded(true)
      setTimeout(() => setCartAdded(false), 2000)
    }
  }

  return (
    <div className="detail">
      {/* Back button */}
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      {/* Share toast */}
      {shareMsg && (
        <div className="toast toast--success">
          <Check size={16} /> {shareMsg}
        </div>
      )}

      {/* Cart added toast */}
      {cartAdded && (
        <div className="toast toast--success">
          <ShoppingCart size={16} /> Ditambahkan ke keranjang!
        </div>
      )}

      {/* Hero */}
      <div className="detail-hero">
        <img className="detail-img" src={imgSrc} alt={gun.name} loading="lazy" />
        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? ` · ${caliber}` : ''}
          </p>
          <p className="price detail-price">{formatPrice(price)}</p>

          {avgRating > 0 && (
            <p className="detail-rating">
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          <div className="detail-actions">
            <FavoriteButton gunId={gun.id || gun.name} />

            {/* Add to Cart */}
            {onAddToCart && (
              <button
                type="button"
                className="btn btn--outline"
                onClick={handleAddToCart}
                title="Add to cart"
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
            )}

            {/* Share */}
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleShare}
              title="Share this item"
            >
              <Share2 size={16} /> Share
            </button>

            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}

            {/* Archive (soft delete) */}
            {onDelete && (
              <button
                type="button"
                className="btn btn--outline"
                disabled={archiving}
                onClick={async () => {
                  if (!window.confirm(`Archive "${gun.name}"?`)) return
                  try {
                    setArchiving(true)
                    const { default: gunService } = await import('../../services/gunService')
                    await gunService.archiveGun(gun.id)
                    onBack()
                  } finally {
                    setArchiving(false)
                  }
                }}
                title="Archive (soft delete)"
              >
                {archiving ? <Loader size={16} className="spin" /> : <Archive size={16} />} Archive
              </button>
            )}

            {/* Permanent delete */}
            {onDelete && (
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => onDelete(gun)}
                title="Permanently delete"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="detail-section">
        <h2>Description</h2>
        <p>{gun.description || 'No description available.'}</p>
      </section>

      {/* Specifications */}
      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Specifications</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {gun.steps && gun.steps.length > 0 && (
        <section className="detail-section">
          <h2>Assembly / Maintenance Steps</h2>
          <ol className="detail-steps">
            {gun.steps.map((step, i) => (
              <li key={step.id || i}>{step.instruction || step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Reviews Section */}
      <section className="detail-section">
        <h2>Reviews</h2>

        {/* Submit review */}
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  size={22}
                  fill={n <= rating ? 'var(--brass)' : 'none'}
                  stroke={n <= rating ? 'var(--brass)' : 'var(--steel)'}
                />
              </button>
            ))}
          </div>

          <textarea
            className="review-input"
            rows="3"
            placeholder="Write a short review (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <button type="submit" className="btn btn--primary" disabled={submitting || !gun.id}>
            {submitting ? (
              <><Loader size={16} className="spin" /> Submitting…</>
            ) : (
              <><Send size={16} /> Submit Review</>
            )}
          </button>

          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
          {!gun.id && (
            <p className="form-hint">
              Reviews require a server-generated product ID. This product is local-only.
            </p>
          )}
        </form>

        {/* Existing reviews */}
        {reviewsLoading ? (
          <p className="detail-loading">Loading reviews…</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((rev) =>
              editingReview?.id === rev.id ? (
                // Inline edit form
                <li key={rev.id} className="review-item review-item--editing">
                  <form onSubmit={handleSaveEdit}>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="star-btn"
                          onClick={() => setEditRating(n)}
                        >
                          <Star
                            size={20}
                            fill={n <= editRating ? 'var(--brass)' : 'none'}
                            stroke={n <= editRating ? 'var(--brass)' : 'var(--steel)'}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="review-input"
                      rows="2"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      maxLength={500}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button type="submit" className="btn btn--primary btn--sm" disabled={updating}>
                        {updating ? <Loader size={14} className="spin" /> : <Check size={14} />} Save
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setEditingReview(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <ReviewItem
                  key={rev.id}
                  rev={rev}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              ),
            )}
          </ul>
        ) : (
          <p className="detail-empty">No reviews yet. Be the first!</p>
        )}
      </section>
    </div>
  )
}
