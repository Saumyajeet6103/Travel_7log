# TASK-05: Itinerary & Spots Tracker

## Goal
A checklist + schedule of all spots and activities with status tracking.

## Pages / Components

### A. Itinerary Dashboard (`/itinerary`)
- Timeline view — spots grouped by day/date
- Progress bar: "X of Y spots conquered 🏔️"
- Filter tabs: All / Planned / Done / Skipped
- Day selector tabs (Day 1, Day 2, etc.)

### B. Spot Card
Each spot card shows:
- Spot name + type icon (🏔️ Viewpoint, 🍽️ Food, 🎯 Activity, 🏨 Stay, 🚂 Travel)
- Scheduled time
- Short description
- Fun fact / trivia ("Echo Point mein chillao toh echo aata hai... obviously 🙄")
- Status badge: Planned / In Progress / Done ✅ / Skipped ❌
- "Mark Done" button → confetti animation!
- Photo placeholder (future enhancement)

### C. Add/Edit Spot Modal
Fields:
- Name
- Type (icon picker)
- Day & Time
- Description
- Fun fact (optional)
- Status

### D. Progress Section
- Big progress tracker at top: "Day 1: 3/5 spots done 🎉"
- Overall trip completion %
- Leaderboard: "Who marked the most spots done?" (just for fun)

## Pre-seeded Matheran Spots (to be confirmed with user)
Popular spots to pre-load:
1. Charlotte Lake 🏞️
2. Echo Point 📣
3. Panorama Point 🌅 (sunrise viewpoint)
4. Louisa Point 🌄
5. Alexander Point
6. One Tree Hill Point
7. Porcupine Point (Sunset)
8. Central Hotel / Market area (food) 🍕
9. Toy Train ride 🚂
10. Horse riding 🐎

## Status Flow
```
Planned → In Progress → Done
                      ↘ Skipped
```

## Funny Elements
- On marking "Done": random celebration message
  - "Nikal gaye! Ek aur point conquered! 🏆"
  - "Bhai thak gaye? Abhi toh shuru hua hai! 💪"
  - "Instagram story ready? 📸"
- On "Skip": "Arre yaar... next time pakka 😅"
- Spot type "Bhai ka Idea" — for random group decisions made on spot

## API Routes
- `GET /api/spots` — list all spots
- `POST /api/spots` — add spot
- `PUT /api/spots/[id]` — update (including status change)
- `DELETE /api/spots/[id]` — delete
