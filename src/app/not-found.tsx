import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Floating mountain */}
        <div className="text-7xl mb-6 animate-float inline-block">🏔️</div>

        <h1 className="font-heading font-black text-5xl text-[#E8F5E9] mb-2">404</h1>
        <h2 className="font-heading font-bold text-xl text-[#52B788] mb-4">
          Bhai, raasta bhool gaya?
        </h2>

        <p className="text-[#A0AEC0] text-sm mb-2 leading-relaxed">
          Tu Matheran mein khoya hai kya? This page doesn&apos;t exist.
          Even the toy train doesn&apos;t go this far.
        </p>
        <p className="text-[#A0AEC0]/60 text-xs mb-8 italic">
          Tip: Hriday bhi yehi page dekh raha hai — still confused, still smiling.
        </p>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { emoji: '🗺️', label: 'Maps checked', value: '404' },
            { emoji: '🧭', label: 'Direction found', value: '0' },
            { emoji: '☕', label: 'Chai needed', value: '∞' },
          ].map(({ emoji, label, value }) => (
            <div key={label} className="bg-[#16213E] border border-[#0F3460] rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{emoji}</div>
              <p className="font-heading font-bold text-lg text-[#F4A261]">{value}</p>
              <p className="text-[9px] text-[#A0AEC0] uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-[#52B788] hover:bg-[#2D6A4F] text-[#1A1A2E] font-heading font-bold rounded-xl transition-all hover:scale-105"
          >
            🏠 Ghar wapas
          </Link>
          <Link
            href="/expenses"
            className="px-6 py-3 bg-[#16213E] border border-[#0F3460] hover:border-[#52B788]/40 text-[#E8F5E9] font-heading font-bold rounded-xl transition-all"
          >
            💸 Check expenses (Harshal)
          </Link>
        </div>

        <p className="text-xs text-[#A0AEC0]/40 mt-8 italic">
          7 Log · Matheran 2026 · Even the lost find their way eventually 🧭
        </p>
      </div>
    </div>
  )
}
