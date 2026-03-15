import { connectDB } from '@/lib/db'
import { Member, Expense, Settlement } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { simplifyDebts } from '@/lib/utils'
import Navbar from '@/components/shared/Navbar'
import ExpenseDashboard from '@/components/expenses/ExpenseDashboard'

async function getData() {
  await connectDB()

  const [members, expenses, settlements] = await Promise.all([
    Member.find({}).sort({ name: 1 }).lean(),
    Expense.find({})
      .populate('paidBy', 'name emoji color nickname')
      .populate('splits.member', 'name emoji color nickname')
      .sort({ date: -1, createdAt: -1 })
      .lean(),
    Settlement.find({})
      .populate('from', 'name emoji color')
      .populate('to', 'name emoji color')
      .sort({ settledAt: -1 })
      .lean(),
  ])

  // Compute balances server-side for initial render
  const balanceMap: Record<string, number> = {}
  for (const m of members) balanceMap[m._id.toString()] = 0

  for (const e of expenses) {
    const pid = e.paidBy._id ? e.paidBy._id.toString() : e.paidBy.toString()
    if (balanceMap[pid] !== undefined) balanceMap[pid] += e.amount
    for (const split of e.splits) {
      const mid = split.member._id ? split.member._id.toString() : split.member.toString()
      if (balanceMap[mid] !== undefined) balanceMap[mid] -= split.amount
    }
  }

  for (const s of settlements) {
    const fid = s.from._id ? s.from._id.toString() : s.from.toString()
    const tid = s.to._id ? s.to._id.toString() : s.to.toString()
    if (balanceMap[fid] !== undefined) balanceMap[fid] += s.amount
    if (balanceMap[tid] !== undefined) balanceMap[tid] -= s.amount
  }

  const memberBalances = members.map((m) => ({
    _id:        m._id.toString(),
    name:       m.name,
    emoji:      m.emoji,
    color:      m.color,
    nickname:   m.nickname,
    totalPaid:  m.totalPaid,
    totalOwed:  m.totalOwed,
    netBalance: Math.round(balanceMap[m._id.toString()] ?? 0),
  }))

  const categoryTotals: Record<string, number> = {}
  for (const e of expenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount
  }

  const namedBalances: Record<string, number> = {}
  for (const m of memberBalances) namedBalances[m._id] = m.netBalance

  const transactions = simplifyDebts(namedBalances).map((t) => {
    const from = memberBalances.find((m) => m._id === t.from)
    const to   = memberBalances.find((m) => m._id === t.to)
    return { from: t.from, fromName: from?.name ?? '', fromEmoji: from?.emoji ?? '🧑',
             to: t.to, toName: to?.name ?? '', toEmoji: to?.emoji ?? '🧑', amount: t.amount }
  })

  return {
    members:     JSON.parse(JSON.stringify(members)),
    expenses:    JSON.parse(JSON.stringify(expenses)),
    settlements: JSON.parse(JSON.stringify(settlements)),
    balances:    { memberBalances, transactions, categoryTotals },
  }
}

export default async function ExpensesPage() {
  await getSession() // middleware already protects, but good practice
  const { members, expenses, settlements, balances } = await getData()

  return (
    <div className="min-h-screen bg-[#1A1A2E] pb-24 md:pb-6">
      <Navbar />
      <ExpenseDashboard
        initialMembers={members}
        initialExpenses={expenses}
        initialBalances={balances}
        initialSettlements={settlements}
      />
    </div>
  )
}
