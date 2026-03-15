/**
 * Seed script — run once to populate MongoDB with initial data.
 * Usage: npx tsx scripts/seed.ts
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Inline models to avoid Next.js module resolution
import('../src/lib/models/Member').then(() => {})
import('../src/lib/models/User').then(() => {})
import('../src/lib/models/Spot').then(() => {})
import('../src/lib/models/TripDetail').then(() => {})
import('../src/lib/models/PackingItem').then(() => {})

const MONGODB_URI = process.env.MONGODB_URI!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!
const MEMBER_INIT_PASSWORD = process.env.MEMBER_INIT_PASSWORD!

if (!MONGODB_URI || !ADMIN_PASSWORD || !MEMBER_INIT_PASSWORD) {
  console.error('❌ Missing env vars. Check .env.local')
  process.exit(1)
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const MEMBERS = [
  { name: 'Saumyajeet', nickname: 'Treasurer Ji',       emoji: '💰', color: '#F4A261' },
  { name: 'Vraj',       nickname: 'Plan Banaane Wala',  emoji: '🗺️', color: '#52B788' },
  { name: 'Sarthak',    nickname: 'Chai Specialist',    emoji: '☕', color: '#2D9CDB' },
  { name: 'Nandan',     nickname: 'DSA in Real Life',   emoji: '🧠', color: '#9B5DE5' },
  { name: 'Tirth',      nickname: 'Camera Ready',       emoji: '📸', color: '#F15BB5' },
  { name: 'Harshal',    nickname: 'Baad Mein Deta Hu',  emoji: '😅', color: '#FEE440' },
  { name: 'Hriday',     nickname: 'Sone Wala',          emoji: '😴', color: '#00BBF9' },
]

const SPOTS = [
  { name: 'Panorama Point',            type: 'viewpoint', day: 'Day 2', scheduledTime: '5:30 AM',  order: 1,  funFact: 'Sunrise here hits different. Worth waking up for. Set 5 alarms. Seriously.' },
  { name: 'Toy Train Ride',            type: 'travel',    day: 'Day 1', scheduledTime: 'Arrival',  order: 2,  funFact: "World's narrowest gauge railway. Slower than your WiFi at 2 AM 🚂" },
  { name: 'Central Market + Chikki',   type: 'food',      day: 'Day 1', scheduledTime: '7:00 PM',  order: 3,  funFact: 'Matheran famous chikki. Buy for family or eat it all yourself. No judgment. 🍬' },
  { name: 'Echo Point',                type: 'viewpoint', day: 'Day 2', scheduledTime: '9:00 AM',  order: 4,  funFact: 'Scream bhai ka naam. Pahaad wapas bolega. Experiment guaranteed. 📣' },
  { name: 'Charlotte Lake',            type: 'viewpoint', day: 'Day 2', scheduledTime: '10:30 AM', order: 5,  funFact: "Matheran's main lake. Good for vibes, photos, and pretending you're a poet." },
  { name: 'Horse Riding',              type: 'activity',  day: 'Day 2', scheduledTime: '8:00 AM',  order: 6,  funFact: 'Ghoda tumhe nahi le jaata, tum ghode ko le jaate ho. Maybe. 🐎' },
  { name: 'Louisa Point',              type: 'viewpoint', day: 'Day 2', scheduledTime: '12:00 PM', order: 7,  funFact: 'One of the longest views in Matheran. Bring water and your existential thoughts.' },
  { name: 'Porcupine Point (Sunset)',  type: 'viewpoint', day: 'Day 2', scheduledTime: '6:00 PM',  order: 8,  funFact: "Best sunset point in Matheran. Miss it and the group will never forgive you. 🌄" },
  { name: 'One Tree Hill Point',       type: 'viewpoint', day: 'Day 3', scheduledTime: '9:00 AM',  order: 9,  funFact: 'Less crowded, very peaceful. Great if you survived Day 2 without losing anyone.' },
  { name: 'Alexander Point',           type: 'viewpoint', day: 'Day 3', scheduledTime: '11:00 AM', order: 10, funFact: 'Decent views, less hyped. Perfect for the group philosopher.' },
  { name: 'Gateway of India',          type: 'activity',  day: 'Day 4', scheduledTime: 'Morning',  order: 11, funFact: 'Tourist trap but mandatory. Written in the bro code since 1924. 🏛️' },
  { name: 'Marine Drive',              type: 'activity',  day: 'Day 4', scheduledTime: 'Evening',  order: 12, funFact: "Queen's Necklace. Sit, stare at the sea, contemplate all your life choices. 🌊" },
  { name: 'Mumbai Street Food Tour',   type: 'food',      day: 'Day 4', scheduledTime: 'Afternoon',order: 13, funFact: 'Vada Pav, Pav Bhaji, Bhel. Eat everything. No regrets. Your stomach will thank you later. 🍽️' },
]

const TRIP_DETAILS = [
  {
    section: 'trains',
    title: 'Train Journey Details',
    icon: '🚂',
    order: 1,
    content: {
      legs: [
        {
          id: 'vad_mum',
          label: 'Vadodara → Mumbai',
          from: 'Vadodara Junction',
          to: 'Mumbai Central / CSTM',
          date: '2026-03-25',
          departureTime: 'TBD',
          arrivalTime: 'TBD',
          trainName: 'TBD',
          trainNumber: 'TBD',
          pnr: '',
          platform: '',
          notes: 'Night train. Try to sleep. Someone will snore. 😴',
        },
        {
          id: 'mum_ner',
          label: 'Mumbai → Neral',
          from: 'CSTM / Dadar',
          to: 'Neral Junction',
          date: '2026-03-26',
          departureTime: 'TBD',
          arrivalTime: 'TBD',
          trainName: 'TBD',
          trainNumber: 'TBD',
          pnr: '',
          platform: '',
          notes: 'Central Railway. Neral is the base for Matheran.',
        },
        {
          id: 'ner_mat',
          label: 'Neral → Matheran',
          from: 'Neral',
          to: 'Matheran',
          date: '2026-03-26',
          departureTime: 'TBD',
          arrivalTime: 'TBD',
          trainName: 'Matheran Hill Railway (Toy Train)',
          trainNumber: '',
          pnr: '',
          platform: '',
          notes: 'Mini toy train OR shared jeep. Will confirm. 🚂',
        },
        {
          id: 'mum_vad',
          label: 'Mumbai → Vadodara (Return)',
          from: 'Mumbai Central / CSTM',
          to: 'Vadodara Junction',
          date: '2026-03-29',
          departureTime: 'TBD (Night)',
          arrivalTime: 'TBD (Morning 30th)',
          trainName: 'TBD',
          trainNumber: 'TBD',
          pnr: '',
          platform: '',
          notes: 'Night train back. Trip officially ends. Sadness begins. 😢',
        },
      ],
    },
  },
  {
    section: 'stay_matheran',
    title: 'Stay — Matheran',
    icon: '🏡',
    order: 2,
    content: {
      hotelName: 'TBD',
      address: 'Matheran, Maharashtra',
      checkIn: '2026-03-26',
      checkOut: '2026-03-28',
      checkInTime: 'TBD',
      checkOutTime: 'TBD',
      confirmationNumber: '',
      contactNumber: '',
      costPerHead: 0,
      totalCost: 0,
      rooms: [],
      notes: 'No vehicles allowed in Matheran. Plan accordingly.',
    },
  },
  {
    section: 'stay_mumbai',
    title: 'Stay — Mumbai',
    icon: '🏙️',
    order: 3,
    content: {
      hotelName: 'TBD',
      address: 'Mumbai, Maharashtra',
      checkIn: '2026-03-28',
      checkOut: '2026-03-29',
      checkInTime: 'TBD',
      checkOutTime: 'TBD',
      confirmationNumber: '',
      contactNumber: '',
      costPerHead: 0,
      totalCost: 0,
      rooms: [],
      notes: 'One night in Mumbai. Keep bags light.',
    },
  },
  {
    section: 'routes',
    title: 'Getting Around',
    icon: '🗺️',
    order: 4,
    content: {
      matheranRules: [
        'No motor vehicles allowed inside Matheran',
        'Only walking or horse riding within Matheran',
        'Carry cash — limited ATMs, no UPI everywhere',
        'No plastic bags — eco-sensitive zone',
        'Entry gate has fee — carry ID',
      ],
      neralToMatheran: [
        { option: 'Toy Train', time: '~2 hrs', cost: '~₹40-90', notes: 'Scenic but slow. Book in advance.' },
        { option: 'Shared Jeep', time: '~45 min', cost: '~₹100-150/head', notes: 'Faster. Goes up to Dasturi Naka, walk 2km.' },
        { option: 'Walk', time: '~3-4 hrs', cost: 'Free 💀', notes: 'Only if you are Harshal (unlikely).' },
      ],
    },
  },
  {
    section: 'rules',
    title: 'Group Constitution 📜',
    icon: '📜',
    order: 5,
    content: {
      rules: [
        'No one ditches without group consent. Violators buy chai for everyone.',
        'Expense app must be updated same day. No backlogs.',
        'Max 3 chai stops per day. We are on a schedule, people.',
        'Who gets lost pays for the next meal. GPS exists for a reason.',
        'Sunrise at Panorama Point is MANDATORY. No negotiations at 4 AM.',
        'Group photo at every major spot. Hriday cannot sleep through these.',
        'Last one to wake up on Day 2 gets the window seat on the return train. Not the good one.',
        'What happens on this trip, gets posted on Instagram immediately. Privacy is overrated.',
      ],
    },
  },
  {
    section: 'mumbai_explore',
    title: 'Mumbai Day Plan',
    icon: '🌆',
    order: 6,
    content: {
      date: '2026-03-29',
      plan: [
        { time: 'Morning',   activity: 'Breakfast + freshen up at stay' },
        { time: '10:00 AM',  activity: 'Gateway of India + Colaba area' },
        { time: '12:30 PM',  activity: 'Lunch — street food near Crawford Market' },
        { time: '2:00 PM',   activity: 'Marine Drive walk' },
        { time: '4:00 PM',   activity: 'Juhu Beach or Bandra (group vote)' },
        { time: '7:00 PM',   activity: 'Dinner — proper Mumbai restaurant' },
        { time: '9:00 PM',   activity: 'Head to station for night train' },
      ],
      notes: 'This is a rough plan. Knowing us, we will be 2 hours behind by 10 AM.',
    },
  },
]

const PACKING_ITEMS = [
  // Essentials
  { label: 'Government ID Card',    category: 'essentials', isGlobal: true,  order: 1  },
  { label: 'Cash (₹2000+ minimum)', category: 'essentials', isGlobal: true,  order: 2  },
  { label: 'Phone + Charger',       category: 'essentials', isGlobal: true,  order: 3  },
  { label: 'Power Bank',            category: 'essentials', isGlobal: true,  order: 4  },
  { label: 'Water Bottle',          category: 'essentials', isGlobal: true,  order: 5  },
  { label: 'Basic Medicines',       category: 'essentials', isGlobal: true,  order: 6  },
  { label: 'Train Tickets / PNR',   category: 'essentials', isGlobal: true,  order: 7  },
  // Clothes
  { label: 'Comfortable Walking Shoes', category: 'clothes', isGlobal: true, order: 8  },
  { label: 'Light Jacket / Windcheater',category: 'clothes', isGlobal: true, order: 9  },
  { label: 'Socks (extra pair)',    category: 'clothes', isGlobal: true,     order: 10 },
  { label: 'Sunglasses',           category: 'clothes', isGlobal: true,     order: 11 },
  // Gadgets
  { label: 'Earphones',            category: 'gadgets', isGlobal: false,    order: 12 },
  { label: 'Camera (if you have)', category: 'gadgets', isGlobal: false,    order: 13 },
  // Misc
  { label: 'Sunscreen',            category: 'misc', isGlobal: true,        order: 14 },
  { label: 'Hand Sanitizer',       category: 'misc', isGlobal: true,        order: 15 },
  { label: 'Snacks for train',     category: 'misc', isGlobal: true,        order: 16 },
  { label: 'Small Backpack / Daypack', category: 'misc', isGlobal: true,    order: 17 },
  { label: 'Plastic bag (for wet/dirty stuff)', category: 'misc', isGlobal: true, order: 18 },
]

// ─── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected\n')

  const { default: Member } = await import('../src/lib/models/Member')
  const { default: User }   = await import('../src/lib/models/User')
  const { default: Spot }   = await import('../src/lib/models/Spot')
  const { default: TripDetail } = await import('../src/lib/models/TripDetail')
  const { default: PackingItem } = await import('../src/lib/models/PackingItem')

  const adminHash  = await bcrypt.hash(ADMIN_PASSWORD, 12)
  const memberHash = await bcrypt.hash(MEMBER_INIT_PASSWORD, 12)

  // ── 1. Admin user ──────────────────────────────────────────────────────────
  const existingAdmin = await User.findOne({ username: 'admin' })
  if (!existingAdmin) {
    await User.create({ role: 'admin', username: 'admin', passwordHash: adminHash, email: null, memberId: null })
    console.log('✅ Admin user created')
  } else {
    console.log('⏭️  Admin user already exists — skipping')
  }

  // ── 2. Members + Member users ──────────────────────────────────────────────
  for (const m of MEMBERS) {
    const existing = await Member.findOne({ name: m.name })
    let memberId: mongoose.Types.ObjectId

    if (!existing) {
      const member = await Member.create(m)
      memberId = member._id as mongoose.Types.ObjectId
      console.log(`✅ Member created: ${m.name}`)
    } else {
      memberId = existing._id as mongoose.Types.ObjectId
      console.log(`⏭️  Member ${m.name} already exists — skipping`)
    }

    const username = m.name.toLowerCase()
    const existingUser = await User.findOne({ username })
    if (!existingUser) {
      await User.create({ role: 'member', username, passwordHash: memberHash, email: null, memberId })
      console.log(`✅ User created: ${username}`)
    } else {
      console.log(`⏭️  User ${username} already exists — skipping`)
    }
  }

  // ── 3. Spots ───────────────────────────────────────────────────────────────
  const spotCount = await Spot.countDocuments()
  if (spotCount === 0) {
    await Spot.insertMany(SPOTS)
    console.log(`✅ ${SPOTS.length} spots seeded`)
  } else {
    console.log(`⏭️  Spots already exist (${spotCount}) — skipping`)
  }

  // ── 4. Trip details ────────────────────────────────────────────────────────
  for (const td of TRIP_DETAILS) {
    await TripDetail.findOneAndUpdate(
      { section: td.section },
      td,
      { upsert: true, returnDocument: 'after' }
    )
  }
  console.log(`✅ ${TRIP_DETAILS.length} trip detail sections seeded`)

  // ── 5. Packing list ────────────────────────────────────────────────────────
  const packCount = await PackingItem.countDocuments()
  if (packCount === 0) {
    await PackingItem.insertMany(PACKING_ITEMS.map(p => ({ ...p, addedBy: 'admin', checkedBy: [] })))
    console.log(`✅ ${PACKING_ITEMS.length} packing items seeded`)
  } else {
    console.log(`⏭️  Packing items already exist (${packCount}) — skipping`)
  }

  console.log('\n🎉 Seed complete! 7 Log Matheran 2026 is ready to roll.\n')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
