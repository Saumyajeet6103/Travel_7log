'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { Plus, Trash2, X, Coffee, Car, Home, PartyPopper, ShoppingBag, Package } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface PersonalExpense {
  _id: string
  title: string
  amount: number
  category: string
  date: string
  note: string
}

const CATEGORIES = [
  { value: 'food',     label: 'Food',     emoji: '🍕', icon: Coffee },
  { value: 'travel',   label: 'Travel',   emoji: '🚂', icon: Car },
  { value: 'stay',     label: 'Stay',     emoji: '🏨', icon: Home },
  { value: 'fun',      label: 'Fun',      emoji: '🎉', icon: PartyPopper },
  { value: 'shopping', label: 'Shopping',  emoji: '🛍️', icon: ShoppingBag },
  { value: 'misc',     label: 'Misc',     emoji: '💼', icon: Package },
]

export default function PersonalExpenses() {
  const [expenses, setExpenses] = useState<PersonalExpense[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)

  // Form state
  const [title, setTitle]       = useState('')
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('misc')
  const [date, setDate]         = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote]         = useState('')
  const [saving, setSaving]     = useState(false)

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/personal-expenses')
      const data = await res.json()
      setExpenses(data.expenses ?? [])
      setTotal(data.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Title daalo 📝'); return }
    if (!parseFloat(amount) || parseFloat(amount) <= 0) { toast.error('Amount kitna? 💰'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/personal-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: parseFloat(amount),
          category,
          date,
          note: note.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setExpenses((prev) => [data.expense, ...prev])
        setTotal((prev) => prev + data.expense.amount)
        setTitle(''); setAmount(''); setNote(''); setCategory('misc')
        setShowAdd(false)
        toast.success('Personal expense added! 📝')
      } else {
        toast.error(data.error ?? 'Failed')
      }
    } catch {
      toast.error('Network error 📶')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, amt: number) => {
    setExpenses((prev) => prev.filter((e) => e._id !== id))
    setTotal((prev) => prev - amt)
    const res = await fetch(`/api/personal-expenses/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      fetchExpenses()
      toast.error('Delete failed')
    } else {
      toast.success('Removed! 🗑️')
    }
  }

  // Group by category
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header + total */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted mb-0.5">Your Personal Spending</p>
            <p className="font-heading font-black text-2xl text-primary">{formatCurrency(total)}</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-dark text-primary-fg font-bold rounded-xl text-xs transition-all"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {/* Mini category breakdown */}
        {Object.keys(byCategory).length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {CATEGORIES.filter((c) => byCategory[c.value]).map((c) => (
              <span
                key={c.value}
                className="text-[10px] text-muted bg-base/60 px-2 py-0.5 rounded-full"
              >
                {c.emoji} {formatCurrency(byCategory[c.value])}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-surface border border-subtle rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">New personal expense</p>
            <button onClick={() => setShowAdd(false)} className="p-1 text-muted hover:text-foreground">
              <X size={14} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you spend on?"
              className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 bg-base border border-subtle rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    category === c.value
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'bg-base border-subtle text-muted'
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full px-3 py-2 bg-base border border-subtle rounded-lg text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-primary-fg font-heading font-bold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>
      )}

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm font-medium">No personal expenses yet</p>
          <p className="text-xs mt-1">Track your individual spending here. Only you can see this.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => {
            const cat = CATEGORIES.find((c) => c.value === exp.category)
            return (
              <div
                key={exp._id}
                className="group flex items-center gap-3 bg-surface border border-subtle rounded-xl px-3.5 py-3 hover:border-primary/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center text-base flex-shrink-0">
                  {cat?.emoji ?? '💼'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{exp.title}</p>
                  <p className="text-[10px] text-muted">{formatDate(exp.date)}{exp.note ? ` · ${exp.note}` : ''}</p>
                </div>
                <p className="font-heading font-bold text-sm text-foreground flex-shrink-0">
                  {formatCurrency(exp.amount)}
                </p>
                <button
                  onClick={() => handleDelete(exp._id, exp.amount)}
                  className="p-1 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  aria-label="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
