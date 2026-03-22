import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Poll } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { publishEvent } from '@/lib/ably-server'

// POST /api/polls/[id]/vote — cast a vote
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { optionIndex } = await req.json()
    if (typeof optionIndex !== 'number') {
      return NextResponse.json({ error: 'optionIndex required' }, { status: 400 })
    }

    await connectDB()

    const poll = await Poll.findById(params.id)
    if (!poll) return NextResponse.json({ error: 'Poll not found' }, { status: 404 })

    // Check expiry
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return NextResponse.json({ error: 'Poll has expired' }, { status: 400 })
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 })
    }

    const voterName = session.name ?? session.username ?? 'Unknown'

    // Toggle vote: if already voted on this option, remove vote
    const option = poll.options[optionIndex]
    const alreadyVoted = option.votes.includes(voterName)

    if (alreadyVoted) {
      // Remove vote
      option.votes = option.votes.filter((v) => v !== voterName)
    } else {
      // If not allowMultiple, remove vote from other options first
      if (!poll.allowMultiple) {
        for (const opt of poll.options) {
          opt.votes = opt.votes.filter((v) => v !== voterName)
        }
      }
      option.votes.push(voterName)
    }

    await poll.save()
    await publishEvent('poll')

    return NextResponse.json({ poll: poll.toObject() })
  } catch (err) {
    console.error('[POST /api/polls/[id]/vote]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
