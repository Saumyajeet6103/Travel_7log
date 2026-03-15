import { connectDB } from '@/lib/db'
import { Member, Expense, Spot } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Navbar from '@/components/shared/Navbar'
import CountdownTimer from '@/components/shared/CountdownTimer'
import FunTicker from '@/components/shared/FunTicker'
import { TrendingUp, CheckCircle, Calendar } from 'lucide-react'
import Link from 'next/link'

async function getData() {
  await connectDB()
  const [members, expenses, totalSpots, doneSpots] = await Promise.all([
    Member.find({}).sort({ name: 1 }).lean(),
    Expense.find({}).lean(),
    Spot.countDocuments(),
    Spot.countDocuments({ status: 'done' }),
  ])
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  return { members, totalSpent, totalSpots, doneSpots }
}

export default async function HomePage() {
  const session = await getSession()
  const { members, totalSpent, totalSpots, doneSpots } = await getData()

  const MODULE_CARDS = [
    {
      href:    '/expenses',
      icon:    '💸',
      label:   'Expense Tracker',
      desc:    'Splitwise for 7 pagal log. Track who paid, who owes, who\'s being suspiciously quiet.',
      color:   'from-[#52B788]/20 to-[#2D6A4F]/10',
      border:  'border-[#52B788]/30',
      accent:  '#52B788',
    },
    {
      href:    '/itinerary',
      icon:    '🗺️',
      label:   'Itinerary',
      desc:    'Every spot, every plan. Mark done when you actually visit (or skip, we don\'t judge).',
      color:   'from-[#2D9CDB]/20 to-[#0077B6]/10',
      border:  'border-[#2D9CDB]/30',
      accent:  '#2D9CDB',
    },
    {
      href:    '/trip-details',
      icon:    '🚂',
      label:   'Trip Details',
      desc:    'Trains, stays, rules, packing list. Everything you need. Read it. No excuses.',
      color:   'from-[#F4A261]/20 to-[#E76F51]/10',
      border:  'border-[#F4A261]/30',
      accent:  '#F4A261',
    },
  ]

  return (
    <div className="min-h-screen bg-[#1A1A2E] pb-20 md:pb-0">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-10 pb-12 text-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#52B788]/8 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-64 h-64 bg-[#F4A261]/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-[#52B788]/15 border border-[#52B788]/30 text-[#52B788] text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-pulse" />
            March 25–30, 2026 · Vadodara → Mumbai → Matheran
          </div>

          <h1 className="font-heading font-black text-6xl md:text-8xl text-[#E8F5E9] mb-2 tracking-tight">
            7 <span className="text-[#52B788]">LOG</span>
          </h1>
          <p className="font-heading text-xl md:text-2xl text-[#F4A261] font-semibold mb-2">
            MATHERAN 2026
          </p>
          <p className="text-[#A0AEC0] text-sm md:text-base max-w-md mx-auto mb-8">
            7 dost, 1 hill station, infinite chaos. Koi plan nahi, bas excitement hai. 🏔️
          </p>

          {/* Countdown */}
          <div className="mb-8">
            <p className="text-xs text-[#A0AEC0] uppercase tracking-widest mb-3">
              Trip starts in
            </p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* ── Fun Ticker ───────────────────────────────────────────────── */}
      <div className="px-4 max-w-4xl mx-auto">
        <FunTicker />
      </div>

      {/* ── Quick Stats ──────────────────────────────────────────────── */}
      <section className="px-4 max-w-4xl mx-auto mb-12">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp,    label: 'Total Spent',    value: formatCurrency(totalSpent), color: '#52B788' },
            { icon: CheckCircle,   label: 'Spots Done',     value: `${doneSpots}/${totalSpots}`, color: '#2D9CDB' },
            { icon: Calendar,      label: 'Trip Duration',  value: '5 Nights',  color: '#F4A261' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-[#16213E] border border-[#0F3460] rounded-xl p-4 text-center"
            >
              <Icon size={18} style={{ color }} className="mx-auto mb-2" />
              <p className="font-heading font-bold text-lg" style={{ color }}>{value}</p>
              <p className="text-[10px] text-[#A0AEC0] uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Squad ────────────────────────────────────────────────── */}
      <section className="px-4 max-w-4xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-heading font-bold text-xl text-[#E8F5E9]">The Squad 🫂</h2>
          <div className="flex-1 h-px bg-[#0F3460]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {members.map((m) => {
            const isCurrentUser = session?.name === m.name
            return (
              <div
                key={m._id.toString()}
                className={`relative bg-[#16213E] border rounded-xl p-4 text-center transition-all hover:scale-[1.02] hover:shadow-lg ${
                  isCurrentUser ? 'border-[#52B788]/60 shadow-[0_0_15px_rgba(82,183,136,0.1)]' : 'border-[#0F3460]'
                }`}
              >
                {isCurrentUser && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#52B788] text-[#1A1A2E] text-[9px] font-bold px-2 py-0.5 rounded-full">
                    YOU
                  </div>
                )}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 border-2"
                  style={{ borderColor: m.color + '60', backgroundColor: m.color + '20' }}
                >
                  {m.emoji}
                </div>
                <p className="font-heading font-bold text-sm text-[#E8F5E9]">{m.name}</p>
                {m.nickname ? (
                  <p className="text-[10px] text-[#A0AEC0] mt-0.5 italic leading-tight">
                    &ldquo;{m.nickname}&rdquo;
                  </p>
                ) : (
                  <p className="text-[10px] text-[#0F3460] mt-0.5 italic">no nickname yet</p>
                )}
                <div
                  className="mt-2 h-0.5 rounded-full w-8 mx-auto"
                  style={{ backgroundColor: m.color }}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Module Nav Cards ─────────────────────────────────────────── */}
      <section className="px-4 max-w-4xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-heading font-bold text-xl text-[#E8F5E9]">What do you need? 🛠️</h2>
          <div className="flex-1 h-px bg-[#0F3460]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODULE_CARDS.map(({ href, icon, label, desc, color, border, accent }) => (
            <Link
              key={href}
              href={href}
              className={`group bg-gradient-to-br ${color} border ${border} rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200 hover:shadow-xl`}
            >
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-heading font-bold text-base text-[#E8F5E9] mb-1.5 group-hover:text-white">
                {label}
              </h3>
              <p className="text-xs text-[#A0AEC0] leading-relaxed">{desc}</p>
              <div
                className="mt-4 flex items-center gap-1.5 text-xs font-medium"
                style={{ color: accent }}
              >
                Open <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trip Timeline Strip ──────────────────────────────────────── */}
      <section className="px-4 max-w-4xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-heading font-bold text-xl text-[#E8F5E9]">Trip at a Glance 📅</h2>
          <div className="flex-1 h-px bg-[#0F3460]" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { date: 'Mar 25', day: 'Fri', label: 'Depart Vadodara', emoji: '🚂', color: '#9B5DE5' },
            { date: 'Mar 26', day: 'Sat', label: 'Arrive Matheran', emoji: '🏔️', color: '#52B788' },
            { date: 'Mar 27', day: 'Sun', label: 'Matheran Day 2',  emoji: '🌅', color: '#52B788' },
            { date: 'Mar 28', day: 'Mon', label: 'Back to Mumbai',  emoji: '🏙️', color: '#2D9CDB' },
            { date: 'Mar 29', day: 'Tue', label: 'Explore Mumbai',  emoji: '🌆', color: '#F4A261' },
            { date: 'Mar 30', day: 'Wed', label: 'Home 😢',         emoji: '🏠', color: '#E63946' },
          ].map(({ date, day, label, emoji, color }) => (
            <div
              key={date}
              className="flex-shrink-0 bg-[#16213E] border border-[#0F3460] rounded-xl px-4 py-3 text-center min-w-[100px]"
            >
              <div className="text-xl mb-1">{emoji}</div>
              <p className="font-heading font-bold text-xs" style={{ color }}>{date}</p>
              <p className="text-[10px] text-[#A0AEC0]">{day}</p>
              <p className="text-[10px] text-[#E8F5E9] mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="px-4 max-w-4xl mx-auto border-t border-[#0F3460] pt-6 pb-24 md:pb-6 text-center">
        <p className="text-xs text-[#A0AEC0]">
          Made with ☕ and lack of sleep for <span className="text-[#52B788] font-medium">7 pagal log</span>
        </p>
        <p className="text-xs text-[#A0AEC0]/50 mt-1">
          7 Log · Matheran 2026 · What happens on this trip, gets posted on Instagram immediately 📸
        </p>
      </footer>
    </div>
  )
}
