import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-unregister any active service worker so browser uses native disk cache
// This ensures Network tab displays (disk cache) instead of (ServiceWorker)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const r of registrations) {
      r.unregister()
    }
  })
  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const k of keys) {
        caches.delete(k)
      }
    })
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
