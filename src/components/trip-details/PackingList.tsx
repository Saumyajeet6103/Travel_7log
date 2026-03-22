'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckSquare, Square, Plus, Trash2, Package, User, Users } from 'lucide-react'
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

type PackTab = 'personal' | 'common'

export default function PackingList() {
  const { user, isAdmin } = useAuth()
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [packTab, setPackTab] = useState<PackTab>('personal')
  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState('misc')
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
      fetchItems()
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
        body: JSON.stringify({
          label: newLabel.trim(),
          category: newCategory,
          isGlobal: packTab === 'common',
        }),
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

  const visibleItems = items.filter((i) =>
    packTab === 'common' ? i.isGlobal : (!i.isGlobal && i.addedBy === memberName)
  )

  const grouped = CATEGORIES.reduce<Record<string, PackingItem[]>>((acc, cat) => {
    const catItems = visibleItems.filter((i) => i.category === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  // Personal progress: my items only (personal items I added)
  const personalItems = items.filter((i) => !i.isGlobal && i.addedBy === memberName)
  const myCheckedPersonal = personalItems.filter((i) => i.checkedBy.includes(memberName)).length
  const personalProgress = personalItems.length
    ? Math.round((myCheckedPersonal / personalItems.length) * 100)
    : 0

  // Common progress: items where at least one person confirmed
  const commonItems = items.filter((i) => i.isGlobal)
  const commonConfirmed = commonItems.filter((i) => i.checkedBy.length > 0).length
  const commonProgress = commonItems.length
    ? Math.round((commonConfirmed / commonItems.length) * 100)
    : 0

  const canAddCommon = isAdmin

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-primary" />
          <h3 className="font-heading font-bold text-foreground">Packing Checklist</h3>
        </div>
        {(packTab === 'personal' || canAddCommon) && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-primary text-xs hover:bg-primary/20 transition-all"
          >
            <Plus size={12} /> Add Item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setPackTab('personal'); setShowAdd(false) }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            packTab === 'personal'
              ? 'bg-primary text-primary-fg font-bold'
              : 'bg-surface border border-subtle text-muted hover:text-foreground hover:border-primary/40'
          }`}
        >
          <User size={13} /> Personal
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
            packTab === 'personal' ? 'bg-primary-fg/20 text-primary-fg' : 'bg-subtle text-muted'
          }`}>
            {myCheckedPersonal}/{personalItems.length}
          </span>
        </button>
        <button
          onClick={() => { setPackTab('common'); setShowAdd(false) }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            packTab === 'common'
              ? 'bg-info text-white font-bold'
              : 'bg-surface border border-subtle text-muted hover:text-foreground hover:border-info/40'
          }`}
        >
          <Users size={13} /> Common
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
            packTab === 'common' ? 'bg-white/20 text-white' : 'bg-subtle text-muted'
          }`}>
            {commonConfirmed}/{commonItems.length}
          </span>
        </button>
      </div>

      {/* Progress bar */}
      {packTab === 'personal' ? (
        <div>
          <div className="w-full h-2 bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-info rounded-full transition-all duration-500"
              style={{ width: `${personalProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted mt-1">
            {personalProgress}% packed{' '}
            {personalProgress === 100 ? '🎉 Ready to roll!' : personalProgress >= 50 ? '— almost there!' : '— get packing bhai!'}
          </p>
        </div>
      ) : (
        <div>
          <div className="w-full h-2 bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-info to-purple rounded-full transition-all duration-500"
              style={{ width: `${commonProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted mt-1">
            {commonProgress}% confirmed — group essentials
          </p>
        </div>
      )}

      {/* Add form */}
      {showAdd && (packTab === 'personal' || canAddCommon) && (
        <div className="bg-surface border border-subtle rounded-xl p-4 space-y-3 animate-fade-in">
          <p className="text-xs text-muted font-medium">
            Adding to <span className={`font-bold ${packTab === 'common' ? 'text-info' : 'text-primary'}`}>
              {packTab === 'personal' ? '👤 Personal' : '👥 Common'}
            </span> list
          </p>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={packTab === 'personal' ? 'e.g. Sunscreen, Charger…' : 'e.g. First aid kit, Camera…'}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
          />
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 bg-base border border-subtle rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={addItem}
              disabled={adding || !newLabel.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-fg font-bold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Category groups */}
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat}>
          <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
            {CATEGORY_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            <span className="text-subtle font-normal normal-case tracking-normal">
              {packTab === 'personal'
                ? `· ${catItems.filter((i) => i.checkedBy.includes(memberName)).length}/${catItems.length}`
                : `· ${catItems.filter((i) => i.checkedBy.length > 0).length}/${catItems.length} confirmed`
              }
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
                      ? packTab === 'common'
                        ? 'bg-info/10 border-info/30'
                        : 'bg-primary/10 border-primary/30'
                      : 'bg-surface border-subtle'
                  }`}
                >
                  <button onClick={() => toggle(item)} className="flex-shrink-0">
                    {myChecked
                      ? <CheckSquare size={16} className={packTab === 'common' ? 'text-info' : 'text-primary'} />
                      : <Square size={16} className="text-muted" />
                    }
                  </button>
                  <span className={`flex-1 text-sm ${myChecked ? 'line-through text-muted' : 'text-foreground'}`}>
                    {item.label}
                  </span>
                  {packTab === 'personal' ? (
                    item.checkedBy.length > 1 && (
                      <span className="text-[10px] text-muted bg-subtle px-2 py-0.5 rounded-full">
                        {item.checkedBy.length} packed
                      </span>
                    )
                  ) : (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.checkedBy.length > 0
                        ? 'text-info bg-info/10'
                        : 'text-muted bg-subtle'
                    }`}>
                      {item.checkedBy.length > 0
                        ? item.checkedBy.length === 1
                          ? `✓ ${item.checkedBy[0]}`
                          : `✓ ${item.checkedBy.length} confirmed`
                        : 'not assigned'}
                    </span>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="p-1 text-muted hover:text-danger rounded transition-colors"
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

      {visibleItems.length === 0 && (
        <div className="text-center py-10 text-muted">
          <p className="text-4xl mb-3">{packTab === 'common' ? '👥' : '🎒'}</p>
          <p className="text-sm">
            {packTab === 'common'
              ? 'No common items yet. Admin can add group essentials here.'
              : 'Nothing to pack yet. Add your personal items above!'}
          </p>
        </div>
      )}
    </div>
  )
}
