import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPersonalExpense extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  amount: number
  category: 'food' | 'travel' | 'stay' | 'fun' | 'shopping' | 'misc'
  date: Date
  note: string
  createdAt: Date
  updatedAt: Date
}

const PersonalExpenseSchema = new Schema<IPersonalExpense>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:    { type: String, required: true, trim: true },
    amount:   { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['food', 'travel', 'stay', 'fun', 'shopping', 'misc'], default: 'misc' },
    date:     { type: Date, default: Date.now },
    note:     { type: String, default: '', trim: true },
  },
  { timestamps: true }
)

PersonalExpenseSchema.index({ userId: 1, date: -1 })

const PersonalExpense: Model<IPersonalExpense> =
  mongoose.models.PersonalExpense ?? mongoose.model<IPersonalExpense>('PersonalExpense', PersonalExpenseSchema)

export default PersonalExpense
