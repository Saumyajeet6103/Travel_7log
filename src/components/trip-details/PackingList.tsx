'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckSquare, Square, Plus, Trash2, Package } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRealtime } from '@/hooks/useRealtime'
import toast from 'react-hot-toast'

interface PackingItem {
  _id: string
  label: string
  category: string
  checkedBy: string[]
  isGlobal: boolean
  addedBy: string
}

const CATEGORY_EMOJIS: Record<string, string> = {
  clothes:   '👕',
  toiletries:'🧴',
  docs:      '📄',
  meds:      '💊',
  tech:      '🔌',
  food:      '🍫',
  misc:      '🎒',
}

const CATEGORIES = Object.keys(CATEGORY_EMOJIS)

export default function PackingList() {
  const { user, isAdmin } = useAuth()
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState('misc')
  const [isGlobal, setIsGlobal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const memberName = user?.name ?? user?.username ?? ''

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/packing')
      const data = await res.json()
      setItems(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  useRealtime(['packing'], fetchItems)

  const toggle = async (item: PackingItem) => {
    const checked = !item.checkedBy.includes(memberName)
    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i._id === item._id
          ? {
              ...i,
              checkedBy: checked
                ? [...i.checkedBy, memberName]
                : i.checkedBy.filter((n) => n !== memberName),
            }
          : i
      )
    )
    const res = await fetch(`/api/packing/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked }),
    })
    if (!res.ok) {
      fetchItems() // revert on failure
      toast.error('Toggle failed')
    }
  }

  const addItem = async () => {
    if (!newLabel.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/packing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel.trim(), category: newCategory, isGlobal }),
      })
      const data = await res.json()
      if (res.ok) {
        setItems((prev) => [...prev, data.item])
        setNewLabel('')
        setShowAdd(false)
        toast.success('📦 Item added!')
      }
    } finally {
      setAdding(false)
    }
  }

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id))
    const res = await fetch(`/api/packing/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      fetchItems()
      toast.error('Delete failed')
    } else {
      toast.success('🗑️ Item removed')
    }
  }

  const grouped = CATEGORIES.reduce<Record<string, PackingItem[]>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  const totalChecked = items.filter((i) => i.checkedBy.includes(memberName)).length
  const progress = items.length ? Math.round((totalChecked / items.length) * 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#52B788] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header + progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-[#52B788]" />
          <h3 className="font-heading font-bold text-[#E8F5E9]">Packing Checklist</h3>
          <span className="text-xs text-[#A0AEC0] bg-[#0F3460] px-2 py-0.5 rounded-full">
            {totalChecked}/{items.length} packed
          </span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#52B788]/10 border border-[#52B788]/30 rounded-lg text-[#52B788] text-xs hover:bg-[#52B788]/20 transition-all"
        >
          <Plus size={12} /> Add Item
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full h-2 bg-[#0F3460] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#52B788] to-[#2D9CDB] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-[#A0AEC0] mt-1">
          {progress}% packed {progress === 100 ? '🎉 Ready to roll!' : progress >= 50 ? '— almost there!' : '— get packing bhai!'}
        </p>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#16213E] border border-[#0F3460] rounded-xl p-4 space-y-3 animate-fade-in">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="What to pack? e.g. Sunscreen"
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className="w-full px-3 py-2 bg-[#1A1A2E] border border-[#0F3460] rounded-lg text-[#E8F5E9] placeholder-[#A0AEC0]/40 focus:outline-none focus:border-[#52B788] text-sm"
          />
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#1A1A2E] border border-[#0F3460] rounded-lg text-[#E8F5E9] text-sm focus:outline-none focus:border-[#52B788]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            {isAdmin && (
              <label className="flex items-center gap-1.5 px-3 py-2 bg-[#0F3460] rounded-lg cursor-pointer text-xs text-[#A0AEC0]">
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                  className="accent-[#52B788]"
                />
                Group item
              </label>
            )}
            <button
              onClick={addItem}
              disabled={adding || !newLabel.trim()}
              className="px-4 py-2 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-bold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Category groups */}
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat}>
          <p className="text-xs font-medium text-[#A0AEC0] uppercase tracking-wide mb-2 flex items-center gap-1.5">
            {CATEGORY_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            <span className="text-[#0F3460] font-normal normal-case tracking-normal">
              · {catItems.filter((i) => i.checkedBy.includes(memberName)).length}/{catItems.length}
            </span>
          </p>
          <div className="space-y-1.5">
            {catItems.map((item) => {
              const myChecked = item.checkedBy.includes(memberName)
              const canDelete = isAdmin || item.addedBy === memberName
              return (
                <div
                  key={item._id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                    myChecked
                      ? 'bg-[#52B788]/10 border-[#52B788]/30'
                      : 'bg-[#16213E] border-[#0F3460]'
                  }`}
                >
                  <button onClick={() => toggle(item)} className="flex-shrink-0">
                    {myChecked
                      ? <CheckSquare size={16} className="text-[#52B788]" />
                      : <Square size={16} className="text-[#A0AEC0]" />
                    }
                  </button>
                  <span className={`flex-1 text-sm ${myChecked ? 'line-through text-[#A0AEC0]' : 'text-[#E8F5E9]'}`}>
                    {item.label}
                  </span>
                  {item.checkedBy.length > 0 && (
                    <span className="text-[10px] text-[#A0AEC0] bg-[#0F3460] px-2 py-0.5 rounded-full">
                      {item.checkedBy.length} packed
                    </span>
                  )}
                  {item.isGlobal && (
                    <span className="text-[10px] text-[#2D9CDB] bg-[#2D9CDB]/10 px-2 py-0.5 rounded-full">group</span>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="p-1 text-[#A0AEC0] hover:text-[#E63946] rounded transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-10 text-[#A0AEC0]">
          <p className="text-4xl mb-3">🎒</p>
          <p className="text-sm">Nothing to pack yet. Add items above!</p>
        </div>
      )}
    </div>
  )
}
