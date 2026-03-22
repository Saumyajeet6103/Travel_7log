import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDeleteLogSplit {
  memberName: string
  memberEmoji: string
  amount: number
}

export interface IDeleteLogEdit {
  editedBy: string
  editedAt: Date
  changes: string
}

export interface IDeleteLog extends Document {
  expenseTitle: string
  expenseAmount: number
  category: string
  paidByName: string
  paidByEmoji: string
  expenseDate: Date
  expenseNote: string
  splitType: string
  splits: IDeleteLogSplit[]
  editHistory: IDeleteLogEdit[]
  deletedBy: string
  deletedAt: Date
  splitCount: number
}

const DeleteLogSchema = new Schema<IDeleteLog>(
  {
    expenseTitle:  { type: String, required: true },
    expenseAmount: { type: Number, required: true },
    category:      { type: String, default: 'misc' },
    paidByName:    { type: String, required: true },
    paidByEmoji:   { type: String, default: '' },
    expenseDate:   { type: Date },
    expenseNote:   { type: String, default: '' },
    splitType:     { type: String, default: 'equal' },
    splits: {
      type: [{
        memberName:  { type: String, required: true },
        memberEmoji: { type: String, default: '' },
        amount:      { type: Number, required: true },
      }],
      default: [],
    },
    editHistory: {
      type: [{
        editedBy: { type: String, required: true },
        editedAt: { type: Date, default: Date.now },
        changes:  { type: String, default: '' },
      }],
      default: [],
    },
    deletedBy:     { type: String, required: true },
    deletedAt:     { type: Date, default: Date.now },
    splitCount:    { type: Number, default: 0 },
  },
  { timestamps: true }
)

DeleteLogSchema.index({ deletedAt: -1 })

const DeleteLog: Model<IDeleteLog> =
  mongoose.models.DeleteLog ?? mongoose.model<IDeleteLog>('DeleteLog', DeleteLogSchema)

export default DeleteLog
