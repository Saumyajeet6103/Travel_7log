# TASK-04: Expense Tracker (Splitwise Clone)

## Goal
Full Splitwise-like expense tracker customized for the 7-member trip.

## Pages / Components

### A. Expense Dashboard (`/expenses`)
- **Summary Bar**: Total trip spend, Your share, You owe, You get back
- **Balance Overview**: Visual bar/chart per person (who owes what)
- **Category Breakdown**: Pie/donut chart (Food 40%, Travel 30%, Stay 20%, Fun 10%)
- **Recent Expenses List**: Card-based list, scrollable
- **+ Add Expense Button**: Opens modal

### B. Add Expense Modal
Fields:
- Title (text)
- Amount (number)
- Paid By (dropdown — 7 members)
- Category (icon picker: 🍕 Food, 🚂 Travel, 🏨 Stay, 🎉 Fun, 💼 Misc)
- Split Type: Equal / Custom
  - Equal: auto-splits among selected members (checkbox multi-select)
  - Custom: input per person
- Date (default today)
- Optional note/comment

Validation + funny error messages:
- "Bhai amount bhool gaya?" (empty amount)
- "Kisne diya? Aakash se paisa nahi girta!" (no payer selected)

### C. Expense Detail View
- Full breakdown of who owes what for that expense
- Edit / Delete options
- "Share" button (copy text summary)

### D. Balances Tab
- Net balance per person (simplified debts)
- "Settle Up" flow:
  - Who pays whom, how much
  - Mark as settled
  - Toast: "💸 Transaction complete! Ek burden kam hua!"

### E. Settlement History
- Log of all settlements
- Filter by member

## Business Logic
- **Simplified debt algorithm**: Reduce n×n matrix to minimum transactions
  - Example: If A owes B ₹100 and B owes C ₹100, result is A pays C ₹100
- **Equal split**: amount / selected members (round to 2 decimal, remainder to payer)
- **Running totals**: Cached on Member doc, updated on every add/settle

## API Routes
- `GET /api/expenses` — list all
- `POST /api/expenses` — create new
- `PUT /api/expenses/[id]` — edit
- `DELETE /api/expenses/[id]` — delete
- `GET /api/balances` — computed balances
- `POST /api/settlements` — mark settled

## Funny Extras
- "Biggest Spender" badge on member who paid most
- "Biggest Freeloader" badge on member who contributed least (with love)
- Random funny categories: "Dhokla Tax", "Peak Point Entry", "Bhai ne khud ke liye kharida"
- Expense total milestone messages: "₹5000 ho gaye bhai, ab serious ho jao 😬"
