import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User, Member } from '@/lib/models'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ username: username.toLowerCase().trim() })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. Bhai sahi naam daalo 🙄' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Wrong password. Try again, genius 🤦' }, { status: 401 })
    }

    let memberName: string | undefined
    if (user.memberId) {
      const member = await Member.findById(user.memberId)
      memberName = member?.name
    }

    const tokenPayload = {
      id:       user._id.toString(),
      username: user.username,
      role:     user.role as 'admin' | 'member',
      memberId: user.memberId?.toString(),
      name:     memberName ?? user.username,
    }

    const token = signToken(tokenPayload)

    const response = NextResponse.json({ success: true, user: tokenPayload })
    response.cookies.set('7log_session', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7, // 7 days
      path:     '/',
    })

    return response
  } catch (err) {
    console.error('[LOGIN]', err)
    return NextResponse.json({ error: 'Server error. Bhai kuch toh gadbad hai 😅' }, { status: 500 })
  }
}
