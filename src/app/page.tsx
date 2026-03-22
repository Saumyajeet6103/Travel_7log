import { connectDB } from '@/lib/db'
import { Member, Expense, Spot } from '@/lib/models'
import { getSession } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Navbar from '@/components/shared/Navbar'
import CountdownTimer from '@/components/shared/CountdownTimer'
import FunTicker from '@/components/shared/FunTicker'
import AnnouncementBanner from '@/components/shared/AnnouncementBanner'
import { TrendingUp, CheckCircle, Calendar, ChevronRight } from 'lucide-react'
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
      color:   'primary',
      gradient: 'from-primary/20 via-primary/5 to-transparent',
    },
    {
      href:    '/itinerary',
      icon:    '🗺️',
      label:   'Itinerary',
      desc:    'Every spot, every plan. Mark done when you actually visit (or skip, we don\'t judge).',
      color:   'info',
      gradient: 'from-info/20 via-info/5 to-transparent',
    },
    {
      href:    '/trip-details',
      icon:    '🚂',
      label:   'Trip Details',
      desc:    'Trains, stays, rules, packing list. Everything you need. Read it. No excuses.',
      color:   'warning',
      gradient: 'from-warning/20 via-warning/5 to-transparent',
    },
  ]

  const TIMELINE = [
    { date: 'Mar 25', day: 'Wed', label: 'Depart Vadodara', emoji: '🚂', color: 'purple' },
    { date: 'Mar 26', day: 'Thu', label: 'Arrive Matheran', emoji: '🏔️', color: 'primary' },
    { date: 'Mar 27', day: 'Fri', label: 'Matheran Day 2',  emoji: '🌅', color: 'primary' },
    { date: 'Mar 28', day: 'Sat', label: 'Back to Mumbai',  emoji: '🏙️', color: 'info' },
    { date: 'Mar 29', day: 'Sun', label: 'Explore Mumbai',  emoji: '🌆', color: 'warning' },
    { date: 'Mar 30', day: 'Mon', label: 'Home',             emoji: '🏠', color: 'danger' },
  ]

  return (
    <div className="min-h-screen bg-base pb-20 md:pb-0">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-10 pb-14 text-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.07] rounded-full blur-[100px]" />
          <div className="absolute top-20 right-0 w-64 h-64 bg-warning/[0.05] rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-info/[0.04] rounded-full blur-[60px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            March 25–30, 2026 · Vadodara → Mumbai → Matheran
          </div>

          {/* Title */}
          <div className="animate-slide-up">
            <h1 className="font-heading font-black text-6xl md:text-8xl text-foreground mb-2 tracking-tight leading-none">
              7 <span className="text-gradient">LOG</span>
            </h1>
            <p className="font-heading text-xl md:text-2xl text-warning font-semibold mb-2">
              MATHERAN 2026
            </p>
            <p className="text-foreground/70 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
              7 dost, 1 hill station, infinite chaos.<br className="hidden sm:block" />
              Koi plan nahi, bas excitement hai.
            </p>
          </div>

          {/* Countdown */}
          <div className="mb-2">
            <p className="text-[10px] text-muted uppercase tracking-[0.2em] mb-3 font-medium">
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

      {/* ── Announcements ─────────────────────────────────────────── */}
      <div className="px-4 max-w-4xl mx-auto">
        <AnnouncementBanner />
      </div>

      {/* ── Quick Stats ──────────────────────────────────────────────── */}
      <section className="px-4 max-w-4xl mx-auto mb-12">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp,  label: 'Total Spent',   value: formatCurrency(totalSpent), colorClass: 'text-primary',  bgClass: 'bg-primary/10 border-primary/20' },
            { icon: CheckCircle, label: 'Spots Done',    value: `${doneSpots}/${totalSpots}`, colorClass: 'text-info',  bgClass: 'bg-info/10 border-info/20' },
            { icon: Calendar,    label: 'Trip Duration',  value: '5 Nights',  colorClass: 'text-warning', bgClass: 'bg-warning/10 border-warning/20' },
          ].map(({ icon: Icon, label, value, colorClass, bgClass }, i) => (
            <div
              key={label}
              className={`relative overflow-hidden border rounded-xl p-4 text-center animate-slide-up ${bgClass} stagger-${i + 1}`}
            >
              <Icon size={16} className={`mx-auto mb-2 ${colorClass}`} />
              <p className={`font-heading font-bold text-xl ${colorClass}`}>{value}</p>
              <p className="text-[10px] text-muted uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Squad ────────────────────────────────────────────────── */}
      <section className="px-4 max-w-4xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-heading font-bold text-lg text-foreground">The Squad</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-subtle to-transparent" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {members.map((m, i) => {
            const isCurrentUser = session?.name === m.name
            return (
              <div
                key={m._id.toString()}
                className={`relative bg-surface border rounded-xl p-4 text-center transition-all duration-200 hover:scale-[1.03] hover:shadow-lg animate-slide-up stagger-${Math.min(i + 1, 6)} ${
                  isCurrentUser ? 'border-primary/50 glow-primary' : 'border-subtle hover:border-primary/20'
                }`}
              >
                {isCurrentUser && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-fg text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    YOU
                  </div>
                )}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 border-2"
                  style={{ borderColor: m.color + '50', backgroundColor: m.color + '15' }}
                >
                  {m.emoji}
                </div>
                <p className="font-heading font-bold text-sm text-foreground">{m.name}</p>
                {m.nickname ? (
                  <p className="text-[10px] text-muted mt-0.5 italic leading-tight">
                    &ldquo;{m.nickname}&rdquo;
                  </p>
                ) : (
                  <p className="text-[10px] text-subtle mt-0.5 italic">no nickname yet</p>
                )}
                <div
                  className="mt-2.5 h-0.5 rounded-full w-8 mx-auto opacity-60"
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
          <h2 className="font-heading font-bold text-lg text-foreground">What do you need?</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-subtle to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODULE_CARDS.map(({ href, icon, label, desc, color, gradient }, i) => (
            <Link
              key={href}
              href={href}
              className={`group relative overflow-hidden bg-surface border border-subtle rounded-2xl p-5 hover:border-${color}/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 animate-slide-up stagger-${i + 1}`}
            >
              {/* Gradient backdrop */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative">
                <div className="text-4xl mb-3 group-hover:animate-wiggle">{icon}</div>
                <h3 className={`font-heading font-bold text-base text-foreground mb-1.5 group-hover:text-${color} transition-colors`}>
                  {label}
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-4">{desc}</p>
                <div className={`flex items-center gap-1.5 text-xs font-medium text-${color}`}>
                  Open <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trip Timeline ──────────────────────────────────────────── */}
      <section className="px-4 max-w-4xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-heading font-bold text-lg text-foreground">Trip at a Glance</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-subtle to-transparent" />
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-subtle hidden md:block" />

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TIMELINE.map(({ date, day, label, emoji, color }, i) => (
              <div
                key={date}
                className={`relative flex-shrink-0 bg-surface border border-subtle rounded-xl px-4 py-3 text-center min-w-[100px] hover:border-${color}/40 transition-all duration-200 animate-slide-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="text-xl mb-1.5">{emoji}</div>
                <p className={`font-heading font-bold text-xs text-${color}`}>{date}</p>
                <p className="text-[10px] text-muted">{day}</p>
                <p className="text-[10px] text-foreground mt-1 leading-tight font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="px-4 max-w-4xl mx-auto border-t border-subtle pt-6 pb-24 md:pb-6 text-center">
        <p className="text-xs text-muted">
          Made with caffeine and lack of sleep for <span className="text-primary font-medium">7 pagal log</span>
        </p>
        <p className="text-xs text-muted/40 mt-1">
          7 Log · Matheran 2026 · What happens on this trip, gets posted on Instagram immediately
        </p>
      </footer>
    </div>
  )
}
