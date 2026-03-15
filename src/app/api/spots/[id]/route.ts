import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Spot } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

// PUT — any member can update status; admin can edit all fields
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const spot = await Spot.findById(params.id)
    if (!spot) return NextResponse.json({ error: 'Spot not found' }, { status: 404 })

    const body = await req.json()

    const memberName = session.name ?? session.username
    const canEditAll = session.role === 'admin' || spot.addedBy === memberName

    if (canEditAll) {
      // Admin or spot creator can edit all fields
      const { name, description, type, day, scheduledTime, funFact, order, status, markedBy } = body
      await Spot.findByIdAndUpdate(params.id, {
        ...(name          !== undefined && { name: name.trim() }),
        ...(description   !== undefined && { description: description.trim() }),
        ...(type          !== undefined && { type }),
        ...(day           !== undefined && { day }),
        ...(scheduledTime !== undefined && { scheduledTime }),
        ...(funFact       !== undefined && { funFact: funFact.trim() }),
        ...(order         !== undefined && { order }),
        ...(status        !== undefined && { status }),
        ...(markedBy      !== undefined && { markedBy }),
      })
    } else {
      // Other members can only update status
      const { status, markedBy } = body
      if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 })
      const VALID = ['planned', 'in-progress', 'done', 'skipped']
      if (!VALID.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      await Spot.findByIdAndUpdate(params.id, { status, markedBy: markedBy ?? memberName })
    }

    const updated = await Spot.findById(params.id).lean()
    await publishEvent('spot')
    return NextResponse.json({ spot: updated })
  } catch (err) {
    console.error('[PUT /api/spots/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — admin or spot creator
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const spot = await Spot.findById(params.id)
    if (!spot) return NextResponse.json({ error: 'Spot not found' }, { status: 404 })

    const memberName = session.name ?? session.username
    if (session.role !== 'admin' && spot.addedBy !== memberName) {
      return NextResponse.json({ error: 'Sirf apno spot delete kar bhai 🙏' }, { status: 403 })
    }

    await Spot.findByIdAndDelete(params.id)
    await publishEvent('spot')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/spots/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
