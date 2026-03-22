'use client'

import { useState, useEffect, FormEvent } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { PopulatedExpense } from '@/types/expense'
import { PopulatedMember } from '@/types/expense'
import { formatCurrency, EXPENSE_CATEGORIES } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  members:  PopulatedMember[]
  editing?: PopulatedExpense | null
  onClose:  () => void
  onSaved:  (expense: PopulatedExpense) => void
}

type Category  = 'food' | 'travel' | 'stay' | 'fun' | 'misc'
type SplitType = 'equal' | 'custom'

const EMPTY_FORM = {
  title:     '',
  amount:    '',
  paidBy:    '',
  category:  'misc' as Category,
  splitType: 'equal' as SplitType,
  date:      new Date().toISOString().slice(0, 10),
  note:      '',
}

export default function AddExpenseModal({ members, editing, onClose, onSaved }: Props) {
  const [form, setForm]               = useState(EMPTY_FORM)
  const [splitAmong, setSplitAmong]   = useState<string[]>(members.map((m) => m._id))
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({})
  const [loading, setLoading]         = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (editing) {
      setForm({
        title:     editing.title,
        amount:    String(editing.amount),
        paidBy:    editing.paidBy._id,
        category:  editing.category as Category,
        splitType: editing.splitType as SplitType,
        date:      editing.date.slice(0, 10),
        note:      editing.note,
      })
      if (editing.splitType === 'equal') {
        setSplitAmong(editing.splits.map((s) => s.member._id))
      } else {
        const custom: Record<string, string> = {}
        editing.splits.forEach((s) => { custom[s.member._id] = String(s.amount) })
        setCustomSplits(custom)
        setSplitAmong(editing.splits.map((s) => s.member._id))
      }
    } else {
      setForm(EMPTY_FORM)
      setSplitAmong(members.map((m) => m._id))
      setCustomSplits({})
    }
  }, [editing, members])

  const amount = parseFloat(form.amount) || 0

  // Per-person equal split preview
  const perPerson = splitAmong.length > 0 ? Math.floor(amount / splitAmong.length) : 0

  // Custom splits total
  const customTotal = Object.values(customSplits).reduce((s, v) => s + (parseFloat(v) || 0), 0)

  const toggleMember = (id: string) => {
    setSplitAmong((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title daalo bhai 📝'); return }
    if (amount <= 0)        { toast.error('Amount kitna hai? 💰'); return }
    if (!form.paidBy)       { toast.error('Kisne diya paisa? 🧑'); return }
    if (form.splitType === 'equal' && splitAmong.length === 0) {
      toast.error('Koi toh ho split mein 😅'); return
    }
    if (form.splitType === 'custom' && Math.abs(customTotal - amount) > 1) {
      toast.error(`Split total ₹${customTotal} ≠ ₹${amount}. Fix karo 🔢`); return
    }

    setLoading(true)
    try {
      const url    = editing ? `/api/expenses/${editing._id}` : '/api/expenses'
      const method = editing ? 'PUT' : 'POST'

      const body: Record<string, unknown> = {
        ...form,
        amount,
        splitType: form.splitType,
      }
      if (form.splitType === 'equal') {
        body.splitAmong = splitAmong
      } else {
        body.customSplits = Object.entries(customSplits)
          .filter(([, v]) => parseFloat(v) > 0)
          .map(([member, v]) => ({ member, amount: parseFloat(v) }))
      }

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error ?? 'Error hua 😬'); return }

      toast.success(editing ? '✏️ Expense updated!' : '💸 Expense daala gaya!')
      onSaved(data.expense)
      onClose()
    } catch {
      toast.error('Network error 📶')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full md:max-w-lg bg-surface border border-subtle rounded-t-2xl md:rounded-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-subtle px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-lg text-foreground">
            {editing ? '✏️ Edit Expense' : '💸 Add Expense'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-subtle text-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">What was it for?</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Lunch at Matheran dhaba"
              className="w-full px-4 py-2.5 bg-base border border-subtle rounded-xl text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Amount (₹)</label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-base border border-subtle rounded-xl text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-base border border-subtle rounded-xl text-foreground focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Category</label>
            <div className="flex gap-2 flex-wrap">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value as Category })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    form.category === cat.value
                      ? 'bg-primary/20 border-primary/60 text-primary'
                      : 'bg-base border-subtle text-muted hover:border-primary/30'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Paid by</label>
            <div className="flex gap-2 flex-wrap">
              {members.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => setForm({ ...form, paidBy: m._id })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    form.paidBy === m._id
                      ? 'border-primary/60 text-primary'
                      : 'bg-base border-subtle text-muted hover:border-primary/30'
                  }`}
                  style={form.paidBy === m._id ? { backgroundColor: m.color + '20' } : {}}
                >
                  {m.emoji} {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Split type */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Split type</label>
            <div className="flex gap-2">
              {(['equal', 'custom'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, splitType: t })}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.splitType === t
                      ? 'bg-primary/20 border-primary/60 text-primary'
                      : 'bg-base border-subtle text-muted'
                  }`}
                >
                  {t === 'equal' ? '⚖️ Equal' : '✏️ Custom'}
                </button>
              ))}
            </div>
          </div>

          {/* Equal split — member selector */}
          {form.splitType === 'equal' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Split among ({splitAmong.length} people · {perPerson > 0 ? formatCurrency(perPerson) + '/each ~' : '—'})
              </label>
              <div className="flex gap-2 flex-wrap">
                {members.map((m) => {
                  const selected = splitAmong.includes(m._id)
                  return (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => toggleMember(m._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selected
                          ? 'border-primary/60 text-primary'
                          : 'bg-base border-subtle text-muted opacity-50'
                      }`}
                      style={selected ? { backgroundColor: m.color + '15' } : {}}
                    >
                      {selected ? <Minus size={10} /> : <Plus size={10} />}
                      {m.emoji} {m.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Custom split — amounts per person */}
          {form.splitType === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Custom amounts
                <span className={`ml-2 ${Math.abs(customTotal - amount) > 1 ? 'text-danger' : 'text-primary'}`}>
                  (total: {formatCurrency(customTotal)} / {formatCurrency(amount)})
                </span>
              </label>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m._id} className="flex items-center gap-3">
                    <span className="text-sm w-28 flex items-center gap-1.5 text-foreground">
                      {m.emoji} {m.name}
                    </span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={customSplits[m._id] ?? ''}
                        onChange={(e) => setCustomSplits({ ...customSplits, [m._id]: e.target.value })}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2 bg-base border border-subtle rounded-lg text-foreground text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Note (optional)</label>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. Including tip, Harshal will pay back later 😅"
              className="w-full px-4 py-2.5 bg-base border border-subtle rounded-xl text-foreground placeholder-muted/40 focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-fg font-heading font-bold rounded-xl transition-all disabled:opacity-60 text-sm"
          >
            {loading ? 'Saving...' : editing ? 'Update Expense ✅' : 'Add Expense 💸'}
          </button>
        </form>
      </div>
    </div>
  )
}
