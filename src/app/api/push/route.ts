import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { PushSubscription } from '@/lib/models'
import { getSession } from '@/lib/auth'

// POST /api/push — subscribe to push notifications
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subscription } = await req.json()
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    const memberName = session.name ?? session.username ?? 'Unknown'

    await connectDB()

    // Upsert — update if same endpoint exists, create if new
    await PushSubscription.findOneAndUpdate(
      { 'subscription.endpoint': subscription.endpoint },
      { memberName, subscription },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/push]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/push — unsubscribe
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'Endpoint required' }, { status: 400 })

    await connectDB()
    await PushSubscription.deleteOne({ 'subscription.endpoint': endpoint })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/push]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
