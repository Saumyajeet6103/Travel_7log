# TASK-01: Project Setup & Scaffolding

## Goal
Bootstrap the Next.js app with all dependencies, folder structure, and base config.

## Steps
- [ ] Init Next.js 14 app with App Router (`create-next-app`)
- [ ] Install dependencies:
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `mongoose` (MongoDB ORM)
  - `shadcn/ui` components (button, card, dialog, badge, tabs, progress)
  - `framer-motion` (animations)
  - `lucide-react` (icons)
  - `react-leaflet` + `leaflet` (optional map for routes)
  - `@radix-ui/*` (via shadcn)
  - `date-fns` (date formatting)
  - `recharts` (expense charts)
  - `react-hot-toast` (notifications - "Bhai tune phir overspend kiya!")
- [ ] Setup folder structure (see below)
- [ ] Setup Tailwind config with custom theme (earthy/adventure colors)
- [ ] Setup MongoDB connection utility (`lib/db.ts`)
- [ ] Setup environment variables (`.env.local`)
- [ ] Setup base layout with nav

## Folder Structure
```
/app
  /layout.tsx          ← Root layout + fonts
  /page.tsx            ← Landing/Home
  /expenses
    /page.tsx          ← Expense tracker
  /itinerary
    /page.tsx          ← Spots & schedule
  /trip-details
    /page.tsx          ← Flowchart & travel plans
  /api
    /expenses/route.ts
    /members/route.ts
    /spots/route.ts
    /settlements/route.ts
/components
  /ui/                 ← shadcn components
  /expenses/           ← Expense-specific components
  /itinerary/          ← Itinerary components
  /trip-details/       ← Flowchart components
  /shared/             ← Navbar, Footer, etc.
/lib
  /db.ts               ← MongoDB connect
  /models/             ← Mongoose schemas
  /utils.ts
/public
  /images/
```

## Notes
- No user auth needed — shared trip app for 7 friends
- Simple name-based member selection (pre-seeded 7 members)
