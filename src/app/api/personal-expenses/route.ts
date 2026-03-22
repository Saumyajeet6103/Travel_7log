import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { PersonalExpense } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const expenses = await PersonalExpense.find({ userId: session.id })
    .sort({ date: -1 })
    .lean()

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return NextResponse.json({ expenses, total })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, amount, category, date, note } = await req.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    await connectDB()
    const expense = await PersonalExpense.create({
      userId: session.id,
      title: title.trim(),
      amount,
      category: category || 'misc',
      date: date ? new Date(date) : new Date(),
      note: note?.trim() ?? '',
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/personal-expenses]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
