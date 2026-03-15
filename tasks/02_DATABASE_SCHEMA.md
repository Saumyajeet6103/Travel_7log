# TASK-02: Database Schema Design

## Goal
Design all MongoDB collections needed for the trip app.

## Collections

### 1. Members
```js
{
  _id: ObjectId,
  name: String,          // "Saumyajeet", "Vraj", etc.
  nickname: String,      // Set ONLY by Admin — "Paisa Udaane Wala", etc.
  emoji: String,         // Set ONLY by Admin — 🤑 💸 🗺️ etc.
  color: String,         // For avatar/tag color
  totalPaid: Number,     // Cached: total amount paid
  totalOwed: Number,     // Cached: total amount owed
}
```

### 2. Expenses
```js
{
  _id: ObjectId,
  title: String,          // "Lunch at Matheran hotel"
  amount: Number,         // 1400
  paidBy: ObjectId,       // ref: Member who paid
  category: String,       // enum: food, travel, stay, fun, misc
  splitType: String,      // "equal" | "custom"
  splits: [{
    member: ObjectId,
    amount: Number,
    settled: Boolean,
  }],
  date: Date,
  note: String,           // Optional funny note
  createdAt: Date,
}
```

### 3. Settlements
```js
{
  _id: ObjectId,
  from: ObjectId,         // ref: Member (who pays back)
  to: ObjectId,           // ref: Member (who receives)
  amount: Number,
  settledAt: Date,
  note: String,
}
```

### 4. Spots (Itinerary Items)
```js
{
  _id: ObjectId,
  name: String,           // "Charlotte Lake"
  description: String,
  type: String,           // enum: viewpoint, activity, food, stay, travel
  scheduledDate: Date,
  scheduledTime: String,
  status: String,         // enum: planned, in-progress, done, skipped
  doneBy: String,         // Who marked it done (timestamp context)
  funFact: String,        // Funny/interesting fact about the spot
  order: Number,          // For drag-reorder
  createdAt: Date,
}
```

### 5. TripDetails (single doc or few docs)
```js
{
  _id: ObjectId,
  section: String,         // "trains" | "stay" | "routes" | "rules" | "packing"
  title: String,
  content: Object,         // Flexible JSON for flowchart data
  order: Number,
}
```

### 6. Users (Auth)
```js
{
  _id: ObjectId,
  role: String,          // enum: "admin" | "member"
  username: String,      // "admin" | lowercase name e.g. "saumyajeet"
  passwordHash: String,  // bcrypt hashed
  email: String,         // for OTP password reset (null for admin)
  memberId: ObjectId,    // ref: Member (null for admin)
  createdAt: Date,
}
```
- **Admin account**: 1 super admin, no linked Member doc
- **Member accounts**: 7 accounts, each linked to their Member doc
- All 7 start with same shared initial password (Option A, confirmed)
- Passwords stored hashed with bcrypt (never plaintext)
- Sessions managed via JWT stored in httpOnly cookie

### 7. OTP Tokens (Password Reset)
```js
{
  _id: ObjectId,
  userId: ObjectId,    // ref: Users
  otpHash: String,     // bcrypt hashed 6-digit OTP
  expiresAt: Date,     // 10 minutes TTL
  used: Boolean,
}
```
- OTP sent to member's registered email via Resend API
- Expires in 10 min, single-use, hashed in DB

---

## Indexes
- Expenses: `paidBy`, `date`
- Spots: `status`, `scheduledDate`, `order`
- Settlements: `from`, `to`
- Users: `username` (unique)

## Seed Data
- Pre-seed 7 members with names, nicknames, emojis
- Pre-seed trip details (trains, stay, routes) from user inputs
- Pre-seed key Matheran spots (Charlotte Lake, Echo Point, etc.)
