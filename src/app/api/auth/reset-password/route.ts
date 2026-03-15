import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User, OtpToken } from '@/lib/models'

export async function POST(req: NextRequest) {
  try {
    const { username, otp, newPassword } = await req.json()

    if (!username?.trim() || !otp?.trim() || !newPassword?.trim()) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ username: username.trim().toLowerCase() })
    if (!user) {
      return NextResponse.json({ error: 'Invalid OTP or username ❌' }, { status: 400 })
    }

    // Find most recent valid OTP
    const tokenDoc = await OtpToken.findOne({
      userId:    user._id,
      used:      false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    if (!tokenDoc) {
      return NextResponse.json({ error: 'OTP expired or not found. Request a new one.' }, { status: 400 })
    }

    const valid = await bcrypt.compare(otp.trim(), tokenDoc.otpHash)
    if (!valid) {
      return NextResponse.json({ error: 'Wrong OTP bhai. Try again. 🙅' }, { status: 400 })
    }

    // Mark OTP used + update password atomically
    const newHash = await bcrypt.hash(newPassword, 12)
    await Promise.all([
      OtpToken.findByIdAndUpdate(tokenDoc._id, { used: true }),
      User.findByIdAndUpdate(user._id, { passwordHash: newHash }),
    ])

    return NextResponse.json({ success: true, message: 'Password reset! Login karo ab. 🎉' })
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
