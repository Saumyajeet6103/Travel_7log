'use client'

import { MemberBalance, SettlementTransaction } from '@/types/expense'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface Props {
  memberBalances:  MemberBalance[]
  transactions:    SettlementTransaction[]
  currentMemberId: string
  onSettleUp:      (t: SettlementTransaction) => void
}

export default function MyBalanceView({
  memberBalances, transactions, currentMemberId, onSettleUp,
}: Props) {
  const myBalance = memberBalances.find((m) => m._id === currentMemberId)
  const iOwe      = myBalance && myBalance.netBalance < 0 ? Math.abs(myBalance.netBalance) : 0
  const iGetBack  = myBalance && myBalance.netBalance > 0 ? myBalance.netBalance : 0

  // Transactions where I need to pay someone
  const myDebts   = transactions.filter((t) => t.from === currentMemberId)
  // Transactions where someone pays me
  const myCredits = transactions.filter((t) => t.to === currentMemberId)

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
          <div className="flex gap-4 mt-3 pt-3 border-t border-subtle/50">
            <div>
              <p className="text-[10px] text-muted">Total Paid</p>
              <p className="font-heading font-bold text-sm text-foreground">{formatCurrency(myBalance.totalPaid)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Total Owed</p>
              <p className="font-heading font-bold text-sm text-foreground">{formatCurrency(myBalance.totalOwed)}</p>
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
