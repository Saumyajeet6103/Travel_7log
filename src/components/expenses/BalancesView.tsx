'use client'

import { MemberBalance, SettlementTransaction } from '@/types/expense'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  food:   '#52B788',
  travel: '#2D9CDB',
  stay:   '#9B5DE5',
  fun:    '#F4A261',
  misc:   '#A0AEC0',
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
          <div className="bg-[#52B788]/10 border border-[#52B788]/30 rounded-xl p-3 text-center">
            <p className="text-2xl">💰</p>
            <p className="text-xs text-[#52B788] font-medium mt-1">Biggest Spender</p>
            <p className="text-sm font-heading font-bold text-[#E8F5E9]">{biggestSpender.emoji} {biggestSpender.name}</p>
            <p className="text-xs text-[#A0AEC0]">{formatCurrency(biggestSpender.totalPaid)} paid</p>
          </div>
          <div className="bg-[#E63946]/10 border border-[#E63946]/30 rounded-xl p-3 text-center">
            <p className="text-2xl">🥶</p>
            <p className="text-xs text-[#E63946] font-medium mt-1">Kanjoos Makhichoos</p>
            <p className="text-sm font-heading font-bold text-[#E8F5E9]">{biggestOwer.emoji} {biggestOwer.name}</p>
            <p className="text-xs text-[#A0AEC0]">{formatCurrency(Math.abs(biggestOwer.netBalance))} owes</p>
          </div>
        </div>
      )}

      {/* Per-member balance bars */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-[#A0AEC0] uppercase tracking-wider mb-3">
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
                className={`bg-[#16213E] border rounded-xl p-3 ${isMe ? 'border-[#52B788]/50' : 'border-[#0F3460]'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.emoji}</span>
                    <div>
                      <span className="text-sm font-medium text-[#E8F5E9]">{m.name}</span>
                      {isMe && <span className="ml-1.5 text-[9px] bg-[#52B788]/20 text-[#52B788] px-1.5 py-0.5 rounded-full">TU</span>}
                      <p className={`text-[10px] mt-0.5 ${isPositive ? 'text-[#52B788]' : 'text-[#E63946]'}`}>
                        {balanceLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isPositive
                      ? <TrendingUp size={13} className="text-[#52B788]" />
                      : <TrendingDown size={13} className="text-[#E63946]" />
                    }
                    <span className={`font-heading font-bold text-sm ${isPositive ? 'text-[#52B788]' : 'text-[#E63946]'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(m.netBalance)}
                    </span>
                  </div>
                </div>
                {/* Bar */}
                <div className="h-1.5 bg-[#0F3460] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-[#52B788]' : 'bg-[#E63946]'}`}
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
          <h3 className="font-heading font-semibold text-sm text-[#A0AEC0] uppercase tracking-wider mb-3">
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
                    isMyDebt   ? 'bg-[#E63946]/10 border-[#E63946]/30' :
                    isMyCredit ? 'bg-[#52B788]/8  border-[#52B788]/20' :
                                 'bg-[#16213E] border-[#0F3460]'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl">{t.fromEmoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#E8F5E9] truncate">
                        <span className={isMyDebt ? 'text-[#E63946] font-bold' : ''}>{isMyDebt ? 'Tare' : t.fromName}</span>
                        {' '}
                        <span className="text-[#A0AEC0] text-xs">apvanu chhe</span>
                        {' '}
                        <span className={isMyCredit ? 'text-[#52B788] font-bold' : ''}>{isMyCredit ? 'mare' : t.toName}</span>
                        {' '}
                        <span className="text-[#A0AEC0] text-xs">(You owe → You get)</span>
                      </p>
                      <p className="font-heading font-bold text-[#52B788]">{formatCurrency(t.amount)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSettleUp(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${
                      isMyDebt
                        ? 'bg-[#52B788] text-[#1A1A2E] hover:bg-[#2D6A4F]'
                        : 'bg-[#0F3460] text-[#A0AEC0] hover:text-[#52B788] hover:bg-[#52B788]/10'
                    }`}
                  >
                    Settle <ArrowRight size={11} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-[#52B788] font-heading font-bold">Badhu barabar chhe!</p>
          <p className="text-xs text-[#A0AEC0] mt-1">Koi levadevu nathi. Tamara badha honest chho. Surprising, honestly. 😄</p>
        </div>
      )}

      {/* Category Breakdown */}
      {totalSpent > 0 && chartData.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-sm text-[#A0AEC0] uppercase tracking-wider mb-3">
            Where did the money go? 🤔
          </h3>
          <div className="bg-[#16213E] border border-[#0F3460] rounded-xl p-4">
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
                    contentStyle={{ background: '#16213E', border: '1px solid #0F3460', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {chartData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name] }} />
                      <span className="text-xs text-[#A0AEC0]">{entry.emoji} {entry.name}</span>
                    </div>
                    <span className="text-xs font-medium text-[#E8F5E9]">{formatCurrency(entry.value)}</span>
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
