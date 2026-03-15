import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Simplify debts: reduce n×n matrix to minimum transactions
export function simplifyDebts(
  balances: Record<string, number>
): { from: string; to: string; amount: number }[] {
  const creditors: { id: string; amount: number }[] = []
  const debtors: { id: string; amount: number }[] = []

  for (const [id, balance] of Object.entries(balances)) {
    if (balance > 0.01) creditors.push({ id, amount: balance })
    else if (balance < -0.01) debtors.push({ id, amount: -balance })
  }

  const transactions: { from: string; to: string; amount: number }[] = []
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount)
    transactions.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(amount) })
    debtors[i].amount -= amount
    creditors[j].amount -= amount
    if (debtors[i].amount < 0.01) i++
    if (creditors[j].amount < 0.01) j++
  }

  return transactions
}

export const TRIP_MEMBERS = [
  'Saumyajeet', 'Vraj', 'Sarthak', 'Nandan', 'Tirth', 'Harshal', 'Hriday',
]

export const MEMBER_COLORS: Record<string, string> = {
  Saumyajeet: '#F4A261',
  Vraj:       '#52B788',
  Sarthak:    '#2D9CDB',
  Nandan:     '#9B5DE5',
  Tirth:      '#F15BB5',
  Harshal:    '#FEE440',
  Hriday:     '#00BBF9',
}

export const EXPENSE_CATEGORIES = [
  { value: 'food',   label: 'Food',   emoji: '🍕' },
  { value: 'travel', label: 'Travel', emoji: '🚂' },
  { value: 'stay',   label: 'Stay',   emoji: '🏨' },
  { value: 'fun',    label: 'Fun',    emoji: '🎉' },
  { value: 'misc',   label: 'Misc',   emoji: '💼' },
]

export const SPOT_TYPES = [
  { value: 'viewpoint', label: 'Viewpoint', emoji: '🏔️' },
  { value: 'activity',  label: 'Activity',  emoji: '🎯' },
  { value: 'food',      label: 'Food',      emoji: '🍽️' },
  { value: 'stay',      label: 'Stay',      emoji: '🏨' },
  { value: 'travel',    label: 'Travel',    emoji: '🚂' },
]

export const FUNNY_LOADING_MESSAGES = [
  'Asking Bhai for money... please hold 🙏',
  "Calculating who's the biggest kanjoos...",
  'Loading 7 pagalon ka plan...',
  'Dhundh raha hu chai ki dukaan...',
  'Convincing everyone to wake up for sunrise...',
  'Counting how many times Harshal said "baad mein deta hu"...',
]
