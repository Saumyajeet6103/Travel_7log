import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { PersonalExpense } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  await connectDB()
  const expense = await PersonalExpense.findById(id)
  if (!expense) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (expense.userId.toString() !== session.id) {
    return NextResponse.json({ error: 'Not your expense' }, { status: 403 })
  }

  await expense.deleteOne()
  return NextResponse.json({ success: true })
}
