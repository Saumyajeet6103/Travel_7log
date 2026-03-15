import { NextResponse } from 'next/server'
import Ably from 'ably'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: 'Ably not configured' }, { status: 503 })
  }

  const ably = new Ably.Rest(process.env.ABLY_API_KEY)
  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: session.id,
  })

  return NextResponse.json(tokenRequest)
}
