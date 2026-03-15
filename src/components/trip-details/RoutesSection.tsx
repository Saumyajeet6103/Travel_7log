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
          <Navigation size={16} className="text-[#2D9CDB]" />
          <h3 className="font-heading font-bold text-[#E8F5E9]">Neral → Matheran</h3>
          <span className="text-xs text-[#A0AEC0] bg-[#0F3460] px-2 py-0.5 rounded-full">pick your poison 🙃</span>
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
                    ? 'bg-[#52B788]/5 border-[#52B788]/40'
                    : 'bg-[#16213E] border-[#0F3460]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    isRecommended ? 'bg-[#52B788]/20' : 'bg-[#0F3460]'
                  }`}>
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-heading font-bold text-sm text-[#E8F5E9]">{route.option}</p>
                      {isRecommended && (
                        <span className="text-[10px] bg-[#52B788] text-[#1A1A2E] font-bold px-2 py-0.5 rounded-full">
                          ✅ Scenic Pick
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mb-2">
                      <div className="flex items-center gap-1 text-xs text-[#A0AEC0]">
                        <Clock size={11} className="text-[#2D9CDB]" />
                        {route.time}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#A0AEC0]">
                        <IndianRupee size={11} className="text-[#F4A261]" />
                        {route.cost}
                      </div>
                    </div>
                    <p className="text-xs text-[#A0AEC0] italic">{route.notes}</p>
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
            <AlertTriangle size={16} className="text-[#F4A261]" />
            <h3 className="font-heading font-bold text-[#E8F5E9]">Matheran Ground Rules</h3>
          </div>
          <div className="bg-[#16213E] border border-[#F4A261]/20 rounded-xl p-4 space-y-2.5">
            {content.matheranRules.map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F4A261]/20 flex items-center justify-center text-[10px] font-bold text-[#F4A261] flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-[#A0AEC0]">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
