'use client'

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Download, Bell, BellOff, X, Smartphone, Monitor, Apple, Chrome } from 'lucide-react'
import toast from 'react-hot-toast'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallGuide({ onClose }: { onClose: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe } = usePushNotifications()

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true
    setIsInstalled(isStandalone)

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
      toast.success('🎉 App installed!')
    }
    setDeferredPrompt(null)
  }

  const handleNotificationToggle = async () => {
    if (isSubscribed) {
      await unsubscribe()
      toast.success('🔕 Notifications off')
    } else {
      const ok = await subscribe()
      if (ok) toast.success('🔔 Notifications enabled!')
      else if (permission === 'denied') toast.error('Notifications blocked. Enable in browser settings.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full md:max-w-lg bg-surface border border-subtle rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-subtle px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
            <Download size={18} className="text-primary" /> Install 7 Log
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-subtle text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            isInstalled
              ? 'bg-primary/10 border-primary/30'
              : 'bg-warning/10 border-warning/30'
          }`}>
            <Smartphone size={18} className={isInstalled ? 'text-primary' : 'text-warning'} />
            <div>
              <p className={`text-sm font-bold ${isInstalled ? 'text-primary' : 'text-warning'}`}>
                {isInstalled ? 'App Installed ✅' : 'Not Installed Yet'}
              </p>
              <p className="text-[10px] text-muted">
                {isInstalled ? 'You\'re using the app version!' : 'Install for the best experience'}
              </p>
            </div>
          </div>

          {/* Quick install button (Chrome/Edge) */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstall}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-fg font-heading font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              <Download size={16} /> Install Now (One Tap)
            </button>
          )}

          {/* Notification toggle */}
          {isSupported && (
            <div className="bg-surface border border-subtle rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSubscribed ? (
                    <Bell size={18} className="text-primary" />
                  ) : (
                    <BellOff size={18} className="text-muted" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-foreground">Push Notifications</p>
                    <p className="text-[10px] text-muted">
                      {isSubscribed
                        ? 'You\'ll get notified for announcements'
                        : permission === 'denied'
                          ? 'Blocked — enable in browser settings'
                          : 'Get notified when admin posts updates'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  disabled={loading || permission === 'denied'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSubscribed
                      ? 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20'
                      : 'bg-primary text-primary-fg hover:bg-primary-dark'
                  } disabled:opacity-50`}
                >
                  {loading ? '...' : isSubscribed ? 'Turn Off' : 'Enable'}
                </button>
              </div>
            </div>
          )}

          {/* Install guides */}
          <div className="space-y-4">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">How to Install</p>

            {/* Android / Chrome */}
            <div className="bg-base border border-subtle rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Chrome size={16} className="text-info" />
                <p className="text-sm font-bold text-foreground">Android (Chrome)</p>
              </div>
              <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
                <li>Open the site in <span className="text-foreground font-medium">Chrome</span></li>
                <li>Tap the <span className="text-foreground font-medium">three dots ⋮</span> menu (top right)</li>
                <li>Tap <span className="text-primary font-medium">&quot;Install app&quot;</span> or &quot;Add to Home screen&quot;</li>
                <li>Tap <span className="text-foreground font-medium">Install</span> — done! 🎉</li>
              </ol>
            </div>

            {/* iOS / Safari */}
            <div className="bg-base border border-subtle rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Apple size={16} className="text-foreground" />
                <p className="text-sm font-bold text-foreground">iPhone / iPad (Safari)</p>
              </div>
              <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
                <li>Open the site in <span className="text-foreground font-medium">Safari</span> (not Chrome!)</li>
                <li>Tap the <span className="text-foreground font-medium">Share button</span> (box with arrow ↑)</li>
                <li>Scroll down and tap <span className="text-primary font-medium">&quot;Add to Home Screen&quot;</span></li>
                <li>Tap <span className="text-foreground font-medium">Add</span> — done! 🎉</li>
              </ol>
              <p className="text-[10px] text-warning mt-1">
                ⚠️ Push notifications on iOS require iOS 16.4+ and the app must be added to Home Screen.
              </p>
            </div>

            {/* Desktop */}
            <div className="bg-base border border-subtle rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-purple" />
                <p className="text-sm font-bold text-foreground">Desktop (Chrome / Edge)</p>
              </div>
              <ol className="text-xs text-muted space-y-1.5 list-decimal list-inside">
                <li>Look for the <span className="text-primary font-medium">install icon</span> in the address bar (⊕)</li>
                <li>Click it and confirm <span className="text-foreground font-medium">Install</span></li>
                <li>Or: three dots menu → <span className="text-primary font-medium">&quot;Install 7 Log&quot;</span></li>
              </ol>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-muted/50 text-center">
            Installing as PWA gives you: app icon, full screen mode, offline access, and push notifications 🔔
          </p>
        </div>
      </div>
    </div>
  )
}
