import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Poll } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

// GET /api/polls — list all polls (newest first)
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const polls = await Poll.find({}).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ polls })
}

// POST /api/polls — create a new poll
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { question, options, allowMultiple, isAnonymous, expiresAt } = await req.json()

    if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 })
    if (!options?.length || options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options required' }, { status: 400 })
    }

    await connectDB()

    const creatorName = session.name ?? session.username ?? 'Unknown'

    const poll = await Poll.create({
      question: question.trim(),
      options: options.map((text: string) => ({ text: text.trim(), votes: [] })),
      createdBy: creatorName,
      allowMultiple: allowMultiple ?? false,
      isAnonymous: isAnonymous ?? false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })

    await publishEvent('poll')
    return NextResponse.json({ poll }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/polls]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
