import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Expense, Member } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeEqualSplits(amount: number, memberIds: string[]) {
  const count     = memberIds.length
  const base      = Math.floor(amount / count)
  const remainder = amount - base * count
  return memberIds.map((memberId, i) => ({
    member:  memberId,
    amount:  i < remainder ? base + 1 : base,
    settled: false,
  }))
}

async function recomputeMemberTotals() {
  const [members, expenses] = await Promise.all([
    Member.find({}).lean(),
    Expense.find({}).lean(),
  ])

  const totals: Record<string, { paid: number; owed: number }> = {}
  for (const m of members) totals[m._id.toString()] = { paid: 0, owed: 0 }

  for (const e of expenses) {
    const pid = e.paidBy.toString()
    if (totals[pid]) totals[pid].paid += e.amount
    for (const split of e.splits) {
      const mid = split.member.toString()
      if (totals[mid]) totals[mid].owed += split.amount
    }
  }

  await Promise.all(
    Object.entries(totals).map(([id, { paid, owed }]) =>
      Member.findByIdAndUpdate(id, { totalPaid: paid, totalOwed: owed })
    )
  )
}

// ── GET /api/expenses ─────────────────────────────────────────────────────────

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const expenses = await Expense.find({})
    .populate('paidBy', 'name emoji color nickname')
    .populate('splits.member', 'name emoji color nickname')
    .sort({ date: -1, createdAt: -1 })
    .lean()

  return NextResponse.json({ expenses })
}

// ── POST /api/expenses ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, amount, paidBy, category, splitType, splitAmong, customSplits, date, note } =
      await req.json()

    if (!title?.trim())   return NextResponse.json({ error: 'Title required' }, { status: 400 })
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
    if (!paidBy)          return NextResponse.json({ error: 'Paid by required' }, { status: 400 })

    await connectDB()

    let splits: { member: string; amount: number; settled: boolean }[]

    if (splitType === 'custom') {
      if (!customSplits?.length) return NextResponse.json({ error: 'Custom splits required' }, { status: 400 })
      const splitTotal = customSplits.reduce((s: number, c: { amount: number }) => s + c.amount, 0)
      if (Math.abs(splitTotal - amount) > 1) {
        return NextResponse.json({ error: `Split total ₹${splitTotal} ≠ expense ₹${amount}` }, { status: 400 })
      }
      splits = customSplits.map((c: { member: string; amount: number }) => ({ ...c, settled: false }))
    } else {
      const among = splitAmong?.length ? splitAmong : await Member.distinct('_id').then(ids => ids.map(String))
      splits = computeEqualSplits(amount, among)
    }

    const expense = await Expense.create({
      title:     title.trim(),
      amount,
      paidBy,
      category:  category ?? 'misc',
      splitType: splitType ?? 'equal',
      splits,
      date:      date ? new Date(date) : new Date(),
      note:      note?.trim() ?? '',
      createdBy: session.id,
    })

    await recomputeMemberTotals()

    const populated = await Expense.findById(expense._id)
      .populate('paidBy', 'name emoji color nickname')
      .populate('splits.member', 'name emoji color nickname')
      .lean()

    await publishEvent('expense')
    return NextResponse.json({ expense: populated }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/expenses]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
