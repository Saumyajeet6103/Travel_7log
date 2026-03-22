import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { User, Member } from '@/lib/models'
import { getSession } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST — admin creates a new user account
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const { username, password, role, memberId, email } = await req.json()

  if (!username?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }
  if (username.trim().length < 3 || username.trim().length > 30) {
    return NextResponse.json({ error: 'Username must be 3-30 characters' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }
  if (role && !['admin', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Role must be admin or member' }, { status: 400 })
  }
  if (email && !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  await connectDB()

  // Check duplicate username
  const existing = await User.findOne({ username: username.trim().toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
  }

  // Validate memberId if provided
  if (memberId) {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 })
    }
    const member = await Member.findById(memberId)
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }
    const linkedUser = await User.findOne({ memberId })
    if (linkedUser) {
      return NextResponse.json({ error: `Member already linked to user "${linkedUser.username}"` }, { status: 409 })
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const newUser = await User.create({
    username: username.trim().toLowerCase(),
    passwordHash,
    role: role || 'member',
    memberId: memberId || null,
    email: email?.trim() || null,
  })

  return NextResponse.json({
    success: true,
    user: {
      _id: newUser._id.toString(),
      username: newUser.username,
      role: newUser.role,
      email: newUser.email,
    },
  })
}
