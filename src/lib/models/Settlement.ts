import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISettlement extends Document {
  from: mongoose.Types.ObjectId       // Member who pays back
  to: mongoose.Types.ObjectId         // Member who receives
  amount: number
  note: string
  recordedBy: mongoose.Types.ObjectId // User who marked it
  settledAt: Date
  createdAt: Date
  updatedAt: Date
}

const SettlementSchema = new Schema<ISettlement>(
  {
    from:       { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    to:         { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    amount:     { type: Number, required: true, min: 0 },
    note:       { type: String, default: '', trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    settledAt:  { type: Date, default: Date.now },
  },
  { timestamps: true }
)

SettlementSchema.index({ from: 1 })
SettlementSchema.index({ to: 1 })
SettlementSchema.index({ settledAt: -1 })

const Settlement: Model<ISettlement> =
  mongoose.models.Settlement ?? mongoose.model<ISettlement>('Settlement', SettlementSchema)

export default Settlement
