'use client'

import { PopulatedExpense } from '@/types/expense'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Props {
  expense: PopulatedExpense
  currentMemberId?: string
  onEdit:   (e: PopulatedExpense) => void
  onDelete: (id: string) => void
}

export default function ExpenseCard({ expense, currentMemberId, onEdit, onDelete }: Props) {
  const { isAdmin } = useAuth()
  const cat      = EXPENSE_CATEGORIES.find((c) => c.value === expense.category)
  const myShare  = expense.splits.find((s) => s.member._id === currentMemberId)
  const canDelete = isAdmin || expense.createdBy === currentMemberId  // rough check

  return (
    <div className="group bg-[#16213E] border border-[#0F3460] rounded-xl p-4 hover:border-[#52B788]/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        {/* Left: category icon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0F3460] flex items-center justify-center text-xl flex-shrink-0">
            {cat?.emoji ?? '💼'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-semibold text-[#E8F5E9] text-sm truncate">{expense.title}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-[#A0AEC0]">{formatDate(expense.date)}</span>
              <span className="text-[#0F3460]">·</span>
              <span className="text-xs text-[#A0AEC0]">
                {expense.paidBy.emoji} {expense.paidBy.name} paid
              </span>
              <span className="text-[#0F3460]">·</span>
              <span className="text-xs text-[#A0AEC0]">
                {expense.splits.length} people
              </span>
            </div>
            {expense.note && (
              <p className="text-xs text-[#A0AEC0]/60 mt-1 italic">&ldquo;{expense.note}&rdquo;</p>
            )}
          </div>
        </div>

        {/* Right: amount + actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <p className="font-heading font-bold text-base text-[#E8F5E9]">
            {formatCurrency(expense.amount)}
          </p>
          {myShare && (
            <p className="text-xs text-[#A0AEC0]">
              Your share: <span className="text-[#E63946] font-medium">{formatCurrency(myShare.amount)}</span>
            </p>
          )}
          {/* Action buttons — show on hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(expense)}
              className="p-1.5 rounded-lg bg-[#0F3460] hover:bg-[#52B788]/20 hover:text-[#52B788] text-[#A0AEC0] transition-colors"
            >
              <Pencil size={12} />
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(expense._id)}
                className="p-1.5 rounded-lg bg-[#0F3460] hover:bg-[#E63946]/20 hover:text-[#E63946] text-[#A0AEC0] transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
