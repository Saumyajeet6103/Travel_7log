'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRealtime } from '@/hooks/useRealtime'
import { PopulatedExpense, MemberBalance, SettlementTransaction, PopulatedSettlement } from '@/types/expense'
import { PopulatedMember } from '@/types/expense'
import { formatCurrency, formatDate } from '@/lib/utils'
import ExpenseCard      from './ExpenseCard'
import AddExpenseModal  from './AddExpenseModal'
import BalancesView     from './BalancesView'
import SettleModal      from './SettleModal'
import { Plus, TrendingUp, TrendingDown, Wallet, History } from 'lucide-react'
import toast from 'react-hot-toast'

interface BalancesData {
  memberBalances: MemberBalance[]
  transactions:   SettlementTransaction[]
  categoryTotals: Record<string, number>
}

interface Props {
  initialExpenses:   PopulatedExpense[]
  initialMembers:    PopulatedMember[]
  initialBalances:   BalancesData
  initialSettlements: PopulatedSettlement[]
}

type Tab = 'expenses' | 'balances' | 'history'

export default function ExpenseDashboard({
  initialExpenses, initialMembers, initialBalances, initialSettlements,
}: Props) {
  const { user } = useAuth()
  const [expenses,    setExpenses]    = useState(initialExpenses)
  const [balances,    setBalances]    = useState(initialBalances)
  const [settlements, setSettlements] = useState(initialSettlements)
  const [activeTab,   setActiveTab]   = useState<Tab>('expenses')
  const [showAdd,     setShowAdd]     = useState(false)
  const [editing,     setEditing]     = useState<PopulatedExpense | null>(null)
  const [settleTarget, setSettleTarget] = useState<SettlementTransaction | null>(null)

  // Find current member ID from members list
  const currentMember = initialMembers.find(
    (m) => m.name.toLowerCase() === user?.name?.toLowerCase()
  )
  const currentMemberId = currentMember?._id ?? ''

  const refreshData = useCallback(async () => {
    const [expRes, balRes, setRes] = await Promise.all([
      fetch('/api/expenses'),
      fetch('/api/balances'),
      fetch('/api/settlements'),
    ])
    if (expRes.ok) { const d = await expRes.json(); setExpenses(d.expenses) }
    if (balRes.ok) { const d = await balRes.json(); setBalances(d) }
    if (setRes.ok) { const d = await setRes.json(); setSettlements(d.settlements) }
  }, [])

  useRealtime(['expense', 'settlement'], refreshData)

  const handleSaved = (expense: PopulatedExpense) => {
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e._id === expense._id)
      if (idx >= 0) { const next = [...prev]; next[idx] = expense; return next }
      return [expense, ...prev]
    })
    refreshData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense? Pakka? 🗑️')) return
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setExpenses((prev) => prev.filter((e) => e._id !== id))
      toast.success('🗑️ Expense deleted!')
      refreshData()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Delete failed')
    }
  }

  // Computed stats
  const totalSpent  = expenses.reduce((s, e) => s + e.amount, 0)
  const myBalance   = balances.memberBalances.find((m) => m._id === currentMemberId)
  const iOwe        = myBalance && myBalance.netBalance < 0 ? Math.abs(myBalance.netBalance) : 0
  const iGetBack    = myBalance && myBalance.netBalance > 0 ? myBalance.netBalance : 0

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'expenses', label: 'Expenses',  icon: <Wallet size={14} /> },
    { id: 'balances', label: 'Balances',  icon: <TrendingUp size={14} /> },
    { id: 'history',  label: 'History',   icon: <History size={14} /> },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#E8F5E9]">Expense Tracker 💸</h1>
          <p className="text-xs text-[#A0AEC0] mt-0.5">7 log ka hisaab kitaab</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowAdd(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-heading font-bold rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#16213E] border border-[#0F3460] rounded-xl p-3 text-center">
          <p className="text-xs text-[#A0AEC0] mb-1">Total Spent</p>
          <p className="font-heading font-bold text-sm text-[#E8F5E9]">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-[#E63946]/10 border border-[#E63946]/30 rounded-xl p-3 text-center">
          <p className="text-xs text-[#E63946] mb-0.5 flex items-center justify-center gap-1">
            <TrendingDown size={10} /> Tare Apvanu
          </p>
          <p className="text-[9px] text-[#E63946]/70 mb-1">(You owe)</p>
          <p className="font-heading font-bold text-sm text-[#E63946]">{formatCurrency(iOwe)}</p>
        </div>
        <div className="bg-[#52B788]/10 border border-[#52B788]/30 rounded-xl p-3 text-center">
          <p className="text-xs text-[#52B788] mb-0.5 flex items-center justify-center gap-1">
            <TrendingUp size={10} /> Mare Levanu
          </p>
          <p className="text-[9px] text-[#52B788]/70 mb-1">(Get back)</p>
          <p className="font-heading font-bold text-sm text-[#52B788]">{formatCurrency(iGetBack)}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-[#16213E] border border-[#0F3460] rounded-xl p-1 mb-5">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === id
                ? 'bg-[#52B788] text-[#1A1A2E]'
                : 'text-[#A0AEC0] hover:text-[#E8F5E9]'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {/* Expenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-3 animate-fade-in">
          {expenses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-2">🫙</p>
              <p className="font-heading font-bold text-[#52B788]">Abhi tak kuch nahi!</p>
              <p className="text-xs text-[#A0AEC0] mt-1">
                No expenses yet. Bhai trip pe gaye ho ya ghar pe baithe ho? 😂
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-4 px-4 py-2 bg-[#52B788]/20 text-[#52B788] border border-[#52B788]/30 rounded-xl text-sm font-medium"
              >
                Add first expense +
              </button>
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                currentMemberId={currentMemberId}
                onEdit={(e) => { setEditing(e); setShowAdd(true) }}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* Balances */}
      {activeTab === 'balances' && (
        <div className="animate-fade-in">
          <BalancesView
            memberBalances={balances.memberBalances}
            transactions={balances.transactions}
            categoryTotals={balances.categoryTotals}
            currentMemberId={currentMemberId}
            onSettleUp={(t) => setSettleTarget(t)}
          />
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="animate-fade-in space-y-3">
          {settlements.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-2">📜</p>
              <p className="font-heading font-bold text-[#52B788]">Koi settlement nahi abhi</p>
              <p className="text-xs text-[#A0AEC0] mt-1">Settlement history will appear here.</p>
            </div>
          ) : (
            settlements.map((s) => (
              <div key={s._id} className="bg-[#16213E] border border-[#0F3460] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.from.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-[#E8F5E9]">
                        {s.from.name} → {s.to.emoji} {s.to.name}
                      </p>
                      <p className="text-xs text-[#A0AEC0]">{formatDate(s.settledAt)}</p>
                      {s.note && <p className="text-xs text-[#A0AEC0]/60 italic mt-0.5">&ldquo;{s.note}&rdquo;</p>}
                    </div>
                  </div>
                  <p className="font-heading font-bold text-[#52B788]">{formatCurrency(s.amount)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <AddExpenseModal
          members={initialMembers}
          editing={editing}
          onClose={() => { setShowAdd(false); setEditing(null) }}
          onSaved={handleSaved}
        />
      )}

      {settleTarget && (
        <SettleModal
          transaction={settleTarget}
          onClose={() => setSettleTarget(null)}
          onSettled={refreshData}
        />
      )}
    </div>
  )
}
