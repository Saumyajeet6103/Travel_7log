'use client'

import { X, Clock } from 'lucide-react'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/utils'

interface SplitInfo {
  memberName: string
  memberEmoji: string
  amount: number
}

interface EditInfo {
  editedBy: string
  editedAt: string
  changes: string
}

interface ViewData {
  title: string
  amount: number
  category: string
  paidByName: string
  paidByEmoji: string
  date: string
  note: string
  splitType: string
  splits: SplitInfo[]
  editHistory: EditInfo[]
  isDeleted?: boolean
  deletedBy?: string
  deletedAt?: string
}

interface Props {
  data: ViewData
  onClose: () => void
}

export default function ViewExpenseModal({ data, onClose }: Props) {
  const cat = EXPENSE_CATEGORIES.find((c) => c.value === data.category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-subtle rounded-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-subtle px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat?.emoji ?? '💼'}</span>
            <h2 className="font-heading font-bold text-lg text-foreground">
              {data.isDeleted ? 'Deleted Expense' : 'Expense Details'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-subtle text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Deleted badge */}
          {data.isDeleted && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-sm">🗑️</span>
              <div>
                <p className="text-xs text-danger font-medium">Deleted by {data.deletedBy}</p>
                {data.deletedAt && (
                  <p className="text-[10px] text-danger/60">{formatDate(data.deletedAt)}</p>
                )}
              </div>
            </div>
          )}

          {/* Title + amount */}
          <div className="text-center">
            <p className={`font-heading font-bold text-xl text-foreground ${data.isDeleted ? 'line-through opacity-70' : ''}`}>
              {data.title}
            </p>
            <p className={`font-heading font-black text-3xl mt-1 ${data.isDeleted ? 'text-danger/50 line-through' : 'text-primary'}`}>
              {formatCurrency(data.amount)}
            </p>
          </div>

          {/* Info rows */}
          <div className="bg-base border border-subtle rounded-xl divide-y divide-subtle">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted">Paid by</span>
              <span className="text-sm font-medium text-foreground">{data.paidByEmoji} {data.paidByName}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted">Date</span>
              <span className="text-sm text-foreground">{formatDate(data.date)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted">Category</span>
              <span className="text-sm text-foreground">{cat?.emoji} {cat?.label ?? data.category}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted">Split type</span>
              <span className="text-sm text-foreground capitalize">{data.splitType}</span>
            </div>
            {data.note && (
              <div className="px-4 py-3">
                <span className="text-xs text-muted">Note</span>
                <p className="text-sm text-foreground mt-0.5 italic">&ldquo;{data.note}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Splits */}
          {data.splits.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                Split ({data.splits.length} people)
              </p>
              <div className="bg-base border border-subtle rounded-xl divide-y divide-subtle">
                {data.splits.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{s.memberEmoji}</span>
                      <span className="text-sm text-foreground">{s.memberName}</span>
                    </div>
                    <span className="font-heading font-bold text-sm text-danger">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit history */}
          {data.editHistory.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Edit History</p>
              <div className="space-y-1.5">
                {data.editHistory.slice().reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <Clock size={10} className="text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-foreground font-medium">{entry.editedBy}</span>
                      <span className="text-muted"> — {entry.changes}</span>
                      <span className="text-muted/50 ml-1.5">
                        {new Date(entry.editedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
