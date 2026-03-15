import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import { connectDB } from '@/lib/db'
import { User, OtpToken } from '@/lib/models'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()
    if (!username?.trim()) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ username: username.trim().toLowerCase() })

    if (!user) {
      // Don't reveal if username exists — but for private app just say not found
      return NextResponse.json({ error: 'Username milyo nahi 🙅 Check kar.' }, { status: 404 })
    }

    // Invalidate existing unused OTPs for this user
    await OtpToken.deleteMany({ userId: user._id, used: false })

    const otp = generateOtp()
    const otpHash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await OtpToken.create({ userId: user._id, otpHash, expiresAt, used: false })

    // Try to send email — only if user has email set
    let emailSent = false
    try {
      if (!user.email) throw new Error('No email set for this user')
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? '7 Log <onboarding@resend.dev>',
        to: user.email,
        subject: '🔑 Your 7 Log Password Reset OTP',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #16213E; padding: 32px; border-radius: 16px; color: #E8F5E9;">
            <h1 style="font-size: 28px; margin: 0 0 4px; color: #52B788;">7 Log 🏔️</h1>
            <p style="color: #A0AEC0; font-size: 13px; margin: 0 0 28px;">Matheran 2026</p>
            <p style="margin: 0 0 12px;">Koi password bhool gaya? No worries, happens to the best of us (looking at you, Harshal).</p>
            <p style="margin: 0 0 20px; color: #A0AEC0; font-size: 14px;">Your one-time password is:</p>
            <div style="background: #0F3460; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; letter-spacing: 8px; font-size: 36px; font-weight: bold; color: #52B788; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #A0AEC0; font-size: 13px; margin: 0 0 8px;">⏱️ This OTP expires in <strong style="color: #F4A261;">10 minutes</strong>.</p>
            <p style="color: #A0AEC0; font-size: 13px; margin: 0;">If you didn't request this, ignore this email. Or blame Sarthak.</p>
            <hr style="border: none; border-top: 1px solid #0F3460; margin: 28px 0;" />
            <p style="color: #0F3460; font-size: 11px; text-align: center; margin: 0;">7 Log · Matheran 2026 · Private Trip App</p>
          </div>
        `,
      })
      if (result.error) {
        console.warn('[forgot-password] Resend error:', result.error)
      } else {
        emailSent = true
      }
    } catch (emailErr) {
      console.warn('[forgot-password] Email send failed:', emailErr)
    }

    // For this private 7-person app: always return OTP so it works regardless of email setup
    return NextResponse.json({
      success: true,
      otp,          // shown directly in UI — private app, 7 friends only
      emailSent,
      message: emailSent ? 'OTP sent to registered email.' : 'Email send failed — OTP shown below.',
    })
  } catch (err) {
    console.error('[POST /api/auth/forgot-password]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
