'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { SettlementTransaction } from '@/types/expense'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  transaction: SettlementTransaction
  onClose:     () => void
  onSettled:   () => void
}

export default function SettleModal({ transaction, onClose, onSettled }: Props) {
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)

  const handleSettle = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settlements', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          from:   transaction.from,
          to:     transaction.to,
          amount: transaction.amount,
          note,
        }),
      })

      if (!res.ok) { toast.error('Error recording settlement 😬'); return }

      toast.success('✅ Paisa cleared! Dosti barqarar!', { duration: 4000 })
      onSettled()
      onClose()
    } catch {
      toast.error('Network error 📶')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#16213E] border border-[#0F3460] rounded-2xl p-6 animate-bounce-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#0F3460] text-[#A0AEC0]">
          <X size={16} />
        </button>

        <div className="text-center mb-5">
          <p className="text-4xl mb-2">💸</p>
          <h2 className="font-heading font-bold text-lg text-[#E8F5E9]">Confirm Settlement</h2>
        </div>

        <div className="bg-[#1A1A2E] border border-[#0F3460] rounded-xl p-4 mb-5 text-center">
          <p className="text-3xl mb-2">{transaction.fromEmoji}</p>
          <p className="text-sm text-[#A0AEC0] mb-1">{transaction.fromName} pays</p>
          <p className="font-heading font-black text-3xl text-[#52B788]">{formatCurrency(transaction.amount)}</p>
          <p className="text-sm text-[#A0AEC0] mt-1">to {transaction.toEmoji} {transaction.toName}</p>
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note... (optional)"
          className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/40 focus:outline-none focus:border-[#52B788] text-sm mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#0F3460] text-[#A0AEC0] rounded-xl text-sm hover:border-[#A0AEC0]/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSettle}
            disabled={loading}
            className="flex-1 py-2.5 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-heading font-bold rounded-xl text-sm transition-all disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Mark Settled ✅'}
          </button>
        </div>
      </div>
    </div>
  )
}
