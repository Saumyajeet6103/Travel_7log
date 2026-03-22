export interface PopulatedMember {
  _id: string
  name: string
  emoji: string
  color: string
  nickname: string
}

export interface PopulatedSplit {
  member: PopulatedMember
  amount: number
  settled: boolean
}

export interface EditEntry {
  editedBy: string
  editedAt: string
  changes: string
}

export interface PopulatedExpense {
  _id: string
  title: string
  amount: number
  paidBy: PopulatedMember
  category: 'food' | 'travel' | 'stay' | 'fun' | 'misc'
  splitType: 'equal' | 'custom'
  splits: PopulatedSplit[]
  date: string
  note: string
  createdBy: string
  lastEditedBy: string
  editHistory: EditEntry[]
  createdAt: string
}

export interface MemberBalance {
  _id: string
  name: string
  emoji: string
  color: string
  nickname: string
  totalPaid: number
  totalOwed: number
  netBalance: number   // positive = gets back, negative = owes
}

export interface SettlementTransaction {
  from: string        // member _id
  fromName: string
  fromEmoji: string
  to: string          // member _id
  toName: string
  toEmoji: string
  amount: number
}

export interface PopulatedSettlement {
  _id: string
  from: PopulatedMember
  to: PopulatedMember
  amount: number
  note: string
  settledAt: string
  createdAt: string
}
