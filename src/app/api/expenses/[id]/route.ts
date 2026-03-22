import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Expense, Member, DeleteLog } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

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

// ── PUT /api/expenses/[id] ────────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const expense = await Expense.findById(params.id)
    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 })

    const { title, amount, paidBy, category, splitType, splitAmong, customSplits, date, note } =
      await req.json()

    let splits = expense.splits
    if (splitType === 'custom' && customSplits?.length) {
      splits = customSplits.map((c: { member: string; amount: number }) => ({ ...c, settled: false }))
    } else if (splitType === 'equal' && splitAmong?.length) {
      const count     = splitAmong.length
      const base      = Math.floor(amount / count)
      const remainder = amount - base * count
      splits = splitAmong.map((memberId: string, i: number) => ({
        member: memberId, amount: i < remainder ? base + 1 : base, settled: false,
      }))
    }

    // Build edit summary
    const changes: string[] = []
    if (title && title !== expense.title) changes.push(`title: "${expense.title}"→"${title}"`)
    if (amount && amount !== expense.amount) changes.push(`amount: ₹${expense.amount}→₹${amount}`)
    if (category && category !== expense.category) changes.push(`category: ${expense.category}→${category}`)
    if (splitType && splitType !== expense.splitType) changes.push(`split: ${expense.splitType}→${splitType}`)
    const changeSummary = changes.length > 0 ? changes.join(', ') : 'updated'

    // Get editor name from session
    const editorName = session.name ?? session.username ?? 'Unknown'

    await Expense.findByIdAndUpdate(params.id, {
      title, amount, paidBy, category, splitType, splits,
      date: date ? new Date(date) : expense.date,
      note: note ?? expense.note,
      lastEditedBy: editorName,
      $push: {
        editHistory: {
          editedBy: editorName,
          editedAt: new Date(),
          changes: changeSummary,
        },
      },
    })

    await recomputeMemberTotals()

    const updated = await Expense.findById(params.id)
      .populate('paidBy', 'name emoji color nickname')
      .populate('splits.member', 'name emoji color nickname')
      .lean()

    await publishEvent('expense')
    return NextResponse.json({ expense: updated })
  } catch (err) {
    console.error('[PUT /api/expenses/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// ── DELETE /api/expenses/[id] ─────────────────────────────────────────────────

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const expense = await Expense.findById(params.id)
    if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Members can only delete their own; admin can delete any
    if (session.role !== 'admin' && expense.createdBy.toString() !== session.id) {
      return NextResponse.json({ error: 'Sirf apna khud ka expense delete kar bhai 🙏' }, { status: 403 })
    }

    // Get full expense with populated splits for the snapshot
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populated: any = await Expense.findById(params.id)
      .populate('paidBy', 'name emoji')
      .populate('splits.member', 'name emoji')
      .lean()

    const deleterName = session.name ?? session.username ?? 'Unknown'

    // Log the deletion with full snapshot
    await DeleteLog.create({
      expenseTitle:  expense.title,
      expenseAmount: expense.amount,
      category:      expense.category,
      paidByName:    populated?.paidBy?.name ?? 'Unknown',
      paidByEmoji:   populated?.paidBy?.emoji ?? '',
      expenseDate:   expense.date,
      expenseNote:   expense.note,
      splitType:     expense.splitType,
      splits: (populated?.splits ?? []).map((s: { member: { name?: string; emoji?: string }; amount: number }) => ({
        memberName:  s.member?.name ?? 'Unknown',
        memberEmoji: s.member?.emoji ?? '',
        amount:      s.amount,
      })),
      editHistory: expense.editHistory ?? [],
      deletedBy:     deleterName,
      deletedAt:     new Date(),
      splitCount:    expense.splits.length,
    })

    await Expense.findByIdAndDelete(params.id)
    await recomputeMemberTotals()
    await publishEvent('expense')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/expenses/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
