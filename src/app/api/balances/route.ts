import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Member, Expense, Settlement } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { simplifyDebts } from '@/lib/utils'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const [members, expenses, settlements] = await Promise.all([
    Member.find({}).lean(),
    Expense.find({}).lean(),
    Settlement.find({}).lean(),
  ])

  // Init balance map
  const balanceMap: Record<string, number> = {}
  for (const m of members) balanceMap[m._id.toString()] = 0

  // Apply expenses
  for (const e of expenses) {
    const pid = e.paidBy.toString()
    if (balanceMap[pid] !== undefined) balanceMap[pid] += e.amount
    for (const split of e.splits) {
      const mid = split.member.toString()
      if (balanceMap[mid] !== undefined) balanceMap[mid] -= split.amount
    }
  }

  // Apply settlements
  for (const s of settlements) {
    const fid = s.from.toString()
    const tid = s.to.toString()
    if (balanceMap[fid] !== undefined) balanceMap[fid] += s.amount
    if (balanceMap[tid] !== undefined) balanceMap[tid] -= s.amount
  }

  // Build per-member result
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

  // Category breakdown
  const categoryTotals: Record<string, number> = {}
  for (const e of expenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount
  }

  // Simplified settlement suggestions
  const namedBalances: Record<string, number> = {}
  for (const m of memberBalances) namedBalances[m._id] = m.netBalance

  const transactions = simplifyDebts(namedBalances).map((t) => {
    const from = memberBalances.find((m) => m._id === t.from)
    const to   = memberBalances.find((m) => m._id === t.to)
    return {
      from:      t.from,
      fromName:  from?.name ?? '',
      fromEmoji: from?.emoji ?? '🧑',
      to:        t.to,
      toName:    to?.name ?? '',
      toEmoji:   to?.emoji ?? '🧑',
      amount:    t.amount,
    }
  })

  return NextResponse.json({ memberBalances, transactions, categoryTotals })
}
