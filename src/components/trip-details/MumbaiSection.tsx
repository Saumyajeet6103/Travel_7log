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
        <h3 className="font-heading font-bold text-foreground">Mumbai Day Plan</h3>
        <span className="text-xs text-muted bg-subtle px-2 py-0.5 rounded-full">{content.date}</span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-subtle" />

        <div className="space-y-1">
          {content.plan?.map((item, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              {/* Dot */}
              <div className="w-10 h-10 rounded-full bg-surface border-2 border-subtle flex items-center justify-center text-base flex-shrink-0 relative z-10">
                {getEmoji(item.time)}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={11} className="text-info" />
                  <span className="text-xs font-medium text-info">{item.time}</span>
                </div>
                <p className="text-sm text-foreground">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {content.notes && (
        <div className="flex items-start gap-2 p-4 bg-subtle/40 border border-subtle rounded-xl">
          <Info size={14} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted italic">{content.notes}</p>
        </div>
      )}
    </div>
  )
}
