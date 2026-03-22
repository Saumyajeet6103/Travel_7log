import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User, Member } from '@/lib/models'
import { getSession, signToken } from '@/lib/auth'

// GET — fetch current user profile (user + linked member)
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.id).select('-passwordHash').lean()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let member = null
  if (user.memberId) {
    member = await Member.findById(user.memberId).lean()
  }

  return NextResponse.json({
    user: { ...user, _id: user._id.toString(), memberId: user.memberId?.toString() },
    member: member ? { ...member, _id: member._id.toString() } : null,
  })
}

// PUT — update profile (email, password, member name)
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, currentPassword, newPassword } = await req.json()
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  await connectDB()
  const user = await User.findById(session.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let needsSave = false

  // Update email
  if (email !== undefined) {
    const trimmed = email?.trim() || null
    if (trimmed && !EMAIL_RE.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    user.email = trimmed
    needsSave = true
  }

  // Change password
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password required' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is wrong bhai' }, { status: 400 })
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12)
    needsSave = true
  }

  if (needsSave) await user.save()

  // Refresh token with updated info
  let memberName = session.name
  if (user.memberId) {
    const member = await Member.findById(user.memberId)
    memberName = member?.name ?? user.username
  }

  const tokenPayload = {
    id: user._id.toString(),
    username: user.username,
    role: user.role as 'admin' | 'member',
    memberId: user.memberId?.toString(),
    name: memberName ?? user.username,
  }

  const token = signToken(tokenPayload)
  const response = NextResponse.json({ success: true, user: tokenPayload })
  response.cookies.set('7log_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
