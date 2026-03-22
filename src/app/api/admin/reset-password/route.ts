import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models'
import { getSession } from '@/lib/auth'

// POST — admin resets any user's password directly (no OTP needed)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { userId, newPassword } = await req.json()
  if (!userId || !newPassword?.trim()) {
    return NextResponse.json({ error: 'userId and newPassword required' }, { status: 400 })
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  await connectDB()
  const user = await User.findById(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  await user.save()

  return NextResponse.json({ success: true, message: `Password reset for ${user.username}` })
}
