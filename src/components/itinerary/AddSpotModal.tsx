'use client'

import { useState, useEffect, FormEvent } from 'react'
import { X } from 'lucide-react'
import { SpotDoc } from './SpotCard'
import { SPOT_TYPES } from '@/lib/utils'
import toast from 'react-hot-toast'

const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4']

interface Props {
  editing?: SpotDoc | null
  onClose:  () => void
  onSaved:  (spot: SpotDoc) => void
}

const EMPTY = {
  name: '', description: '', type: 'activity',
  day: 'Day 1', scheduledTime: '', funFact: '', order: 0,
}

export default function AddSpotModal({ editing, onClose, onSaved }: Props) {
  const [form, setForm]     = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editing) {
      setForm({
        name:          editing.name,
        description:   editing.description,
        type:          editing.type,
        day:           editing.day,
        scheduledTime: editing.scheduledTime,
        funFact:       editing.funFact,
        order:         editing.order,
      })
    } else {
      setForm(EMPTY)
    }
  }, [editing])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Spot ka naam daalo 📍'); return }

    setLoading(true)
    try {
      const url    = editing ? `/api/spots/${editing._id}` : '/api/spots'
      const method = editing ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Error hua'); return }
      toast.success(editing ? '✏️ Spot updated!' : '📍 Spot added!')
      onSaved(data.spot)
      onClose()
    } catch {
      toast.error('Network error 📶')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-[#16213E] border border-[#0F3460] rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#16213E] border-b border-[#0F3460] px-5 py-4 flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-[#E8F5E9]">
            {editing ? '✏️ Edit Spot' : '📍 Add Spot'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#0F3460] text-[#A0AEC0]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#A0AEC0] mb-1.5">Spot Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Echo Point"
              className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/40 focus:outline-none focus:border-[#52B788] text-sm"
            />
          </div>

          {/* Type + Day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A0AEC0] mb-1.5">Type</label>
              <div className="flex gap-1.5 flex-wrap">
                {SPOT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                      form.type === t.value
                        ? 'bg-[#52B788]/20 border-[#52B788]/60 text-[#52B788]'
                        : 'bg-[#1A1A2E] border-[#0F3460] text-[#A0AEC0]'
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A0AEC0] mb-1.5">Day</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({ ...form, day: d })}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                      form.day === d
                        ? 'bg-[#2D9CDB]/20 border-[#2D9CDB]/60 text-[#2D9CDB]'
                        : 'bg-[#1A1A2E] border-[#0F3460] text-[#A0AEC0]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time + Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A0AEC0] mb-1.5">Scheduled Time</label>
              <input
                value={form.scheduledTime}
                onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                placeholder="e.g. 5:30 AM"
                className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/40 focus:outline-none focus:border-[#52B788] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A0AEC0] mb-1.5">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] focus:outline-none focus:border-[#52B788] text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#A0AEC0] mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Short description..."
              className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/40 focus:outline-none focus:border-[#52B788] text-sm resize-none"
            />
          </div>

          {/* Fun fact */}
          <div>
            <label className="block text-xs font-medium text-[#A0AEC0] mb-1.5">💡 Fun Fact (optional)</label>
            <textarea
              value={form.funFact}
              onChange={(e) => setForm({ ...form, funFact: e.target.value })}
              rows={2}
              placeholder="Something funny or interesting about this spot..."
              className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/40 focus:outline-none focus:border-[#52B788] text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-heading font-bold rounded-xl transition-all disabled:opacity-60 text-sm"
          >
            {loading ? 'Saving...' : editing ? 'Update Spot ✅' : 'Add Spot 📍'}
          </button>
        </form>
      </div>
    </div>
  )
}
