import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { PackingItem } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

// PUT — toggle member's check on an item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const item = await PackingItem.findById(params.id)
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    const memberName = session.name ?? session.username
    const { checked } = await req.json()

    let updatedCheckedBy: string[]
    if (checked) {
      updatedCheckedBy = Array.from(new Set([...item.checkedBy, memberName]))
    } else {
      updatedCheckedBy = item.checkedBy.filter((n: string) => n !== memberName)
    }

    const updated = await PackingItem.findByIdAndUpdate(
      params.id,
      { checkedBy: updatedCheckedBy },
      { returnDocument: 'after' }
    )

    await publishEvent('packing')
    return NextResponse.json({ item: updated })
  } catch (err) {
    console.error('[PUT /api/packing/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE — admin or the person who added it
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const item = await PackingItem.findById(params.id)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const memberName = session.name ?? session.username
    if (session.role !== 'admin' && item.addedBy !== memberName) {
      return NextResponse.json({ error: 'Sirf apna item delete kar 🙏' }, { status: 403 })
    }

    await PackingItem.findByIdAndDelete(params.id)
    await publishEvent('packing')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/packing/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
