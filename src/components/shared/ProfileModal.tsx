'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Lock, Eye, EyeOff, Shield, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
}

export default function ProfileModal({ onClose }: Props) {
  const { user, refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setEmail(data.user.email ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const saveEmail = async () => {
    setSavingEmail(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Email updated! 📧')
        await refresh()
      } else {
        toast.error(data.error ?? 'Failed')
      }
    } finally {
      setSavingEmail(false)
    }
  }

  const changePassword = async () => {
    if (!currentPassword) { toast.error('Current password daalo 🙏'); return }
    if (!newPassword) { toast.error('New password daalo 🙏'); return }
    if (newPassword.length < 6) { toast.error('Min 6 characters chahiye'); return }

    setSavingPass(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Password changed! 🔐')
        setCurrentPassword('')
        setNewPassword('')
        await refresh()
      } else {
        toast.error(data.error ?? 'Failed')
      }
    } finally {
      setSavingPass(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="bg-surface border border-subtle rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground">My Profile</h2>
              <p className="text-xs text-muted">@{user?.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-subtle text-muted hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={20} className="animate-spin text-muted" />
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-subtle/30 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-2xl">
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-heading font-bold text-lg text-foreground">{user?.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    user?.role === 'admin'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {user?.role === 'admin' && <Shield size={8} className="inline mr-0.5" />}
                    {user?.role}
                  </span>
                  <span className="text-xs text-muted">@{user?.username}</span>
                </div>
              </div>
            </div>

            {/* Email Section */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail size={14} className="text-primary" />
                Email
              </label>
              <p className="text-[10px] text-muted">Used for password reset OTPs</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2.5 bg-base border border-subtle rounded-xl text-foreground placeholder-muted/40 text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={saveEmail}
                  disabled={savingEmail}
                  className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-primary-fg font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {savingEmail ? '...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-subtle" />

            {/* Change Password */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lock size={14} className="text-warning" />
                Change Password
              </label>

              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-3 py-2.5 pr-10 bg-base border border-subtle rounded-xl text-foreground placeholder-muted/40 text-sm focus:outline-none focus:border-warning"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full px-3 py-2.5 pr-10 bg-base border border-subtle rounded-xl text-foreground placeholder-muted/40 text-sm focus:outline-none focus:border-warning"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <button
                onClick={changePassword}
                disabled={savingPass || !currentPassword || !newPassword}
                className="w-full py-2.5 bg-warning hover:bg-warning/80 text-primary-fg font-bold rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {savingPass ? 'Changing...' : 'Change Password 🔐'}
              </button>
            </div>

            {/* Forgot password hint */}
            <div className="p-3 bg-info/5 border border-info/20 rounded-xl">
              <p className="text-[10px] text-info">
                Forgot your current password? Ask the admin to reset it from the Admin Panel, or use &ldquo;Forgot Password&rdquo; on the login page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
