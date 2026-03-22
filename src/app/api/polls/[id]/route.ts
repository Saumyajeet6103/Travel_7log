import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Poll } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

// DELETE /api/polls/[id] — delete a poll (admin or creator)
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const poll = await Poll.findById(params.id)
    if (!poll) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can delete polls' }, { status: 403 })
    }

    await Poll.findByIdAndDelete(params.id)
    await publishEvent('poll')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/polls/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
