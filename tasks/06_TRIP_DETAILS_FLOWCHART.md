# TASK-06: Trip Details & Travel Flowchart

## Goal
A visual, interactive "trip guide" page showing all logistical details — trains, stays, travel routes, rules, packing list.

## Page: `/trip-details`

### A. Journey Flowchart (Main Feature)
Visual step-by-step flow (like a timeline/flowchart):

```
[Home Cities]
     ↓
[Mumbai Central / CST Station]
     ↓
[Train to Neral] ← train details here
     ↓
[Neral Station]
     ↓
[Toy Train / Cab / Walk to Matheran]  ← options here
     ↓
[Matheran Entry / Hotel Check-in]
     ↓
[Day-wise Activities]
     ↓
[Return Journey]
```

Each node in the flowchart is expandable/clickable and shows:
- Time details
- Cost estimate
- Tips / warnings
- Funny note

### B. Accommodation Section
Card showing:
- Hotel/stay name
- Address
- Check-in / Check-out dates & times
- Room details (who shares which room — 7 people need allocation!)
- Booking confirmation number
- Contact number
- Cost per head
- Map link

### C. Travel Options Section
Tabs for different ways Mumbai → Matheran:

**Option 1: Train**
- Mumbai → Neral (CR trains, platform, timing)
- Neral → Matheran Toy Train (timings, booking link)
- Total time, cost

**Option 2: Road**
- Mumbai → Matheran by car/taxi
- Route, distance, tolls
- Parking info (no vehicles beyond certain point in Matheran)

**Option 3: Mix**
- Train to Neral + Shared jeep/cab to Matheran

### D. Important Info Cards
- Matheran rules (no vehicles, carry cash, no plastic)
- Best spots timings (sunrise at Panorama Point — reach by 5:30 AM 😱)
- Weather forecast section
- Emergency contacts

### E. Packing Checklist
Collaborative checklist per person:
- [ ] ID card
- [ ] Cash (ATM nahi milega!)
- [ ] Comfortable shoes
- [ ] Rain jacket / windcheater
- [ ] Power bank
- [ ] Sunscreen
- [ ] Water bottle
- [Custom items can be added]

### F. "The Rules" Section (Comedy)
Group-made rules displayed as a funny "constitution":
1. No one ditches without group consent
2. Expense app must be updated same day
3. No unlimited chai stops (max 3 per day)
4. Who gets lost pays next meal
5. [User can add more]

## UI Design
- Flowchart: Custom CSS/SVG connecting nodes with animated lines
- Cards with icons for each section
- Color-coded by category
- Mobile-first (everyone will use on phone during trip)

## API Routes
- `GET /api/trip-details` — get all sections
- `PUT /api/trip-details/[section]` — update a section
- `GET /api/packing` — packing list
- `PUT /api/packing/[id]` — check/uncheck item
