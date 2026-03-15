'use client'

import { Clock, Info } from 'lucide-react'

interface PlanItem {
  time: string
  activity: string
}

export interface MumbaiContent {
  date: string
  plan: PlanItem[]
  notes: string
}

interface Props {
  content: MumbaiContent
}

const TIME_EMOJIS: Record<string, string> = {
  Morning:   '☀️',
  'Afternoon': '🌤️',
  Evening:   '🌆',
  Night:     '🌙',
}

function getEmoji(time: string) {
  for (const [key, emoji] of Object.entries(TIME_EMOJIS)) {
    if (time.toLowerCase().includes(key.toLowerCase())) return emoji
  }
  return '📍'
}

export default function MumbaiSection({ content }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🌆</span>
        <h3 className="font-heading font-bold text-[#E8F5E9]">Mumbai Day Plan</h3>
        <span className="text-xs text-[#A0AEC0] bg-[#0F3460] px-2 py-0.5 rounded-full">{content.date}</span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#0F3460]" />

        <div className="space-y-1">
          {content.plan?.map((item, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              {/* Dot */}
              <div className="w-10 h-10 rounded-full bg-[#16213E] border-2 border-[#0F3460] flex items-center justify-center text-base flex-shrink-0 relative z-10">
                {getEmoji(item.time)}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={11} className="text-[#2D9CDB]" />
                  <span className="text-xs font-medium text-[#2D9CDB]">{item.time}</span>
                </div>
                <p className="text-sm text-[#E8F5E9]">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {content.notes && (
        <div className="flex items-start gap-2 p-4 bg-[#0F3460]/40 border border-[#0F3460] rounded-xl">
          <Info size={14} className="text-[#F4A261] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#A0AEC0] italic">{content.notes}</p>
        </div>
      )}
    </div>
  )
}
