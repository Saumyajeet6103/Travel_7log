'use client'

import { useEffect } from 'react'

// Store the deferred install prompt globally so PWAInstallGuide can use it
declare global {
  interface Window {
    __pwaInstallPrompt?: Event | null
  }
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] Registered:', reg.scope)
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err)
        })
    }

    // Capture beforeinstallprompt globally (fires before any modal opens)
    const handler = (e: Event) => {
      e.preventDefault()
      window.__pwaInstallPrompt = e
      console.log('[PWA] Install prompt captured')
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return null
}
