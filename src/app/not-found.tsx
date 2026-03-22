import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-danger/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative text-center max-w-md animate-slide-up">
        {/* Floating mountain */}
        <div className="text-7xl mb-6 animate-float inline-block">🏔️</div>

        <h1 className="font-heading font-black text-6xl text-foreground mb-2 tracking-tight">
          4<span className="text-danger">0</span>4
        </h1>
        <h2 className="font-heading font-bold text-xl text-primary mb-4">
          Bhai, raasta bhool gaya?
        </h2>

        <p className="text-muted text-sm mb-2 leading-relaxed">
          Tu Matheran mein khoya hai kya? This page doesn&apos;t exist.
          Even the toy train doesn&apos;t go this far.
        </p>
        <p className="text-muted/50 text-xs mb-8 italic">
          Tip: Hriday bhi yehi page dekh raha hai — still confused, still smiling.
        </p>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { emoji: '🗺️', label: 'Maps checked', value: '404', color: 'text-danger' },
            { emoji: '🧭', label: 'Direction found', value: '0', color: 'text-warning' },
            { emoji: '☕', label: 'Chai needed', value: '∞', color: 'text-primary' },
          ].map(({ emoji, label, value, color }) => (
            <div key={label} className="bg-surface border border-subtle rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{emoji}</div>
              <p className={`font-heading font-bold text-lg ${color}`}>{value}</p>
              <p className="text-[9px] text-muted uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-primary-fg font-heading font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            Ghar wapas
          </Link>
          <Link
            href="/expenses"
            className="px-6 py-3 bg-surface border border-subtle hover:border-primary/40 text-foreground font-heading font-bold rounded-xl transition-all active:scale-95"
          >
            Check expenses (Harshal)
          </Link>
        </div>

        <p className="text-xs text-muted/30 mt-8 italic">
          7 Log · Matheran 2026 · Even the lost find their way eventually
        </p>
      </div>
    </div>
  )
}
