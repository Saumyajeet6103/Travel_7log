'use client'

import { Clock, IndianRupee, Navigation, AlertTriangle } from 'lucide-react'

interface RouteOption {
  option: string
  time: string
  cost: string
  notes: string
}

export interface RoutesContent {
  matheranRules: string[]
  neralToMatheran: RouteOption[]
}

interface Props {
  content: RoutesContent
}

const OPTION_EMOJIS: Record<string, string> = {
  'Toy Train': '🚂',
  'Shared Jeep': '🚙',
  'Walk': '🚶',
}

export default function RoutesSection({ content }: Props) {
  return (
    <div className="space-y-6">
      {/* Neral → Matheran options */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Navigation size={16} className="text-info" />
          <h3 className="font-heading font-bold text-foreground">Neral → Matheran</h3>
          <span className="text-xs text-muted bg-subtle px-2 py-0.5 rounded-full">pick your poison 🙃</span>
        </div>

        <div className="space-y-3">
          {content.neralToMatheran?.map((route, i) => {
            const emoji = OPTION_EMOJIS[route.option] ?? '🚀'
            const isRecommended = route.option === 'Toy Train'
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 transition-all ${
                  isRecommended
                    ? 'bg-primary/5 border-primary/40'
                    : 'bg-surface border-subtle'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    isRecommended ? 'bg-primary/20' : 'bg-subtle'
                  }`}>
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-heading font-bold text-sm text-foreground">{route.option}</p>
                      {isRecommended && (
                        <span className="text-[10px] bg-primary text-primary-fg font-bold px-2 py-0.5 rounded-full">
                          ✅ Scenic Pick
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mb-2">
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <Clock size={11} className="text-info" />
                        {route.time}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <IndianRupee size={11} className="text-warning" />
                        {route.cost}
                      </div>
                    </div>
                    <p className="text-xs text-muted italic">{route.notes}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Matheran Rules */}
      {content.matheranRules?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-warning" />
            <h3 className="font-heading font-bold text-foreground">Matheran Ground Rules</h3>
          </div>
          <div className="bg-surface border border-warning/20 rounded-xl p-4 space-y-2.5">
            {content.matheranRules.map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center text-[10px] font-bold text-warning flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-muted">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
