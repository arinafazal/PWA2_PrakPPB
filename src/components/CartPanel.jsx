import { ShoppingCart, X, Trash2, Plus, Minus, MessageCircle } from 'lucide-react'
import { formatPrice } from '../utils/helpers'

/**
 * CartPanel — sliding side panel showing cart items.
 * Props: cart (useCart instance), onClose
 */
export default function CartPanel({ cart, onClose }) {
  const { items, removeFromCart, updateQty, clearCart, totalItems, totalPrice, checkoutToWhatsApp } = cart

  return (
    <>
      {/* Backdrop */}
      <div
        className="cart-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="cart-panel">
        {/* Header */}
        <div className="cart-panel-head">
          <span className="cart-panel-title">
            <ShoppingCart size={20} /> Keranjang ({totalItems})
          </span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-panel-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={40} stroke="var(--steel)" />
              <p>Keranjang kosong.</p>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <img
                    className="cart-item-img"
                    src={item.image_url || item.image || '/guns/pistol.svg'}
                    alt={item.name}
                    width={56}
                    height={42}
                    loading="lazy"
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                  </div>
                  <div className="cart-item-qty">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      disabled={item.qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-val">{item.qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="icon-btn cart-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name}`}
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-panel-foot">
            <div className="cart-total">
              <span>Total</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              style={{ width: '100%' }}
              onClick={checkoutToWhatsApp}
            >
              <MessageCircle size={16} /> Checkout via WhatsApp
            </button>
            <button
              type="button"
              className="btn btn--outline"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={clearCart}
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
