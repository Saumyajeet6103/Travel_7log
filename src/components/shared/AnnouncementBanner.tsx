'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRealtime } from '@/hooks/useRealtime'
import { Megaphone, X, Pin, AlertTriangle, Info } from 'lucide-react'

interface Announcement {
  _id: string
  title: string
  body: string
  priority: 'normal' | 'urgent' | 'info'
  createdBy: string
  readBy: string[]
  pinned: boolean
  createdAt: string
}

const PRIORITY_STYLES = {
  urgent: {
    bg: 'bg-danger/10 border-danger/40',
    icon: <AlertTriangle size={14} className="text-danger" />,
    badge: 'text-danger',
  },
  normal: {
    bg: 'bg-primary/10 border-primary/40',
    icon: <Megaphone size={14} className="text-primary" />,
    badge: 'text-primary',
  },
  info: {
    bg: 'bg-info/10 border-info/40',
    icon: <Info size={14} className="text-info" />,
    badge: 'text-info',
  },
}

export default function AnnouncementBanner() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const memberName = user?.name ?? user?.username ?? ''

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements ?? [])
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])
  useRealtime(['announcement'], fetchAnnouncements)

  const dismiss = async (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a._id === id ? { ...a, readBy: [...a.readBy, memberName] } : a
      )
    )
    await fetch(`/api/announcements/${id}`, { method: 'PUT' })
  }

  // Show only unread announcements (or pinned ones)
  const visible = announcements.filter(
    (a) => a.pinned || !a.readBy.includes(memberName)
  )

  if (visible.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {visible.map((a) => {
        const style = PRIORITY_STYLES[a.priority]
        const isRead = a.readBy.includes(memberName)

        return (
          <div
            key={a._id}
            className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${style.bg} ${
              isRead ? 'opacity-60' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${style.badge}`}>{a.title}</p>
                {a.pinned && <Pin size={10} className="text-warning" />}
              </div>
              {a.body && (
                <p className="text-xs text-muted mt-0.5">{a.body}</p>
              )}
              <p className="text-[10px] text-muted/50 mt-1">
                {a.createdBy} · {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            {!a.pinned && !isRead && (
              <button
                onClick={() => dismiss(a._id)}
                className="flex-shrink-0 p-1 text-muted hover:text-foreground rounded transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
