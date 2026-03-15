import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TripDetail } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { section: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only 🛡️' }, { status: 403 })

  try {
    const { content, title } = await req.json()
    await connectDB()

    const updated = await TripDetail.findOneAndUpdate(
      { section: params.section },
      {
        ...(content !== undefined && { content }),
        ...(title   !== undefined && { title }),
        updatedBy: session.id,
      },
      { returnDocument: 'after' }
    )

    if (!updated) return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    return NextResponse.json({ detail: updated })
  } catch (err) {
    console.error('[PUT /api/trip-details/[section]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
