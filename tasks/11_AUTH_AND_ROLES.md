# TASK-11: Authentication & Role System

## Goal
Simple login system with two roles — Super Admin and Member (7 log).
No public access. Everyone logs in with their own account.

## Roles

### Super Admin (1 account)
- Username: `admin` (or custom — user to confirm)
- Full access to everything
- **Exclusive powers**:
  - Set / edit Member nicknames
  - Set / edit Member emojis
  - Add / edit / delete Trip Details & flowchart data
  - Add / delete Itinerary spots
  - Delete any expense
  - Manage packing list items
  - Seed / reset data
- Admin panel section visible only when logged in as admin

### Members (7 accounts)
One account per person:
| Username      | Linked To  |
|---------------|------------|
| saumyajeet    | Saumyajeet |
| vraj          | Vraj       |
| sarthak       | Sarthak    |
| nandan        | Nandan     |
| tirth         | Tirth      |
| harshal       | Harshal    |
| hriday        | Hriday     |

**Member permissions**:
- View all pages
- Add expenses (any member can add on behalf of group)
- Mark itinerary spots as done/skipped
- Check off packing items
- Mark settlements
- Cannot edit nicknames/emojis
- Cannot delete others' expenses
- Cannot edit trip details/flowchart

---

## Auth Implementation

### Stack
- `bcryptjs` — password hashing
- `jsonwebtoken` — JWT generation
- httpOnly cookie — token storage (secure, no JS access)
- Next.js middleware — route protection

### Pages
- `/login` — Single login page for everyone (admin + all 7 members)
  - Username + password fields
  - Clean, trip-themed design
  - "Bhai login kar pehle 🔐" if accessing protected page without login
  - No "Forgot password" (trip app, just share passwords via WhatsApp)

### API Routes
- `POST /api/auth/login` — validate creds, return JWT cookie
- `POST /api/auth/logout` — clear cookie
- `GET /api/auth/me` — return current user info (role, name, memberId)

### Middleware (`middleware.ts`)
- Protect all routes except `/login`
- Read JWT from cookie, verify, attach user to request
- Redirect to `/login` if no valid token

### Client-side
- `useAuth()` hook — exposes `{ user, role, isAdmin, logout }`
- Admin-only UI elements hidden via `isAdmin` check (not just CSS hidden — conditionally rendered)
- Current logged-in member highlighted on member cards

---

## Admin Panel (`/admin`)
Accessible only to admin role. Sections:

### Member Management
- Table of all 7 members
- Editable: Nickname, Emoji, Color
- "Save" button per row
- Preview of how card looks

### App Settings
- Trip name, dates (editable)
- Reset all expenses (with confirmation: "BHAI SERIOUSLY? Type 'haan bhai' to confirm")
- Reset all settlements
- Export all data as JSON (backup)

### Seed / Init Tools
- "Seed Members" — populate 7 members if DB is empty
- "Seed Spots" — populate default Matheran spots
- "Seed Trip Details" — populate travel flowchart data

---

## Password Strategy
> ✅ CONFIRMED: Option A — One shared initial password for all 7 members + individual usernames.
> Members can reset their own password via email OTP after first login.
> Admin has a separate stronger password.

### Initial Setup
- All 7 members start with the same shared password (e.g., `Matheran2026`)
- Each member's username is their lowercase name (e.g., `saumyajeet`, `vraj`)
- Admin has a separate credential entirely

### Password Reset Flow (Email OTP)
1. Member clicks "Forgot Password" on login page
2. Enters their username
3. OTP (6-digit code) sent to their registered email
4. Enter OTP → set new password
5. OTP expires in 10 minutes, single use

### Email Service
- **Recommended**: Resend (resend.com) — free tier 3000 emails/month, simple API, works great with Next.js
- Alternative: Nodemailer + Gmail SMTP (free but more setup)
- OTP stored temporarily in DB with expiry

### Env Vars for Auth
```env
JWT_SECRET=<random-long-string-generate-this>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<confirmed-by-user>       # bcrypt hashed at seed time — DO NOT commit
MEMBER_INIT_PASSWORD=<confirmed-by-user> # bcrypt hashed at seed time — DO NOT commit
RESEND_API_KEY=<get-from-resend.com>     # for OTP emails
```
> Passwords confirmed by user. Store ONLY in .env.local — never commit to git.

---

## UX Notes
- After login, redirect to home (`/`)
- Login page: "7 Log - Members Only 🔐" with trip logo
- "Forgot Password?" link → enters email OTP reset flow
- Logout button in navbar (top right)
- Current user shown in navbar: "Hey Saumyajeet 👋"
- If admin logged in: "Admin Mode 🛡️" badge in navbar
- First-time login nudge: "Bhai apna password badal le! 🔑" toast suggestion

---

## DB Addition: OTP Tokens
```js
{
  _id: ObjectId,
  userId: ObjectId,     // ref: Users
  otp: String,          // 6-digit hashed OTP
  expiresAt: Date,      // 10 minutes from creation
  used: Boolean,
}
```

---

## Inputs Still Needed
- [ ] Admin username preference: `admin` or something custom?
- [ ] Admin password (env var — never in code, share privately)
- [ ] 7 member emails (for OTP reset — user will provide later)
- [ ] Email service preference: Resend (recommended) or Gmail SMTP?
  - If Resend: RESEND_API_KEY (free at resend.com)
  - If Gmail: Gmail address + App Password
