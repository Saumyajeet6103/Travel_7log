'use client'

import { useState } from 'react'
import { MemberBalance, SettlementTransaction, PopulatedExpense } from '@/types/expense'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowRight, ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronUp, Receipt, ExternalLink } from 'lucide-react'

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍔', travel: '🚗', stay: '🏨', fun: '🎉', misc: '📦',
}

interface Props {
  memberBalances:  MemberBalance[]
  transactions:    SettlementTransaction[]
  currentMemberId: string
  onSettleUp:      (t: SettlementTransaction) => void
  expenses:        PopulatedExpense[]
  onNavigate:      (expenseId: string) => void
}

function ExpenseBreakdownList({
  expenses,
  onNavigate,
}: {
  expenses: { id: string; title: string; amount: number; category: string; date: string; share?: number }[]
  onNavigate: (id: string) => void
}) {
  if (expenses.length === 0) {
    return <p className="text-xs text-muted text-center py-3">No expenses found</p>
  }
  return (
    <div className="mt-2 space-y-1.5">
      {expenses.map((e) => (
        <button
          key={e.id}
          onClick={() => onNavigate(e.id)}
          className="w-full flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-background/60 hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all text-left group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">{CATEGORY_EMOJI[e.category] ?? '📦'}</span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{e.title}</p>
              <p className="text-[10px] text-muted">{formatDate(e.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="text-right">
              {e.share !== undefined && e.share !== e.amount ? (
                <>
                  <p className="text-xs font-bold text-foreground">{formatCurrency(e.share)}</p>
                  <p className="text-[10px] text-muted">of {formatCurrency(e.amount)}</p>
                </>
              ) : (
                <p className="text-xs font-bold text-foreground">{formatCurrency(e.amount)}</p>
              )}
            </div>
            <ExternalLink size={10} className="text-muted group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </button>
      ))}
    </div>
  )
}

export default function MyBalanceView({
  memberBalances, transactions, currentMemberId, onSettleUp, expenses, onNavigate,
}: Props) {
  const myBalance = memberBalances.find((m) => m._id === currentMemberId)
  const iOwe      = myBalance && myBalance.netBalance < 0 ? Math.abs(myBalance.netBalance) : 0
  const iGetBack  = myBalance && myBalance.netBalance > 0 ? myBalance.netBalance : 0

  const [showOweBreakdown,   setShowOweBreakdown]   = useState(false)
  const [showPaidBreakdown,  setShowPaidBreakdown]  = useState(false)
  const [showOwedBreakdown,  setShowOwedBreakdown]  = useState(false)

  // Transactions where I need to pay someone
  const myDebts   = transactions.filter((t) => t.from === currentMemberId)
  // Transactions where someone pays me
  const myCredits = transactions.filter((t) => t.to === currentMemberId)

  // Expenses where I paid
  const paidExpenses = expenses
    .filter((e) => e.paidBy._id === currentMemberId)
    .map((e) => ({ id: e._id, title: e.title, amount: e.amount, category: e.category, date: e.date }))

  // Expenses where I have a split (totalOwed sources)
  const owedExpenses = expenses
    .filter((e) => e.splits.some((s) => s.member._id === currentMemberId))
    .map((e) => {
      const mySplit = e.splits.find((s) => s.member._id === currentMemberId)
      return { id: e._id, title: e.title, amount: e.amount, category: e.category, date: e.date, share: mySplit?.amount ?? 0 }
    })

  // Expenses contributing to OWE = expenses where I have a split but did NOT pay
  const oweSourceExpenses = expenses
    .filter((e) => e.splits.some((s) => s.member._id === currentMemberId) && e.paidBy._id !== currentMemberId)
    .map((e) => {
      const mySplit = e.splits.find((s) => s.member._id === currentMemberId)
      return { id: e._id, title: e.title, amount: e.amount, category: e.category, date: e.date, share: mySplit?.amount ?? 0 }
    })

  return (
    <div className="space-y-6">
      {/* My net balance summary */}
      <div className={`rounded-xl p-5 border ${
        iOwe > 0
          ? 'bg-danger/10 border-danger/30'
          : iGetBack > 0
            ? 'bg-primary/10 border-primary/30'
            : 'bg-surface border-subtle'
      }`}>
        <p className="text-xs text-muted mb-1">Taro Overall Balance</p>
        <div className="flex items-center gap-2">
          {iOwe > 0 ? (
            <TrendingDown size={20} className="text-danger" />
          ) : iGetBack > 0 ? (
            <TrendingUp size={20} className="text-primary" />
          ) : null}
          <p className={`font-heading font-black text-3xl ${
            iOwe > 0 ? 'text-danger' : iGetBack > 0 ? 'text-primary' : 'text-foreground'
          }`}>
            {iOwe > 0
              ? `-${formatCurrency(iOwe)}`
              : iGetBack > 0
                ? `+${formatCurrency(iGetBack)}`
                : formatCurrency(0)
            }
          </p>
        </div>
        <p className="text-xs text-muted mt-1.5">
          {iOwe > 0
            ? 'Tare apvanu chhe — settle up bhai! 😬'
            : iGetBack > 0
              ? 'Mare levanu chhe — paisa levi le! 🤑'
              : 'Badhu clear chhe! 🎉'}
        </p>

        {myBalance && (
          <div className="mt-3 pt-3 border-t border-subtle/50 space-y-2">
            {/* You Owe breakdown */}
            {iOwe > 0 && (
              <div>
                <button
                  onClick={() => setShowOweBreakdown((v) => !v)}
                  className="w-full flex items-center justify-between py-1 group"
                >
                  <div className="text-left">
                    <p className="text-[10px] text-muted">You Owe</p>
                    <p className="font-heading font-bold text-sm text-danger">{formatCurrency(iOwe)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted group-hover:text-danger transition-colors">
                    <Receipt size={11} />
                    {showOweBreakdown ? 'Hide' : 'See how'}
                    {showOweBreakdown ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </div>
                </button>
                {showOweBreakdown && (
                  <ExpenseBreakdownList expenses={oweSourceExpenses} onNavigate={onNavigate} />
                )}
              </div>
            )}

            {/* Total Paid breakdown */}
            <div>
              <button
                onClick={() => setShowPaidBreakdown((v) => !v)}
                className="w-full flex items-center justify-between py-1 group"
              >
                <div className="text-left">
                  <p className="text-[10px] text-muted">Total Paid</p>
                  <p className="font-heading font-bold text-sm text-foreground">{formatCurrency(myBalance.totalPaid)}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted group-hover:text-foreground transition-colors">
                  <Receipt size={11} />
                  {showPaidBreakdown ? 'Hide' : 'View all'}
                  {showPaidBreakdown ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </div>
              </button>
              {showPaidBreakdown && (
                <ExpenseBreakdownList expenses={paidExpenses} onNavigate={onNavigate} />
              )}
            </div>

            {/* Total Owed breakdown */}
            <div>
              <button
                onClick={() => setShowOwedBreakdown((v) => !v)}
                className="w-full flex items-center justify-between py-1 group"
              >
                <div className="text-left">
                  <p className="text-[10px] text-muted">Total Owed</p>
                  <p className="font-heading font-bold text-sm text-foreground">{formatCurrency(myBalance.totalOwed)}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted group-hover:text-foreground transition-colors">
                  <Receipt size={11} />
                  {showOwedBreakdown ? 'Hide' : 'View all'}
                  {showOwedBreakdown ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </div>
              </button>
              {showOwedBreakdown && (
                <ExpenseBreakdownList expenses={owedExpenses} onNavigate={onNavigate} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* I need to give */}
      {myDebts.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-danger uppercase tracking-wider mb-3 flex items-center gap-2">
            <ArrowUpRight size={14} /> Tare Apvanu (You Give)
          </h3>
          <div className="space-y-2">
            {myDebts.map((t, i) => (
              <div
                key={i}
                className="bg-danger/[0.06] border border-danger/20 rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{t.toEmoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.toName}</p>
                    <p className="text-[10px] text-muted">Tare {t.toName} ne apvanu</p>
                  </div>
                </div>
                <p className="font-heading font-bold text-base text-danger flex-shrink-0">
                  {formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* I will receive */}
      {myCredits.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
            <ArrowDownLeft size={14} /> Mare Levanu (You Get)
          </h3>
          <div className="space-y-2">
            {myCredits.map((t, i) => (
              <div
                key={i}
                className="bg-primary/[0.06] border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{t.fromEmoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.fromName}</p>
                    <p className="text-[10px] text-muted">{t.fromName} tane apashe</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="font-heading font-bold text-base text-primary">
                    {formatCurrency(t.amount)}
                  </p>
                  <button
                    onClick={() => onSettleUp(t)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-fg hover:bg-primary-dark transition-all"
                  >
                    Confirm <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All clear */}
      {myDebts.length === 0 && myCredits.length === 0 && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">✨</p>
          <p className="font-heading font-bold text-primary">Taro hisaab clear chhe!</p>
          <p className="text-xs text-muted mt-1">Na koi tane apashe, na tare koi ne. Bhai sorted. 👑</p>
        </div>
      )}
    </div>
  )
}
