import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Spot } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const spots = await Spot.find({}).sort({ day: 1, order: 1 }).lean()
  return NextResponse.json({ spots })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, description, type, day, scheduledTime, funFact, order } = body

    if (!name?.trim()) return NextResponse.json({ error: 'Spot name required' }, { status: 400 })
    if (!day?.trim())  return NextResponse.json({ error: 'Day required' }, { status: 400 })

    await connectDB()
    const spot = await Spot.create({
      name:          name.trim(),
      description:   description?.trim() ?? '',
      type:          type ?? 'activity',
      day,
      scheduledTime: scheduledTime ?? '',
      funFact:       funFact?.trim() ?? '',
      order:         order ?? 0,
      status:        'planned',
      addedBy:       session.name ?? session.username,
    })

    await publishEvent('spot')
    return NextResponse.json({ spot }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/spots]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
