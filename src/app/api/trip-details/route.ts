import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TripDetail } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const details = await TripDetail.find({}).sort({ order: 1 }).lean()
  return NextResponse.json({ details })
}
