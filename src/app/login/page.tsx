'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff, Mountain, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const TAGLINES = [
  'Members only. Bahar wale door raho. 🚧',
  'Apna username daalo, bhai. 🔑',
  '7 log, 1 trip, 1 app. Login karo. 🏔️',
  'Password bhool gaye? Koi nahi hota. 😌',
]

// ── Main login form ────────────────────────────────────────────────────────────
function LoginForm({ onForgot }: { onForgot: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [tagline]               = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)])

  const router       = useRouter()
  const searchParams = useSearchParams()
  const { refresh }  = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Bhai dono fields bharo please 🙏')
      return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Login failed'); return }
      await refresh()
      toast.success(`Welcome back, ${data.user.name}! 🎉`)
      const from = searchParams.get('from') ?? '/'
      router.push(from)
      router.refresh()
    } catch {
      toast.error('Network error. Check your connection 📶')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Mountain size={32} className="text-[#52B788]" />
          <h1 className="font-heading font-bold text-3xl text-[#52B788]">7 Log</h1>
        </div>
        <p className="text-[#A0AEC0] text-sm">Matheran 2026 🏔️</p>
        <div className="mt-4 px-4 py-2 bg-[#0F3460]/60 rounded-lg">
          <p className="text-xs text-[#A0AEC0] italic">{tagline}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. saumyajeet"
            autoComplete="username"
            className="w-full px-4 py-3 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788] transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-11 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788] transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#E8F5E9] transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-heading font-bold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
        >
          {loading ? 'Logging in...' : 'Login Karo 🚀'}
        </button>
      </form>

      <div className="mt-5 text-center">
        <button
          onClick={onForgot}
          className="text-xs text-[#A0AEC0] hover:text-[#52B788] transition-colors underline underline-offset-2"
        >
          Forgot password? 😬
        </button>
      </div>
    </>
  )
}

// ── Step 1: Enter username to request OTP ─────────────────────────────────────
function ForgotStep1({ onNext, onBack }: { onNext: (username: string, otp?: string, emailSent?: boolean) => void; onBack: () => void }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim()) { toast.error('Username daalo bhai 🙏'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: username.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      if (data.emailSent) {
        toast.success('OTP bheja! Check your email 📬')
      } else {
        toast('OTP ready! Email kaam nahi karta — niche dekh 👇', { icon: '📋', duration: 5000 })
      }
      onNext(username.trim(), data.otp, data.emailSent)
    } catch {
      toast.error('Network error 📶')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#A0AEC0] hover:text-[#E8F5E9] mb-6 transition-colors">
        <ArrowLeft size={13} /> Back to login
      </button>

      <div className="text-center mb-8">
        <div className="text-4xl mb-3 animate-float inline-block">🔑</div>
        <h2 className="font-heading font-bold text-xl text-[#E8F5E9]">Password Reset</h2>
        <p className="text-xs text-[#A0AEC0] mt-2">
          Tera username daalo. OTP jayega teri registered email pe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. saumyajeet"
            autoFocus
            className="w-full px-4 py-3 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788] transition-colors text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-heading font-bold rounded-xl transition-all disabled:opacity-60 text-sm"
        >
          {loading ? 'Sending OTP...' : 'Send OTP 📬'}
        </button>
      </form>
    </>
  )
}

// ── Step 2: Enter OTP + new password ─────────────────────────────────────────
function ForgotStep2({ username, prefillOtp, emailSent, onBack, onDone }: { username: string; prefillOtp?: string; emailSent?: boolean; onBack: () => void; onDone: () => void }) {
  const [otp, setOtp]             = useState(prefillOtp ?? '')
  const [newPass, setNewPass]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!otp.trim() || !newPass.trim()) { toast.error('Sab fields bharo 🙏'); return }
    if (newPass.length < 6) { toast.error('Password kam se kam 6 characters ka hona chahiye'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, otp: otp.trim(), newPassword: newPass }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      toast.success('Password reset! Ab login kar. 🎉', { duration: 4000 })
      onDone()
    } catch {
      toast.error('Network error 📶')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setResending(true)
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.otp) setOtp(data.otp)
        toast.success(data.emailSent ? 'New OTP sent! 📬' : 'New OTP ready! 📋')
      } else {
        toast.error('Resend failed. Try again.')
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#A0AEC0] hover:text-[#E8F5E9] mb-6 transition-colors">
        <ArrowLeft size={13} /> Different username
      </button>

      <div className="text-center mb-6">
        <div className="text-4xl mb-3">📬</div>
        <h2 className="font-heading font-bold text-xl text-[#E8F5E9]">Enter OTP</h2>
        <p className="text-xs text-[#A0AEC0] mt-2">
          {emailSent
            ? <>OTP gayo <span className="text-[#52B788] font-medium">{username}</span> ni email pe. Check karo (spam folder bhi 🙃).</>
            : <>Email send nahi thayo. Niche taro OTP chhe — copy karo ane use karo. 👇</>
          }
        </p>
      </div>

      {/* Show OTP directly when email didn't work */}
      {prefillOtp && !emailSent && (
        <div className="mb-4 p-4 bg-[#52B788]/10 border border-[#52B788]/40 rounded-xl text-center">
          <p className="text-xs text-[#A0AEC0] mb-2">Taro OTP (auto-filled below):</p>
          <p className="font-mono font-bold text-3xl text-[#52B788] tracking-[0.5em]">{prefillOtp}</p>
          <p className="text-[10px] text-[#A0AEC0] mt-2 italic">10 minutes ma expire thashe</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">6-digit OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            inputMode="numeric"
            autoFocus
            className="w-full px-4 py-3 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788] transition-colors text-sm text-center tracking-[0.4em] font-mono text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 pr-11 bg-[#1A1A2E] border border-[#0F3460] rounded-xl text-[#E8F5E9] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788] transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#E8F5E9] transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-heading font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Resetting...' : 'Reset Password ✅'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={resendOtp}
          disabled={resending}
          className="text-xs text-[#A0AEC0] hover:text-[#52B788] transition-colors underline underline-offset-2 disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </>
  )
}

// ── Root component with flow state ────────────────────────────────────────────
type Flow = 'login' | 'forgot-step1' | 'forgot-step2'

function LoginContainer() {
  const [flow, setFlow]             = useState<Flow>('login')
  const [forgotUser, setForgotUser] = useState('')
  const [prefillOtp, setPrefillOtp] = useState<string | undefined>()
  const [emailSent, setEmailSent]   = useState<boolean | undefined>()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A2E] px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#52B788]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#F4A261]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-[#16213E] border border-[#0F3460] rounded-2xl p-8 shadow-2xl">
          {flow === 'login' && (
            <LoginForm onForgot={() => setFlow('forgot-step1')} />
          )}
          {flow === 'forgot-step1' && (
            <ForgotStep1
              onBack={() => setFlow('login')}
              onNext={(u, otp, sent) => {
                setForgotUser(u)
                setPrefillOtp(otp)
                setEmailSent(sent)
                setFlow('forgot-step2')
              }}
            />
          )}
          {flow === 'forgot-step2' && (
            <ForgotStep2
              username={forgotUser}
              prefillOtp={prefillOtp}
              emailSent={emailSent}
              onBack={() => setFlow('forgot-step1')}
              onDone={() => setFlow('login')}
            />
          )}
        </div>
        <p className="text-center text-[10px] text-[#A0AEC0]/50 mt-4">
          Made with ☕ and lack of sleep · 7 Log © 2026
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContainer />
    </Suspense>
  )
}
