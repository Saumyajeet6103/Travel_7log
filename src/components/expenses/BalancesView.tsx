'use client'

import { MemberBalance, SettlementTransaction } from '@/types/expense'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  food:   'rgb(var(--c-primary))',
  travel: 'rgb(var(--c-info))',
  stay:   'rgb(var(--c-purple))',
  fun:    'rgb(var(--c-warning))',
  misc:   'rgb(var(--c-muted))',
}
const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍕', travel: '🚂', stay: '🏨', fun: '🎉', misc: '💼',
}

interface Props {
  memberBalances:  MemberBalance[]
  transactions:    SettlementTransaction[]
  categoryTotals:  Record<string, number>
  currentMemberId: string
  onSettleUp:      (t: SettlementTransaction) => void
}

export default function BalancesView({
  memberBalances, transactions, categoryTotals, currentMemberId, onSettleUp,
}: Props) {
  const totalSpent     = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
  const biggestSpender = [...memberBalances].sort((a, b) => b.totalPaid - a.totalPaid)[0]
  const biggestOwer    = [...memberBalances].sort((a, b) => a.netBalance - b.netBalance)[0]

  const chartData = Object.entries(categoryTotals)
    .filter(([, v]) => v > 0)
    .map(([cat, value]) => ({ name: cat, value, emoji: CATEGORY_EMOJIS[cat] ?? '💼' }))

  return (
    <div className="space-y-6">
      {/* Funny badges */}
      {biggestSpender && biggestOwer && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-center card-hover">
            <p className="text-2xl">💰</p>
            <p className="text-xs text-primary font-medium mt-1">Biggest Spender</p>
            <p className="text-sm font-heading font-bold text-foreground">{biggestSpender.emoji} {biggestSpender.name}</p>
            <p className="text-xs text-muted">{formatCurrency(biggestSpender.totalPaid)} paid</p>
          </div>
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-center card-hover">
            <p className="text-2xl">🥶</p>
            <p className="text-xs text-danger font-medium mt-1">Kanjoos Makhichoos</p>
            <p className="text-sm font-heading font-bold text-foreground">{biggestOwer.emoji} {biggestOwer.name}</p>
            <p className="text-xs text-muted">{formatCurrency(Math.abs(biggestOwer.netBalance))} owes</p>
          </div>
        </div>
      )}

      {/* Per-member balance bars */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-muted uppercase tracking-wider mb-3">
          Badha na Hisaab 📊
        </h3>
        <div className="space-y-2">
          {memberBalances.map((m) => {
            const isPositive = m.netBalance >= 0
            const isMe       = m._id === currentMemberId
            const maxAbs     = Math.max(...memberBalances.map((x) => Math.abs(x.netBalance)), 1)
            const barWidth   = Math.min((Math.abs(m.netBalance) / maxAbs) * 100, 100)

            // Gujarati labels from current user's perspective
            const balanceLabel = isMe
              ? isPositive
                ? 'Mare levanu (Get back) 🤑'
                : 'Tare apvanu (You owe) 😬'
              : isPositive
                ? 'Ane levanu (Gets back)'
                : 'Ane apvanu (Owes)'

            return (
              <div
                key={m._id}
                className={`bg-surface border rounded-xl p-3 ${isMe ? 'border-primary/50' : 'border-subtle'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.emoji}</span>
                    <div>
                      <span className="text-sm font-medium text-foreground">{m.name}</span>
                      {isMe && <span className="ml-1.5 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">TU</span>}
                      <p className={`text-[10px] mt-0.5 ${isPositive ? 'text-primary' : 'text-danger'}`}>
                        {balanceLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isPositive
                      ? <TrendingUp size={13} className="text-primary" />
                      : <TrendingDown size={13} className="text-danger" />
                    }
                    <span className={`font-heading font-bold text-sm ${isPositive ? 'text-primary' : 'text-danger'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(m.netBalance)}
                    </span>
                  </div>
                </div>
                {/* Bar */}
                <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-primary' : 'bg-danger'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Suggested Settlements */}
      {transactions.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-muted uppercase tracking-wider mb-3">
            Kon Kon ne Apashe? 💡
          </h3>
          <div className="space-y-2">
            {transactions.map((t, i) => {
              const isMyDebt   = t.from === currentMemberId
              const isMyCredit = t.to   === currentMemberId
              return (
                <div
                  key={i}
                  className={`border rounded-xl p-4 flex items-center justify-between gap-3 ${
                    isMyDebt   ? 'bg-danger/10 border-danger/30' :
                    isMyCredit ? 'bg-primary/[0.08] border-primary/20' :
                                 'bg-surface border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl">{t.fromEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        <span className={isMyDebt ? 'text-danger font-bold' : ''}>{isMyDebt ? 'Tare' : t.fromName}</span>
                        {' '}
                        <span className="text-muted text-xs">apvanu chhe</span>
                        {' '}
                        <span className={isMyCredit ? 'text-primary font-bold' : ''}>{isMyCredit ? 'mare' : t.toName}</span>
                        {' '}
                        <span className="text-muted text-xs">(You owe → You get)</span>
                      </p>
                      <p className="font-heading font-bold text-primary">{formatCurrency(t.amount)}</p>
                    </div>
                  </div>
                  {isMyCredit ? (
                    <button
                      onClick={() => onSettleUp(t)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 bg-primary text-primary-fg hover:bg-primary-dark"
                    >
                      Confirm <ArrowRight size={11} />
                    </button>
                  ) : isMyDebt ? (
                    <span className="text-[10px] text-muted italic flex-shrink-0 px-2">
                      {t.toName} confirms
                    </span>
                  ) : (
                    <span className="text-[10px] text-subtle italic flex-shrink-0 px-2">
                      {t.toName} confirms
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-primary font-heading font-bold">Badhu barabar chhe!</p>
          <p className="text-xs text-muted mt-1">Koi levadevu nathi. Tamara badha honest chho. Surprising, honestly. 😄</p>
        </div>
      )}

      {/* Category Breakdown */}
      {totalSpent > 0 && chartData.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-muted uppercase tracking-wider mb-3">
            Where did the money go? 🤔
          </h3>
          <div className="bg-surface border border-subtle rounded-xl p-4">
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#A0AEC0'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    contentStyle={{
                      background: 'rgb(var(--c-surface))',
                      border: '1px solid rgb(var(--c-subtle))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] }} />
                      <span className="text-xs text-muted">{entry.emoji} {entry.name}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
