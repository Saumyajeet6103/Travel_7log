import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Member } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const members = await Member.find({}).sort({ name: 1 }).lean()
  return NextResponse.json({ members })
}
