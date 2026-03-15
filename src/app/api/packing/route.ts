import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { PackingItem } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const items = await PackingItem.find({}).sort({ category: 1, order: 1 }).lean()
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { label, category, isGlobal } = await req.json()
    if (!label?.trim()) return NextResponse.json({ error: 'Label required' }, { status: 400 })

    await connectDB()
    const count = await PackingItem.countDocuments()
    const item  = await PackingItem.create({
      label:    label.trim(),
      category: category ?? 'misc',
      isGlobal: isGlobal ?? false,
      addedBy:  session.name ?? session.username,
      checkedBy: [],
      order:    count + 1,
    })

    await publishEvent('packing')
    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/packing]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
