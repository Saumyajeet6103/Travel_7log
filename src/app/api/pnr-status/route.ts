import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pnr = req.nextUrl.searchParams.get('pnr')
  if (!pnr) return NextResponse.json({ error: 'PNR required' }, { status: 400 })

  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return NextResponse.json({ error: 'Railway API not configured' }, { status: 503 })

  try {
    const res = await fetch(
      `https://irctc1.p.rapidapi.com/api/v3/getPNRStatus?pnrNumber=${pnr}`,
      {
        headers: {
          'x-rapidapi-key':  apiKey,
          'x-rapidapi-host': 'irctc1.p.rapidapi.com',
        },
        next: { revalidate: 0 },
      }
    )

    const data = await res.json()

    if (!res.ok || data.status === false) {
      return NextResponse.json({ error: data.message ?? 'PNR fetch failed' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/pnr-status]', err)
    return NextResponse.json({ error: 'Railway API error' }, { status: 500 })
  }
}
