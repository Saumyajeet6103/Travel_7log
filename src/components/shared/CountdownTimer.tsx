'use client'

import { useEffect, useState } from 'react'

const TRIP_DATE = new Date('2026-03-25T20:00:00+05:30') // Night departure

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calc(): TimeLeft {
  const diff = TRIP_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function CountdownTimer() {
  const [time, setTime] = useState<TimeLeft>(calc)

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  const isTrip = time.days === 0 && time.hours === 0 && time.minutes === 0

  if (isTrip) {
    return (
      <div className="text-center animate-bounce-in">
        <p className="text-3xl font-heading font-bold text-primary">
          IT&apos;S TRIP TIME BHAI!
        </p>
      </div>
    )
  }

  const units = [
    { label: 'Days',    value: time.days    },
    { label: 'Hours',   value: time.hours   },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ]

  return (
    <div className="flex items-center gap-2 sm:gap-3 justify-center" role="timer" aria-label="Countdown to trip">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="text-center">
            <div className="relative bg-surface border border-subtle rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 min-w-[56px] sm:min-w-[68px] overflow-hidden">
              {/* Subtle gradient sheen */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
              <span className="relative font-heading font-bold text-2xl sm:text-3xl text-primary tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-muted mt-1.5 uppercase tracking-[0.15em] font-medium">{label}</p>
          </div>
          {i < units.length - 1 && (
            <span className="font-bold text-xl sm:text-2xl text-subtle mb-5 animate-pulse-glow">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
