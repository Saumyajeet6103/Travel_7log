import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Expense, Spot } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const [expenses, totalSpots, doneSpots] = await Promise.all([
    Expense.find({}).lean(),
    Spot.countDocuments(),
    Spot.countDocuments({ status: 'done' }),
  ])

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

  // Days to trip (March 25, 2026)
  const tripDate  = new Date('2026-03-25T00:00:00+05:30')
  const now       = new Date()
  const msLeft    = tripDate.getTime() - now.getTime()
  const daysLeft  = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))

  return NextResponse.json({
    totalSpent,
    totalSpots,
    doneSpots,
    daysLeft,
    expenseCount: expenses.length,
  })
}
