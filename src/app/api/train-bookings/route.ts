import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TrainBooking } from '@/lib/models'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const bookings = await TrainBooking.find({}).sort({ journeyDate: 1 }).lean()
  return NextResponse.json({ bookings })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  try {
    const { leg, trainNumber, trainName, pnr, fromStation, toStation, journeyDate } = await req.json()

    if (!leg?.trim())         return NextResponse.json({ error: 'Leg required' }, { status: 400 })
    if (!trainNumber?.trim()) return NextResponse.json({ error: 'Train number required' }, { status: 400 })
    if (!pnr?.trim())         return NextResponse.json({ error: 'PNR required' }, { status: 400 })
    if (!journeyDate)         return NextResponse.json({ error: 'Journey date required' }, { status: 400 })

    await connectDB()
    const booking = await TrainBooking.create({
      leg:         leg.trim(),
      trainNumber: trainNumber.trim(),
      trainName:   trainName?.trim() ?? '',
      pnr:         pnr.trim(),
      fromStation: fromStation?.trim() ?? '',
      toStation:   toStation?.trim() ?? '',
      journeyDate: new Date(journeyDate),
      addedBy:     session.name ?? session.username,
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/train-bookings]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
