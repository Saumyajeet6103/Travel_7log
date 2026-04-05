'use client'

import { useState } from 'react'
import { PopulatedExpense } from '@/types/expense'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/utils'
import { Pencil, Trash2, Clock, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Props {
  expense: PopulatedExpense
  currentMemberId?: string
  onEdit:        (e: PopulatedExpense) => void
  onDelete:      (id: string) => void
  onView?:       (e: PopulatedExpense) => void
  isHighlighted?: boolean
}

export default function ExpenseCard({ expense, currentMemberId, onEdit, onDelete, onView, isHighlighted }: Props) {
  const { isAdmin, user } = useAuth()
  const [showHistory, setShowHistory] = useState(false)
  const cat      = EXPENSE_CATEGORIES.find((c) => c.value === expense.category)
  const myShare  = expense.splits.find((s) => s.member._id === currentMemberId)
  // createdBy is a User ID — compare with user.id, not memberId
  const canDelete = isAdmin || expense.createdBy === user?.id

  const hasEdits = expense.editHistory?.length > 0

  return (
    <div
      id={`expense-${expense._id}`}
      className={`group bg-surface border rounded-xl p-4 hover:border-primary/40 transition-all card-hover ${
        isHighlighted ? 'border-primary ring-2 ring-primary/30' : 'border-subtle'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: category icon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-subtle flex items-center justify-center text-xl flex-shrink-0">
            {cat?.emoji ?? '💼'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-foreground text-sm truncate">{expense.title}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted">{formatDate(expense.date)}</span>
              <span className="text-subtle">·</span>
              <span className="text-xs text-muted">
                {expense.paidBy.emoji} {expense.paidBy.name} paid
              </span>
              <span className="text-subtle">·</span>
              <span className="text-xs text-muted">
                {expense.splits.length} people
              </span>
            </div>
            {expense.note && (
              <p className="text-xs text-muted/60 mt-1 italic">&ldquo;{expense.note}&rdquo;</p>
            )}
            {/* Last edited by */}
            {expense.lastEditedBy && (
              <p className="text-[10px] text-warning mt-1 flex items-center gap-1">
                <Clock size={9} /> Edited by {expense.lastEditedBy}
              </p>
            )}
          </div>
        </div>

        {/* Right: amount + actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="font-heading font-bold text-base text-foreground">
            {formatCurrency(expense.amount)}
          </p>
          {myShare && (
            <p className="text-xs text-muted">
              Your share: <span className="text-danger font-medium">{formatCurrency(myShare.amount)}</span>
            </p>
          )}
          {/* Action buttons — always visible on mobile, hover on desktop */}
          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {hasEdits && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 rounded-lg bg-subtle hover:bg-warning/20 hover:text-warning text-muted transition-colors"
                title="Edit history"
              >
                {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
            <button
              onClick={() => onView?.(expense)}
              className="p-1.5 rounded-lg bg-subtle hover:bg-info/20 hover:text-info text-muted transition-colors"
              title="View details"
            >
              <Eye size={12} />
            </button>
            <button
              onClick={() => onEdit(expense)}
              className="p-1.5 rounded-lg bg-subtle hover:bg-primary/20 hover:text-primary text-muted transition-colors"
              title="Edit"
            >
              <Pencil size={12} />
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(expense._id)}
                className="p-1.5 rounded-lg bg-subtle hover:bg-danger/20 hover:text-danger text-muted transition-colors"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit History Dropdown */}
      {showHistory && hasEdits && (
        <div className="mt-3 pt-3 border-t border-subtle space-y-1.5 animate-fade-in">
          <p className="text-[10px] font-medium text-muted uppercase tracking-wide">Edit History</p>
          {expense.editHistory.slice().reverse().map((entry, i) => (
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
      )}
    </div>
  )
}
