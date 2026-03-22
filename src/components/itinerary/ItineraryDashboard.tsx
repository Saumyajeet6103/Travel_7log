'use client'

import { useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRealtime } from '@/hooks/useRealtime'
import SpotCard, { SpotDoc } from './SpotCard'
import AddSpotModal from './AddSpotModal'
import { SpotStatus } from '@/lib/models/Spot'
import { Plus, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

const DONE_MESSAGES = [
  '🏆 NIKAL GAYE BHAI! One more conquered!',
  '🎉 Spot cleared! Badhiya hai!',
  '💪 Instagram story ready? Mark kar diya!',
  '🏔️ Explorer mode: ON. Keep going!',
  "📸 Did someone take a photo? They better have.",
  '✅ Done! Ek burden kam hua life se.',
  "🎯 Bullseye! That's how it's done!",
]

const DAYS_META: Record<string, { label: string; emoji: string; date: string }> = {
  'Day 1': { label: 'Day 1 — Arrive Matheran', emoji: '🏔️', date: 'Mar 26' },
  'Day 2': { label: 'Day 2 — Matheran',        emoji: '🌅', date: 'Mar 27' },
  'Day 3': { label: 'Day 3 — Last Day',         emoji: '🌄', date: 'Mar 28' },
  'Day 4': { label: 'Day 4 — Mumbai',            emoji: '🌆', date: 'Mar 29' },
}

type DayFilter    = 'All' | 'Day 1' | 'Day 2' | 'Day 3' | 'Day 4'
type StatusFilter = 'all' | SpotStatus

interface Props {
  initialSpots: SpotDoc[]
}

export default function ItineraryDashboard({ initialSpots }: Props) {
  const { isAdmin, user } = useAuth()
  const [spots,      setSpots]      = useState<SpotDoc[]>(initialSpots)
  const [dayFilter,  setDayFilter]  = useState<DayFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showAdd,    setShowAdd]    = useState(false)
  const [editing,    setEditing]    = useState<SpotDoc | null>(null)

  // Stats
  const totalSpots = spots.length
  const doneSpots  = spots.filter((s) => s.status === 'done').length
  const pct        = totalSpots > 0 ? Math.round((doneSpots / totalSpots) * 100) : 0

  // Filtered spots
  const filtered = useMemo(() => {
    return spots.filter((s) => {
      const dayOk    = dayFilter === 'All' || s.day === dayFilter
      const statusOk = statusFilter === 'all' || s.status === statusFilter
      return dayOk && statusOk
    })
  }, [spots, dayFilter, statusFilter])

  // Group by day for "All" view
  const grouped = useMemo(() => {
    if (dayFilter !== 'All') return { [dayFilter]: filtered }
    return filtered.reduce<Record<string, SpotDoc[]>>((acc, s) => {
      acc[s.day] = [...(acc[s.day] ?? []), s]
      return acc
    }, {})
  }, [filtered, dayFilter])

  const refreshSpots = useCallback(async () => {
    const res = await fetch('/api/spots')
    if (res.ok) { const d = await res.json(); setSpots(d.spots) }
  }, [])

  useRealtime(['spot'], refreshSpots)

  const fireConfetti = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 },
      colors: ['#52B788', '#F4A261', '#2D9CDB', '#9B5DE5', '#F15BB5'] })
  }, [])

  const handleStatus = async (id: string, status: SpotStatus) => {
    const res = await fetch(`/api/spots/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status, markedBy: user?.name }),
    })
    if (!res.ok) { toast.error('Update failed 😬'); return }

    const data = await res.json()
    setSpots((prev) => prev.map((s) => (s._id === id ? data.spot : s)))

    if (status === 'done') {
      fireConfetti()
      toast.success(DONE_MESSAGES[Math.floor(Math.random() * DONE_MESSAGES.length)], { duration: 4000 })
    } else if (status === 'skipped') {
      toast('Arre yaar... next time pakka 😅', { icon: '❌' })
    } else if (status === 'in-progress') {
      toast('🏃 On the way! Bhai chal diye!', { duration: 2500 })
    } else {
      toast('↩️ Reset to planned')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this spot? Pakka? 🗑️')) return
    const res = await fetch(`/api/spots/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSpots((prev) => prev.filter((s) => s._id !== id))
      toast.success('🗑️ Spot removed')
    }
  }

  const handleSaved = (spot: SpotDoc) => {
    setSpots((prev) => {
      const idx = prev.findIndex((s) => s._id === spot._id)
      if (idx >= 0) { const next = [...prev]; next[idx] = spot; return next }
      return [...prev, spot].sort((a, b) => {
        if (a.day !== b.day) return a.day.localeCompare(b.day)
        return a.order - b.order
      })
    })
  }

  const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all',         label: 'All' },
    { value: 'planned',     label: 'Planned' },
    { value: 'in-progress', label: 'Going 🏃' },
    { value: 'done',        label: 'Done ✅' },
    { value: 'skipped',     label: 'Skipped ❌' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading font-black text-2xl text-foreground">Itinerary 🗺️</h1>
          <p className="text-xs text-muted mt-0.5">Matheran + Mumbai ka plan</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowAdd(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-primary-fg font-heading font-bold rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> Add Spot
        </button>
      </div>

      {/* ── Progress ── */}
      <div className="bg-surface border border-subtle rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-warning" />
            <span className="text-sm font-medium text-foreground">
              {doneSpots}/{totalSpots} spots conquered
            </span>
          </div>
          <span className="font-heading font-bold text-primary text-sm">{pct}%</span>
        </div>
        <div className="h-2.5 bg-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-info rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-center text-xs text-primary mt-2 font-medium animate-bounce-in">
            🎉 Saare spots done! Legends!
          </p>
        )}
        {pct >= 50 && pct < 100 && (
          <p className="text-center text-xs text-muted mt-2 italic">
            Halfway through. Thoda aur baaki hai bhai!
          </p>
        )}
      </div>

      {/* ── Per-day mini progress ── */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {Object.entries(DAYS_META).map(([day, meta]) => {
          const daySpots  = spots.filter((s) => s.day === day)
          const dayDone   = daySpots.filter((s) => s.status === 'done').length
          const dayPct    = daySpots.length > 0 ? Math.round((dayDone / daySpots.length) * 100) : 0
          const isActive  = dayFilter === day
          return (
            <button
              key={day}
              onClick={() => setDayFilter(isActive ? 'All' : day as DayFilter)}
              className={`rounded-xl p-3 text-center border transition-all ${
                isActive
                  ? 'bg-info/20 border-info/60'
                  : 'bg-surface border-subtle hover:border-info/30'
              }`}
            >
              <p className="text-lg">{meta.emoji}</p>
              <p className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-info' : 'text-muted'}`}>
                {day}
              </p>
              <p className="text-[10px] text-muted">{meta.date}</p>
              <p className={`text-xs font-heading font-bold mt-1 ${dayPct === 100 ? 'text-primary' : 'text-foreground'}`}>
                {dayDone}/{daySpots.length}
              </p>
            </button>
          )
        })}
      </div>

      {/* ── Status filter ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              statusFilter === value
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-surface border-subtle text-muted hover:border-primary/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Spot list grouped by day ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-heading font-bold text-primary">Kuch nahi mila</p>
          <p className="text-xs text-muted mt-1">Try a different filter</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, daySpots]) => {
              const meta    = DAYS_META[day]
              const done    = daySpots.filter((s) => s.status === 'done').length
              return (
                <div key={day}>
                  {/* Day header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta?.emoji ?? '📍'}</span>
                      <div>
                        <p className="font-heading font-semibold text-sm text-foreground">{meta?.label ?? day}</p>
                        <p className="text-[10px] text-muted">{meta?.date ?? ''} · {done}/{daySpots.length} done</p>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-subtle" />
                  </div>

                  {/* Spots */}
                  <div className="space-y-2">
                    {daySpots.map((spot) => (
                      <SpotCard
                        key={spot._id}
                        spot={spot}
                        isAdmin={isAdmin}
                        currentUser={user?.name ?? user?.username ?? ''}
                        onStatus={handleStatus}
                        onEdit={(s) => { setEditing(s); setShowAdd(true) }}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <AddSpotModal
          editing={editing}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
