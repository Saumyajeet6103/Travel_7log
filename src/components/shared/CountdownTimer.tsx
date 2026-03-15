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
        <p className="text-3xl font-heading font-bold text-[#52B788]">
          🎉 IT&apos;S TRIP TIME BHAI! 🎉
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
    <div className="flex items-center gap-3 justify-center flex-wrap">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="text-center">
            <div className="bg-[#16213E] border border-[#0F3460] rounded-xl px-4 py-3 min-w-[64px]">
              <span className="font-heading font-bold text-3xl text-[#52B788] tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <p className="text-[10px] text-[#A0AEC0] mt-1 uppercase tracking-wider">{label}</p>
          </div>
          {i < units.length - 1 && (
            <span className="font-bold text-2xl text-[#0F3460] mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
