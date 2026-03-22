import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISplit {
  member: mongoose.Types.ObjectId
  amount: number
  settled: boolean
}

export interface IEditEntry {
  editedBy: string       // member name
  editedAt: Date
  changes: string        // short summary like "amount: ₹500→₹600"
}

export interface IExpense extends Document {
  title: string
  amount: number
  paidBy: mongoose.Types.ObjectId
  category: 'food' | 'travel' | 'stay' | 'fun' | 'misc'
  splitType: 'equal' | 'custom'
  splits: ISplit[]
  date: Date
  note: string
  createdBy: mongoose.Types.ObjectId   // User who added the entry
  lastEditedBy: string                 // member name who last edited
  editHistory: IEditEntry[]
  createdAt: Date
  updatedAt: Date
}

const SplitSchema = new Schema<ISplit>(
  {
    member:   { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    amount:   { type: Number, required: true, min: 0 },
    settled:  { type: Boolean, default: false },
  },
  { _id: false }
)

const ExpenseSchema = new Schema<IExpense>(
  {
    title:     { type: String, required: true, trim: true },
    amount:    { type: Number, required: true, min: 0 },
    paidBy:    { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    category:  { type: String, enum: ['food', 'travel', 'stay', 'fun', 'misc'], default: 'misc' },
    splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
    splits:    { type: [SplitSchema], default: [] },
    date:      { type: Date, default: Date.now },
    note:      { type: String, default: '', trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastEditedBy: { type: String, default: '' },
    editHistory: {
      type: [{
        editedBy:  { type: String, required: true },
        editedAt:  { type: Date, default: Date.now },
        changes:   { type: String, default: '' },
      }],
      default: [],
    },
  },
  { timestamps: true }
)

ExpenseSchema.index({ paidBy: 1 })
ExpenseSchema.index({ date: -1 })
ExpenseSchema.index({ category: 1 })

const Expense: Model<IExpense> =
  mongoose.models.Expense ?? mongoose.model<IExpense>('Expense', ExpenseSchema)

export default Expense
