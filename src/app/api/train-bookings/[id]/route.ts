import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TrainBooking } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  try {
    await connectDB()
    await TrainBooking.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/train-bookings/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
