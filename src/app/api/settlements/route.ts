import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Settlement, Member } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const settlements = await Settlement.find({})
    .populate('from', 'name emoji color')
    .populate('to', 'name emoji color')
    .sort({ settledAt: -1 })
    .lean()

  return NextResponse.json({ settlements })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { from, to, amount, note } = await req.json()
    if (!from || !to || !amount || amount <= 0) {
      return NextResponse.json({ error: 'from, to and amount required' }, { status: 400 })
    }

    await connectDB()

    // Only the receiver (to) can confirm a settlement
    // Find the member linked to the current user
    const callerMember = await Member.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${session.name}$`, 'i') } },
      ],
    }).lean()

    if (!callerMember || callerMember._id.toString() !== to) {
      // Allow admin override
      if (session.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only the receiver can confirm settlement' },
          { status: 403 }
        )
      }
    }

    const settlement = await Settlement.create({
      from, to, amount,
      note:       note?.trim() ?? '',
      recordedBy: session.id,
      settledAt:  new Date(),
    })

    const populated = await Settlement.findById(settlement._id)
      .populate('from', 'name emoji color')
      .populate('to', 'name emoji color')
      .lean()

    await publishEvent('settlement')
    return NextResponse.json({ settlement: populated }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/settlements]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
