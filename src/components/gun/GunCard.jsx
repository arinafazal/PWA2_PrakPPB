import FavoriteButton from '../common/FavoriteButton'
import { formatPrice, truncate } from '../../utils/helpers'
import { Share2, ShoppingCart } from 'lucide-react'

/**
 * Product card used in the catalog grid.
 *
 * @param {Object}   props
 * @param {Object}   props.gun          — product data
 * @param {Function} props.onSelect     — called with the gun when clicked
 * @param {Function} [props.onEdit]     — called when Edit is clicked
 * @param {Function} [props.onDelete]   — called when Delete is clicked
 * @param {Function} [props.onAddToCart]— called when Add to Cart is clicked
 */
export default function GunCard({ gun, onSelect, onEdit, onDelete, onAddToCart }) {
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  const handleShare = async (e) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}${window.location.pathname}?gun=${gun.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: gun.name, text: gun.description || '', url: shareUrl })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
      } catch {}
    }
  }

  return (
    <li className="card">
      <button
        type="button"
        className="card-btn"
        onClick={() => onSelect(gun)}
        aria-label={`View ${gun.name}`}
      >
        <img
          className="card-img"
          src={imgSrc}
          alt={gun.name}
          width="240"
          height="180"
          loading="lazy"
        />

        <span className="name display">{gun.name}</span>

        <span className="type">
          {category}
          {caliber ? ` · ${caliber}` : ''}
        </span>

        {gun.description && (
          <span className="card-desc">{truncate(gun.description, 72)}</span>
        )}

        <span className="price">{formatPrice(price)}</span>
      </button>

      {/* Floating actions row */}
      <div className="card-actions">
        <FavoriteButton gunId={gun.id || gun.name} />

        {/* Add to Cart */}
        {onAddToCart && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onAddToCart(gun) }}
            aria-label={`Add ${gun.name} to cart`}
            title="Add to Cart"
          >
            <ShoppingCart size={14} />
          </button>
        )}

        {/* Share */}
        <button
          type="button"
          className="card-act-btn"
          onClick={handleShare}
          aria-label={`Share ${gun.name}`}
          title="Share"
        >
          <Share2 size={14} />
        </button>

        {onEdit && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(gun) }}
            aria-label={`Edit ${gun.name}`}
            title="Edit"
          >
            ✏️
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="card-act-btn card-act-btn--danger"
            onClick={(e) => { e.stopPropagation(); onDelete(gun) }}
            aria-label={`Delete ${gun.name}`}
            title="Delete"
          >
            🗑️
          </button>
        )}
      </div>
    </li>
  )
}
