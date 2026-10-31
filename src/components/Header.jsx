import { Plus, ShoppingCart } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

// Challenge 4: About & Contact dipindah ke Profile, header hanya Catalog, Favorites, Profile
const NAV_ITEMS = [
  { id: 'Catalog', label: 'Catalog' },
  { id: 'Favorites', label: 'Favorites', hasBadge: true },
  { id: 'Profile', label: 'Profile' },
]

function Header({ tab, onTab, onNavigateCreate, onOpenCart, cartCount }) {
  const { favorites } = useFavorites()
  const favCount = favorites ? favorites.length : 0

  return (
    <header className="header">
      <div
        className="header-brand-wrap"
        onClick={() => onTab('Catalog')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <div className="header-logo-badge">
          <img src="/logo.png" alt="Bore & Barrel" />
        </div>
        <span className="brand display">Bore &amp; Barrel</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'nav-link active' : 'nav-link'}
            onClick={() => onTab(item.id)}
          >
            {item.label}
            {item.hasBadge && favCount > 0 && (
              <span className="nav-badge">{favCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Challenge 9: Cart button */}
        {onOpenCart && (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={onOpenCart}
            title="Open cart"
            style={{ position: 'relative' }}
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span
                className="nav-badge"
                style={{ position: 'absolute', top: '-6px', right: '-6px' }}
              >
                {cartCount}
              </span>
            )}
          </button>
        )}

        {onNavigateCreate && (
          <button
            type="button"
            className="btn btn--primary btn--sm header-cta"
            onClick={onNavigateCreate}
            title="Register new hardware"
          >
            <Plus size={15} /> Add Hardware
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
