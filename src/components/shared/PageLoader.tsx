'use client'

import { useEffect, useState } from 'react'
import { FUNNY_LOADING_MESSAGES } from '@/lib/utils'

export default function PageLoader() {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % FUNNY_LOADING_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      {/* Animated mountain */}
      <div className="text-5xl animate-float">🏔️</div>

      {/* Spinner */}
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 border-4 border-[#0F3460] border-t-[#52B788] rounded-full animate-spin" />
      </div>

      {/* Rotating message */}
      <p className="text-sm text-[#A0AEC0] text-center max-w-xs animate-fade-in" key={msgIdx}>
        {FUNNY_LOADING_MESSAGES[msgIdx]}
      </p>
    </div>
  )
}
