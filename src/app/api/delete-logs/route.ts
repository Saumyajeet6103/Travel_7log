import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { DeleteLog } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const logs = await DeleteLog.find({})
    .sort({ deletedAt: -1 })
    .limit(50)
    .lean()

  return NextResponse.json({ logs })
}
