import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trainNo  = req.nextUrl.searchParams.get('train')
  const date     = req.nextUrl.searchParams.get('date')   // YYYYMMDD
  const startDay = req.nextUrl.searchParams.get('day') ?? '0' // 0=today, 1=yesterday, 2=day before

  if (!trainNo) return NextResponse.json({ error: 'Train number required' }, { status: 400 })

  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return NextResponse.json({ error: 'Railway API not configured' }, { status: 503 })

  try {
    const url = date
      ? `https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus?trainNo=${trainNo}&startDay=${startDay}`
      : `https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus?trainNo=${trainNo}&startDay=${startDay}`

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key':  apiKey,
        'x-rapidapi-host': 'irctc1.p.rapidapi.com',
      },
      next: { revalidate: 0 },
    })

    const data = await res.json()

    if (!res.ok || data.status === false) {
      return NextResponse.json({ error: data.message ?? 'Live status fetch failed' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/live-train]', err)
    return NextResponse.json({ error: 'Railway API error' }, { status: 500 })
  }
}
