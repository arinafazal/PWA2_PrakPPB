import { useState, lazy, Suspense } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartPanel from './components/CartPanel.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import { useCart } from './hooks/useCart.js'
import gunService from './services/gunService.js'
import './App.css'

// ── Challenge 2: Lazy Load — pages loaded on demand ──
const Catalog        = lazy(() => import('./pages/Catalog.jsx'))
const FavoritesPage  = lazy(() => import('./pages/FavoritesPage.jsx'))
const ProfilePage    = lazy(() => import('./pages/ProfilePage.jsx'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage.jsx'))
const CreateGunPage  = lazy(() => import('./pages/CreateGunPage.jsx'))
const EditGunPage    = lazy(() => import('./pages/EditGunPage.jsx'))
const GunDetail      = lazy(() => import('./components/gun/GunDetail.jsx'))

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  // ── mode: 'list' | 'create' | 'edit' | 'detail' | 'editProfile' ──
  const [mode, setMode] = useState('list')
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── Challenge 9: Cart ──
  const cart = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  // Unified navigation handler
  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Detail') {
      setSelectedGun(payload)
      setMode('detail')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setTab(target)
      setMode('list')
      setSelectedGun(null)
      setEditingGun(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedGun(null)
    setEditingGun(null)
  }

  return (
    <div className="shell">
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
        onOpenCart={() => setCartOpen(true)}
        cartCount={cart.totalItems}
      />

      {/* Challenge 2: Suspense wraps all lazy-loaded pages */}
      <main className="main">
        <Suspense fallback={<div className="state-box"><span>Loading…</span></div>}>

          {mode === 'create' && (
            <CreateGunPage
              onBack={handleBackToList}
              onSuccess={() => { handleBackToList(); setTab('Catalog') }}
            />
          )}

          {mode === 'edit' && (
            <EditGunPage
              gun={editingGun}
              gunId={editingGun?.id}
              onBack={handleBackToList}
              onSuccess={() => { handleBackToList(); setTab('Catalog') }}
            />
          )}

          {mode === 'detail' && selectedGun && (
            <GunDetail
              gun={selectedGun}
              onBack={handleBackToList}
              onEdit={(g) => handleNavigate('Edit', g)}
              onDelete={(g) => setDeleteTarget(g)}
              onAddToCart={cart.addToCart}
            />
          )}

          {/* Challenge 8: Edit profile on its own page */}
          {mode === 'editProfile' && (
            <EditProfilePage
              onBack={() => { setMode('list'); setTab('Profile') }}
            />
          )}

          {/* Top-level Tabs */}
          {mode === 'list' && (
            <>
              {tab === 'Catalog' && (
                <Catalog
                  onNavigate={(destination, payload) => handleNavigate(destination, payload)}
                  onAddToCart={cart.addToCart}
                />
              )}
              {tab === 'Favorites' && (
                <FavoritesPage
                  onSelectGun={(g) => handleNavigate('Detail', g)}
                  onNavigateCatalog={() => setTab('Catalog')}
                />
              )}
              {/* Challenge 4: About & Contact are now sections inside Profile */}
              {tab === 'Profile' && (
                <ProfilePage
                  onReplaySplash={() => setShowSplash(true)}
                  onEditProfile={() => { setMode('editProfile'); window.scrollTo({ top: 0 }) }}
                />
              )}
            </>
          )}

        </Suspense>
      </main>

      {/* Challenge 9: Cart Panel */}
      {cartOpen && (
        <CartPanel cart={cart} onClose={() => setCartOpen(false)} />
      )}

      {/* Global Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Hardware Record"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            setDeleting(true)
            await gunService.deleteGun(deleteTarget.id)
            setDeleteTarget(null)
            handleBackToList()
            setTab('Catalog')
          } catch (err) {
            alert(err.message || 'Failed to delete record.')
          } finally {
            setDeleting(false)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App
