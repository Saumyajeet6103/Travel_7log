# TASK-08: Deployment & Environment Setup

## Goal
Get the app live so all 7 log can access it from their phones during the trip.

## Recommended Stack for Hosting
- **App**: Vercel (free tier, Next.js native, zero config)
- **Database**: MongoDB Atlas (free M0 cluster, 512MB — plenty for 7 people)

## Environment Variables Needed
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/matheran-trip
NEXT_PUBLIC_APP_NAME=7 Log Matheran 2026
NEXT_PUBLIC_TRIP_DATE=2026-03-28
NEXT_PUBLIC_MEMBERS=["Saumyajeet","Friend2","Friend3","Friend4","Friend5","Friend6","Friend7"]
```

## Deployment Steps
1. Push code to GitHub repo
2. Connect repo to Vercel
3. Add env vars in Vercel dashboard
4. Set up MongoDB Atlas cluster + get URI
5. Run seed script to populate members + initial data
6. Share URL with the group

## Optional: Simple Access Control
- Since it's a shared trip app, no login needed
- Optional: single shared 4-digit PIN to prevent outsider access
- Could be trip date: `2803` (28 March)

## PWA Setup (Optional but great for trip)
- Add `manifest.json` with app name, icons, theme color
- Service worker for offline-ish experience
- "Add to Home Screen" prompt

## Pre-Trip Checklist
- [ ] MongoDB Atlas cluster created
- [ ] Vercel deployment live
- [ ] URL shared to WhatsApp group
- [ ] Members seeded in DB
- [ ] Initial trip details filled in
- [ ] Test on mobile (all 7 should open and check)

## Seed Script
`scripts/seed.ts` — populates:
- 7 members with names/nicknames/emojis
- Matheran spots (pre-loaded itinerary)
- Trip detail sections (trains, stay, rules)
