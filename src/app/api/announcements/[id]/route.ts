import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Announcement } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

// PUT /api/announcements/[id] — mark as read (dismiss)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const memberName = session.name ?? session.username ?? 'Unknown'

    await Announcement.findByIdAndUpdate(params.id, {
      $addToSet: { readBy: memberName },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PUT /api/announcements/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/announcements/[id] — admin only
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  try {
    await connectDB()
    await Announcement.findByIdAndDelete(params.id)
    await publishEvent('announcement')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/announcements/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
