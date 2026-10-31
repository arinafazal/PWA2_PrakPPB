import { useState, useCallback } from 'react'
import { formatPrice } from '../utils/helpers'

// ---------------------------------------------------------------------------
// useCart — shopping cart state backed by localStorage.
// ---------------------------------------------------------------------------

const CART_KEY = 'bore_barrel_cart'
const WA_NUMBER = '6285795457137' // Nomor WA pribadi untuk checkout

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch {
    return []
  }
}

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {}
}

export function useCart() {
  const [items, setItems] = useState(loadCart)

  const addToCart = useCallback((gun) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === gun.id)
      const next = existing
        ? prev.map((i) => (i.id === gun.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...gun, qty: 1 }]
      saveCart(next)
      return next
    })
  }, [])

  const removeFromCart = useCallback((gunId) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== gunId)
      saveCart(next)
      return next
    })
  }, [])

  const updateQty = useCallback((gunId, qty) => {
    if (qty < 1) return
    setItems((prev) => {
      const next = prev.map((i) => (i.id === gunId ? { ...i, qty } : i))
      saveCart(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    saveCart([])
    setItems([])
  }, [])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = items.reduce((s, i) => s + Number(i.price || 0) * i.qty, 0)

  const checkoutToWhatsApp = useCallback(() => {
    if (items.length === 0) return
    const lines = items
      .map((i) => `- ${i.name} x${i.qty} (${formatPrice(Number(i.price || 0) * i.qty)})`)
      .join('%0A')
    const total = `Total: ${formatPrice(totalPrice)}`
    const message = `Hi aku mau pesan ....%0A%0A${lines}%0A%0A${total}`
    window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank')
  }, [items, totalPrice])

  return {
    items,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
    checkoutToWhatsApp,
  }
}
