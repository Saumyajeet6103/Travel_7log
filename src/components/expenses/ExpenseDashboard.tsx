'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRealtime } from '@/hooks/useRealtime'
import { PopulatedExpense, MemberBalance, SettlementTransaction, PopulatedSettlement } from '@/types/expense'
import { PopulatedMember } from '@/types/expense'
import { formatCurrency, formatDate } from '@/lib/utils'
import ExpenseCard      from './ExpenseCard'
import AddExpenseModal  from './AddExpenseModal'
import BalancesView     from './BalancesView'
import SettleModal      from './SettleModal'
import PersonalExpenses from './PersonalExpenses'
import MyBalanceView    from './MyBalanceView'
import ViewExpenseModal from './ViewExpenseModal'
import { Plus, TrendingUp, TrendingDown, Wallet, History, RefreshCw, User, UserCheck, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, X, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'

interface DeleteLogSplit {
  memberName: string
  memberEmoji: string
  amount: number
}

interface DeleteLogEdit {
  editedBy: string
  editedAt: string
  changes: string
}

interface DeleteLogEntry {
  _id: string
  expenseTitle: string
  expenseAmount: number
  category: string
  paidByName: string
  paidByEmoji: string
  expenseDate: string
  expenseNote: string
  splitType: string
  splits: DeleteLogSplit[]
  editHistory: DeleteLogEdit[]
  deletedBy: string
  deletedAt: string
  splitCount: number
}

// View modal data shape
interface ViewData {
  title: string
  amount: number
  category: string
  paidByName: string
  paidByEmoji: string
  date: string
  note: string
  splitType: string
  splits: DeleteLogSplit[]
  editHistory: DeleteLogEdit[]
  isDeleted?: boolean
  deletedBy?: string
  deletedAt?: string
}

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

type Tab = 'expenses' | 'my' | 'balances' | 'personal' | 'history'

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
  const [refreshing, setRefreshing] = useState(false)
  const [deleteLogs,   setDeleteLogs]   = useState<DeleteLogEntry[]>([])
  const [viewData,     setViewData]     = useState<ViewData | null>(null)
  const [highlightId,  setHighlightId]  = useState<string | null>(null)

  // Group expenses date filter state
  const [sortOrder,  setSortOrder]  = useState<'desc' | 'asc'>('desc')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo,   setFilterTo]   = useState('')

  // Find current member ID from members list
  const currentMember = initialMembers.find(
    (m) => m.name.toLowerCase() === user?.name?.toLowerCase()
  )
  const currentMemberId = currentMember?._id ?? ''

  const refreshData = useCallback(async () => {
    const [expRes, balRes, setRes, delRes] = await Promise.all([
      fetch('/api/expenses'),
      fetch('/api/balances'),
      fetch('/api/settlements'),
      fetch('/api/delete-logs'),
    ])
    if (expRes.ok) { const d = await expRes.json(); setExpenses(d.expenses) }
    if (balRes.ok) { const d = await balRes.json(); setBalances(d) }
    if (setRes.ok) { const d = await setRes.json(); setSettlements(d.settlements) }
    if (delRes.ok) { const d = await delRes.json(); setDeleteLogs(d.logs) }
  }, [])

  useRealtime(['expense', 'settlement'], refreshData)

  // Fetch delete logs on mount
  useEffect(() => {
    fetch('/api/delete-logs')
      .then((r) => r.json())
      .then((d) => setDeleteLogs(d.logs ?? []))
      .catch(() => {})
  }, [])

  const navigateToExpense = (id: string) => {
    setActiveTab('expenses')
    setFilterFrom('')
    setFilterTo('')
    setHighlightId(id)
    setTimeout(() => {
      document.getElementById(`expense-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => setHighlightId(null), 2000)
    }, 100)
  }

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
    toast.success('Refreshed! 🔄', { duration: 1500 })
  }

  const handleViewExpense = (expense: PopulatedExpense) => {
    setViewData({
      title:       expense.title,
      amount:      expense.amount,
      category:    expense.category,
      paidByName:  expense.paidBy.name,
      paidByEmoji: expense.paidBy.emoji,
      date:        expense.date,
      note:        expense.note,
      splitType:   expense.splitType,
      splits:      expense.splits.map((s) => ({
        memberName:  s.member.name,
        memberEmoji: s.member.emoji,
        amount:      s.amount,
      })),
      editHistory: expense.editHistory.map((e) => ({
        editedBy: e.editedBy,
        editedAt: e.editedAt,
        changes:  e.changes,
      })),
    })
  }

  const handleViewDeleted = (log: DeleteLogEntry) => {
    setViewData({
      title:       log.expenseTitle,
      amount:      log.expenseAmount,
      category:    log.category,
      paidByName:  log.paidByName,
      paidByEmoji: log.paidByEmoji,
      date:        log.expenseDate,
      note:        log.expenseNote,
      splitType:   log.splitType,
      splits:      log.splits ?? [],
      editHistory: log.editHistory ?? [],
      isDeleted:   true,
      deletedBy:   log.deletedBy,
      deletedAt:   log.deletedAt,
    })
  }

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

  // Filtered + sorted group expenses
  const filteredExpenses = expenses
    .filter((e) => {
      const d = e.date.slice(0, 10)
      if (filterFrom && d < filterFrom) return false
      if (filterTo   && d > filterTo)   return false
      return true
    })
    .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
      return sortOrder === 'asc' ? diff : -diff
    })

  const hasDateFilter = filterFrom !== '' || filterTo !== ''

  // Unique sorted dates for quick-select chips
  const uniqueDates = Array.from(new Set(expenses.map((e) => e.date.slice(0, 10)))).sort()

  // Computed stats
  const totalSpent  = expenses.reduce((s, e) => s + e.amount, 0)
  const myBalance   = balances.memberBalances.find((m) => m._id === currentMemberId)
  const iOwe        = myBalance && myBalance.netBalance < 0 ? Math.abs(myBalance.netBalance) : 0
  const iGetBack    = myBalance && myBalance.netBalance > 0 ? myBalance.netBalance : 0

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'expenses', label: 'Group',     icon: <Wallet size={14} /> },
    { id: 'my',       label: 'Mine',      icon: <UserCheck size={14} /> },
    { id: 'balances', label: 'Balances',  icon: <TrendingUp size={14} /> },
    { id: 'personal', label: 'Personal',  icon: <User size={14} /> },
    { id: 'history',  label: 'History',   icon: <History size={14} /> },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl text-foreground">Expense Tracker 💸</h1>
          <p className="text-xs text-muted mt-0.5">7 log ka hisaab kitaab</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-subtle text-muted hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50"
            aria-label="Refresh expenses"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { setEditing(null); setShowAdd(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-primary-fg font-heading font-bold rounded-xl text-sm transition-all"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-subtle rounded-xl p-3 text-center card-hover">
          <Wallet size={14} className="mx-auto mb-1.5 text-foreground/60" />
          <p className="font-heading font-bold text-sm text-foreground">{formatCurrency(totalSpent)}</p>
          <p className="text-[10px] text-muted mt-0.5">Total Spent</p>
        </div>
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-center card-hover">
          <TrendingDown size={14} className="mx-auto mb-1.5 text-danger" />
          <p className="font-heading font-bold text-sm text-danger">{formatCurrency(iOwe)}</p>
          <p className="text-[10px] text-danger/70 mt-0.5">You Owe</p>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-center card-hover">
          <TrendingUp size={14} className="mx-auto mb-1.5 text-primary" />
          <p className="font-heading font-bold text-sm text-primary">{formatCurrency(iGetBack)}</p>
          <p className="text-[10px] text-primary/70 mt-0.5">Get Back</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-surface border border-subtle rounded-xl p-1 mb-5">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-primary text-primary-fg shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-subtle/50'
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
          {/* Date filter bar */}
          {expenses.length > 0 && (
            <div className="bg-surface border border-subtle rounded-xl p-3 space-y-2.5">
              {/* Sort + date range row */}
              <div className="flex items-center gap-2">
                <CalendarDays size={13} className="text-muted flex-shrink-0" />
                <button
                  onClick={() => setSortOrder((o) => o === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-subtle text-xs font-medium text-muted hover:text-primary hover:border-primary/40 transition-all flex-shrink-0"
                >
                  {sortOrder === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                  {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
                </button>
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <input
                    type="date"
                    value={filterFrom}
                    onChange={(e) => setFilterFrom(e.target.value)}
                    className="flex-1 min-w-0 text-[11px] bg-background border border-subtle rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary/50"
                    placeholder="From"
                  />
                  <span className="text-muted text-xs flex-shrink-0">–</span>
                  <input
                    type="date"
                    value={filterTo}
                    onChange={(e) => setFilterTo(e.target.value)}
                    className="flex-1 min-w-0 text-[11px] bg-background border border-subtle rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:border-primary/50"
                    placeholder="To"
                  />
                  {hasDateFilter && (
                    <button
                      onClick={() => { setFilterFrom(''); setFilterTo('') }}
                      className="flex-shrink-0 p-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                      title="Clear filter"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>
              {/* Quick date chips */}
              {uniqueDates.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {uniqueDates.map((d) => {
                    const isActive = filterFrom === d && filterTo === d
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          if (isActive) { setFilterFrom(''); setFilterTo('') }
                          else { setFilterFrom(d); setFilterTo(d) }
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                          isActive
                            ? 'bg-primary text-primary-fg border-primary'
                            : 'bg-background text-muted border-subtle hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </button>
                    )
                  })}
                </div>
              )}
              {/* Result count */}
              {hasDateFilter && (
                <p className="text-[10px] text-muted">
                  Showing {filteredExpenses.length} of {expenses.length} expenses
                </p>
              )}
            </div>
          )}

          {filteredExpenses.length === 0 ? (
            expenses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-2">🫙</p>
                <p className="font-heading font-bold text-primary">Abhi tak kuch nahi!</p>
                <p className="text-xs text-muted mt-1">
                  No expenses yet. Bhai trip pe gaye ho ya ghar pe baithe ho? 😂
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-4 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-xl text-sm font-medium"
                >
                  Add first expense +
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">📅</p>
                <p className="font-heading font-bold text-foreground">No expenses in this range</p>
                <p className="text-xs text-muted mt-1">Try adjusting the date filter</p>
                <button
                  onClick={() => { setFilterFrom(''); setFilterTo('') }}
                  className="mt-3 px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-medium"
                >
                  Clear filter
                </button>
              </div>
            )
          ) : (
            filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                currentMemberId={currentMemberId}
                onEdit={(e) => { setEditing(e); setShowAdd(true) }}
                onDelete={handleDelete}
                onView={handleViewExpense}
                isHighlighted={highlightId === expense._id}
              />
            ))
          )}
        </div>
      )}

      {/* My Balance — debts & credits only for current user */}
      {activeTab === 'my' && (
        <div className="animate-fade-in">
          <MyBalanceView
            memberBalances={balances.memberBalances}
            transactions={balances.transactions}
            currentMemberId={currentMemberId}
            onSettleUp={(t) => setSettleTarget(t)}
            expenses={expenses}
            onNavigate={navigateToExpense}
          />
        </div>
      )}

      {/* Personal */}
      {activeTab === 'personal' && (
        <div className="animate-fade-in">
          <PersonalExpenses />
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
              <p className="font-heading font-bold text-primary">Koi settlement nahi abhi</p>
              <p className="text-xs text-muted mt-1">Settlement history will appear here.</p>
            </div>
          ) : (
            settlements.map((s) => (
              <div key={s._id} className="bg-surface border border-subtle rounded-xl p-4 card-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.from.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {s.from.name} → {s.to.emoji} {s.to.name}
                      </p>
                      <p className="text-xs text-muted">{formatDate(s.settledAt)}</p>
                      {s.note && <p className="text-xs text-muted/60 italic mt-0.5">&ldquo;{s.note}&rdquo;</p>}
                    </div>
                  </div>
                  <p className="font-heading font-bold text-primary">{formatCurrency(s.amount)}</p>
                </div>
              </div>
            ))
          )}

          {/* Deleted expense logs */}
          {deleteLogs.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 size={13} className="text-danger/60" />
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider">Deleted Expenses</h3>
                <div className="flex-1 h-px bg-subtle" />
              </div>
              <div className="space-y-2">
                {deleteLogs.map((log) => (
                  <div
                    key={log._id}
                    className="bg-danger/[0.04] border border-danger/15 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-lg opacity-50">{log.paidByEmoji || '💼'}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground/70 line-through truncate">{log.expenseTitle}</p>
                        <p className="text-[10px] text-muted">
                          {log.paidByName} paid · {log.splitCount} split · deleted by <span className="text-danger/80 font-medium">{log.deletedBy}</span>
                        </p>
                        <p className="text-[10px] text-muted/60">{formatDate(log.deletedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewDeleted(log)}
                        className="p-1.5 rounded-lg bg-subtle hover:bg-info/20 hover:text-info text-muted transition-colors"
                        title="View details"
                      >
                        <Eye size={12} />
                      </button>
                      <p className="font-heading font-bold text-sm text-danger/50 line-through">
                        {formatCurrency(log.expenseAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

      {viewData && (
        <ViewExpenseModal
          data={viewData}
          onClose={() => setViewData(null)}
        />
      )}
    </div>
  )
}
