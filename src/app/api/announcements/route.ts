import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Announcement } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'
import { sendPushToAll } from '@/lib/push'

// GET /api/announcements
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const announcements = await Announcement.find({})
    .sort({ pinned: -1, createdAt: -1 })
    .lean()

  return NextResponse.json({ announcements })
}

// POST /api/announcements — admin only
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  try {
    const { title, body, priority, pinned } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    await connectDB()

    const adminName = session.name ?? session.username ?? 'Admin'

    const announcement = await Announcement.create({
      title: title.trim(),
      body: body?.trim() ?? '',
      priority: priority ?? 'normal',
      createdBy: adminName,
      pinned: pinned ?? false,
    })

    await publishEvent('announcement')

    // Send push notification to all members
    const priorityEmoji = priority === 'urgent' ? '🚨' : priority === 'info' ? 'ℹ️' : '📢'
    await sendPushToAll({
      title: `${priorityEmoji} ${title.trim()}`,
      body: body?.trim() || 'New announcement from admin',
      url: '/',
      tag: `announcement-${announcement._id}`,
    })

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/announcements]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
