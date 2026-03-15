# TASK-07: UI Theme, Comedy Elements & Polish

## Goal
Make the app look sick and feel like it was built specifically for these 7 pagal log.

## Color Palette
```
Primary Green:   #2D6A4F  (forest deep green)
Secondary:       #52B788  (leafy green)
Accent:          #F4A261  (warm orange/sunset)
Background Dark: #1A1A2E  (midnight)
Background Card: #16213E  (dark card)
Text Primary:    #E8F5E9  (off-white)
Text Muted:      #A0AEC0  (gray)
Danger/Owe:      #E63946  (red — you owe money)
Success/Get:     #2D9CDB  (blue — you get money)
```

## Typography
- Heading font: `Space Grotesk` or `Syne` (bold, modern)
- Body: `Inter`
- Funny elements: `Comic Neue` or keep it bold Inter

## Animations (Framer Motion)
- Page transitions: slide-in from right
- Card hover: subtle lift + shadow
- "Mark Done" spot: confetti burst (canvas-confetti)
- Balance update: number counter animation
- Expense added: card flies in from bottom
- Loading states: fun skeleton loaders with trip-themed messages

## Comedy / Personality Elements

### Loading Messages (rotating)
- "Asking Bhai for money... please hold 🙏"
- "Calculating who's the biggest kanjoos..."
- "Loading 7 pagalon ka plan..."
- "Dhundhh raha hu chai ki dukaan..."

### Empty State Messages
- No expenses: "Abhi tak kuch kharch nahi? Bhai trip pe gaye ho ya ghar pe baithe ho? 😂"
- No spots done: "Ek bhi spot nahi ghuma? Bhai hotel mein so rahe ho kya?"

### Toast Notifications (react-hot-toast)
- Expense added: "💸 Hisaab mein daala gaya!"
- Expense deleted: "🗑️ Bhool jao, chhod do!"
- Spot marked done: "🏆 NIKAL GAYE BHAI!"
- Settlement: "✅ Paisa cleared! Dosti barqarar!"
- Error: "🤦 Kuch toh galat hua bhai..."

### Member Nicknames (Auto-generated based on data)
- Highest spender: "💰 Paisa Udaane Wala"
- Lowest contributor: "🥶 Kanjoos Makhichoos"
- Most spots marked done: "🏃 Energizer Bhai"
- Fewest spots done: "😴 Sone Wala"

### Random Quotes on Pages
Trip quote of the moment (rotates):
- "Zindagi mein do cheezein kabhi plan nahi hoti: trip aur expense"
- "7 dost, 1 shared hotel, aur bahut saare arguments 🏔️"
- "Matheran mein mobile nahi chalega... lekin ye app chalega 😎"

### Easter Egg
- Konami code (↑↑↓↓←→←→BA) → plays a funny sound/animation
- Triple-click on logo → reveals "WHO HASN'T PAID YET" in big red text

## Responsive Design
- Mobile-first (trip app = phone app)
- Bottom navigation on mobile
- Desktop: sidebar nav
- PWA capable (add to home screen support)

## Misc Polish
- Favicon: mountain + 7 emoji
- Tab title: "7 Log - Matheran 2026 🏔️"
- Smooth scroll throughout
- No page reloads (SPA feel via Next.js App Router)
- Loading spinner themed as a tiny train 🚂
