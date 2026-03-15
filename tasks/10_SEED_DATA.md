# TASK-10: Seed Data (Pre-populated from User Inputs)

## Members (7 Log)
```js
const MEMBERS = [
  { name: "Saumyajeet", nickname: "Treasurer Ji",         emoji: "💰", color: "#F4A261" },
  { name: "Vraj",       nickname: "Plan Banaane Wala",    emoji: "🗺️", color: "#52B788" },
  { name: "Sarthak",    nickname: "Chai Specialist",      emoji: "☕", color: "#2D9CDB" },
  { name: "Nandan",     nickname: "DSA in Real Life",     emoji: "🧠", color: "#9B5DE5" },
  { name: "Tirth",      nickname: "Camera Ready",         emoji: "📸", color: "#F15BB5" },
  { name: "Harshal",    nickname: "Baad Mein Deta Hu",   emoji: "😅", color: "#FEE440" },
  { name: "Hriday",     nickname: "Sone Wala",            emoji: "😴", color: "#00BBF9" },
]
// Note: nicknames will be updated dynamically by the app based on actual behavior
```

## Trip Timeline (for flowchart seed)
```js
const TRIP_TIMELINE = [
  {
    day: "Day 0 - Night",
    date: "2026-03-25",
    label: "The Escape from Vadodara",
    events: [
      { time: "Night", title: "Board train from Vadodara → Mumbai", type: "travel" }
    ]
  },
  {
    day: "Day 1",
    date: "2026-03-26",
    label: "Mumbai → Matheran",
    events: [
      { time: "Morning", title: "Arrive Mumbai", type: "travel" },
      { time: "Morning", title: "Head to Neral (train/road)", type: "travel" },
      { time: "Afternoon", title: "Neral → Matheran (Toy Train / Jeep)", type: "travel" },
      { time: "Afternoon", title: "Hotel Check-in", type: "stay" },
      { time: "Evening", title: "Explore + Dinner", type: "activity" },
    ]
  },
  {
    day: "Day 2",
    date: "2026-03-27",
    label: "Matheran Full Day",
    events: [
      { time: "Early Morning", title: "Sunrise at Panorama Point 🌅", type: "viewpoint" },
      { time: "Morning", title: "Breakfast + Horse Riding 🐎", type: "activity" },
      { time: "Afternoon", title: "Charlotte Lake / Echo Point", type: "viewpoint" },
      { time: "Evening", title: "Porcupine Point (Sunset) 🌄", type: "viewpoint" },
      { time: "Night", title: "Market + Dinner", type: "food" },
    ]
  },
  {
    day: "Day 3",
    date: "2026-03-28",
    label: "Last Day Matheran + Back to Mumbai",
    events: [
      { time: "Morning", title: "Remaining spots / Free roam", type: "activity" },
      { time: "Afternoon", title: "Hotel Check-out", type: "stay" },
      { time: "Afternoon", title: "Matheran → Neral → Mumbai", type: "travel" },
      { time: "Night", title: "Check-in Mumbai stay", type: "stay" },
      { time: "Night", title: "Mumbai dinner / chill", type: "food" },
    ]
  },
  {
    day: "Day 4",
    date: "2026-03-29",
    label: "Mumbai Exploration Day",
    events: [
      { time: "Morning", title: "Explore Mumbai (Gateway, Marine Drive, etc.)", type: "activity" },
      { time: "Afternoon", title: "Food tour", type: "food" },
      { time: "Night", title: "Board train Mumbai → Vadodara", type: "travel" },
    ]
  },
  {
    day: "Day 5 - Morning",
    date: "2026-03-30",
    label: "Home Sweet Home",
    events: [
      { time: "Morning", title: "Arrive Vadodara. Trip ends. Sadness begins. 😢", type: "travel" }
    ]
  }
]
```

## Pre-seeded Matheran Spots
```js
const SPOTS = [
  { name: "Panorama Point", type: "viewpoint", day: "Day 2", time: "5:30 AM", funFact: "Sunrise here hits different. Worth waking up for. Set 5 alarms." },
  { name: "Echo Point", type: "viewpoint", day: "Day 2", time: "9:00 AM", funFact: "Scream bhai ka naam. Pahaad wapas bolega. 📣" },
  { name: "Charlotte Lake", type: "viewpoint", day: "Day 2", time: "10:30 AM", funFact: "Matheran's main lake. Good for vibes and photos." },
  { name: "Horse Riding", type: "activity", day: "Day 2", time: "8:00 AM", funFact: "Ghoda tumhe nahi le jaata, tum ghode ko le jaate ho. Maybe." },
  { name: "Louisa Point", type: "viewpoint", day: "Day 2", time: "12:00 PM", funFact: "One of the longest views in Matheran. Bring water." },
  { name: "Porcupine Point (Sunset)", type: "viewpoint", day: "Day 2", time: "6:00 PM", funFact: "Best sunset point. Don't miss or group will never forgive you." },
  { name: "Central Market + Chikki", type: "food", day: "Day 1", time: "7:00 PM", funFact: "Matheran famous chikki. Buy for family or eat it all yourself, no judgment." },
  { name: "One Tree Hill Point", type: "viewpoint", day: "Day 3", time: "9:00 AM", funFact: "Less crowded, very peaceful. Good if you survive Day 2." },
  { name: "Toy Train Ride", type: "travel", day: "Day 1", time: "Arrival", funFact: "World's narrowest gauge railway. Slow as your internet on trip. 🚂" },
  { name: "Mumbai - Gateway of India", type: "activity", day: "Day 4", time: "Morning", funFact: "Tourist trap but you have to go. It's in the rulebook." },
  { name: "Mumbai - Marine Drive", type: "activity", day: "Day 4", time: "Evening", funFact: "Queen's Necklace. Sit, stare at sea, contemplate life." },
  { name: "Mumbai Street Food", type: "food", day: "Day 4", time: "Afternoon", funFact: "Vada Pav, Pav Bhaji, Bhel. Eat everything. No regrets." },
]
```

## Pending from User
- [ ] Vadodara → Mumbai train details (name, number, time, PNR)
- [ ] Mumbai → Neral train details
- [ ] Neral → Matheran method (Toy Train timings if booked, or jeep)
- [ ] Hotel name & details in Matheran
- [ ] Hotel name & details in Mumbai (28th night)
- [ ] Return train details (Mumbai → Vadodara, night of 29th)
