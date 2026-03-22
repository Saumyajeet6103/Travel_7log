'use client'

const TICKER_ITEMS = [
  '🚂 Vadodara → Mumbai → Neral → Matheran → Heartbreak → Vadodara',
  '☕ Official beverage of this trip: chai, chai, and more chai',
  '📸 Group photo policy: mandatory at every spot, no excuses, no negotiations',
  '💸 Reminder: Harshal, "baad mein deta hu" is not a payment method',
  '🌅 Panorama Point sunrise: 4 AM wakeup. Non-negotiable. Non-debatable. Final answer.',
  '🗺️ Matheran fact: No motor vehicles allowed. Yes, this includes Nandan\'s excuse.',
  '🎯 Trip motto: Koi plan nahi, bas excitement hai',
  '🏔️ Elevation: 803m above sea level. Your excuses are not welcome at this altitude.',
  '🎒 Packing rule: If it doesn\'t fit in a daypack, you don\'t need it. Yes, that means you, Sarthak.',
  '🔇 Phone signal in Matheran: 0-2 bars. Welcome to peace. You\'re welcome.',
  '🐴 Matheran transport options: Walk, Toy Train, Shared Jeep, or Horse. Dignity is optional.',
  '📍 Closest ATM to Matheran: 20km away. Carry cash or starve. Your choice.',
]

export default function FunTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS] // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden bg-subtle/60 border border-subtle rounded-xl py-2.5 my-6">
      <div className="flex whitespace-nowrap animate-ticker">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center text-xs text-muted px-6 flex-shrink-0">
            {item}
            <span className="mx-6 text-subtle">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}
