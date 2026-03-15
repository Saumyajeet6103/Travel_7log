import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Member } from '@/lib/models'
import { getSession } from '@/lib/auth'

// PATCH — admin only: update nickname and/or emoji
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only 🛡️' }, { status: 403 })

  try {
    const { nickname, emoji } = await req.json()
    await connectDB()

    const update: Record<string, string> = {}
    if (nickname !== undefined) update.nickname = nickname.trim()
    if (emoji    !== undefined) update.emoji    = emoji.trim()

    const updated = await Member.findByIdAndUpdate(
      params.id,
      update,
      { returnDocument: 'after' }
    )
    if (!updated) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    return NextResponse.json({ member: updated })
  } catch (err) {
    console.error('[PATCH /api/members/[id]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
